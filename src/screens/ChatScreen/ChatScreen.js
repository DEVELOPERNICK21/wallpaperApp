import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Alert,
  Linking,
} from 'react-native';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  arrayUnion,
  getDoc,
  serverTimestamp,
  deleteDoc,
} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {colors} from '../../assets/color';
import MyStatusBar from '../../component/StatusBar';
import storage from '@react-native-firebase/storage';
import {launchImageLibrary} from 'react-native-image-picker';

const ChatScreen = ({route}) => {
  const {chatId, groupNameed} = route.params;
  const firestore = getFirestore();
  const currentUser = auth().currentUser; // Logged-in user info

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const flatListRef = useRef(null);

  const typingAnimation = useRef(new Animated.Value(0)).current; // Animation ref
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 300); // Delay for smooth scrolling
    }
  }, [messages]);

  useEffect(() => {
    // Fetch Group Name
    const fetchGroupName = async () => {
      const groupDoc = await getDoc(doc(firestore, 'GroupChats', chatId));
      if (groupDoc.exists()) {
        setGroupName(groupDoc.data().name);
      } else {
        setGroupName('Group Chat');
      }
    };

    fetchGroupName();

    // Listen for Messages
    const q = query(
      collection(firestore, `GroupChats/${chatId}/Messages`),
      orderBy('createdAt', 'asc'),
    );
    const unsubscribe = onSnapshot(q, snapshot => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(newMessages);
      markMessagesAsSeen(newMessages);
    });

    // Listen for Typing Status
    const typingRef = doc(firestore, 'GroupChats', chatId);
    const unsubscribeTyping = onSnapshot(typingRef, snapshot => {
      const data = snapshot.data();
      if (data?.typingUser && data.typingUser !== currentUser.displayName) {
        setTypingUser(data.typingUser);
        setIsTyping(true);
        fadeInTyping();
      } else {
        fadeOutTyping();
      }
    });

    return () => {
      unsubscribe();
      unsubscribeTyping();
    };
  }, [chatId]);

  // Function to mark messages as seen
  const markMessagesAsSeen = async messages => {
    for (let message of messages) {
      if (!message.seenBy?.includes(currentUser.uid)) {
        const messageRef = doc(
          firestore,
          `GroupChats/${chatId}/Messages`,
          message.id,
        );
        await updateDoc(messageRef, {
          seenBy: arrayUnion(currentUser.uid),
        });
      }
    }
  };

  // Handle Typing
  const handleTyping = async text => {
    setMessageText(text);
    const typingRef = doc(firestore, 'GroupChats', chatId);
    await updateDoc(typingRef, {
      typingUser: text ? currentUser.displayName : '',
    });
  };

  // Send Message
  const sendImageMessage = async imageUrl => {
    await addDoc(collection(firestore, `GroupChats/${chatId}/Messages`), {
      imageUrl: imageUrl,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'Unknown',
      createdAt: serverTimestamp(),
      seenBy: [currentUser.uid],
    });

    await updateDoc(doc(firestore, 'GroupChats', chatId), {typingUser: ''});
  };

  // Animations
  const fadeInTyping = () => {
    Animated.timing(typingAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const fadeOutTyping = () => {
    Animated.timing(typingAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsTyping(false));
  };

  // delete Message
  const deleteMessage = async message => {
    Alert.alert(
      'Delete Message',
      'Do you want to delete this message?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete for Me',
          onPress: () => deleteForMe(message.id),
        },
        message.senderId === currentUser.uid
          ? {
              text: 'Delete for Everyone',
              onPress: () => deleteForEveryone(message.id),
            }
          : null,
      ].filter(Boolean),
    );
  };

  const deleteForMe = async messageId => {
    setMessages(prevMessages =>
      prevMessages.filter(message => message.id !== messageId),
    );
  };

  const deleteForEveryone = async messageId => {
    await deleteDoc(doc(firestore, `GroupChats/${chatId}/Messages`, messageId));
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      uploadImage(imageUri);
    }
  };

  const uploadImage = async uri => {
    const fileName = `chat_images/${chatId}/${Date.now()}.jpg`;
    const reference = storage().ref(fileName);

    try {
      await reference.putFile(uri);
      const imageUrl = await reference.getDownloadURL();
      sendImageMessage(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    // Add the message to Firestore
    const messageRef = await addDoc(
      collection(firestore, `GroupChats/${chatId}/Messages`),
      {
        text: messageText,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Unknown',
        createdAt: serverTimestamp(),
        seenBy: [currentUser.uid], // Mark sender as seen by default
      },
    );

    setMessageText('');
    // Reset typing status
    await updateDoc(doc(firestore, 'GroupChats', chatId), {typingUser: ''});

    // Fetch the FCM tokens of other users in the chat
    const groupDoc = await getDoc(doc(firestore, 'GroupChats', chatId));
    if (groupDoc.exists()) {
      const members = groupDoc.data().members || [];

      // Fetch FCM tokens for each member except the sender
      const tokens = [];
      for (const memberId of members) {
        if (memberId !== currentUser.uid) {
          const userDoc = await getDoc(doc(firestore, 'users', memberId));
          if (userDoc.exists() && userDoc.data().fcmToken) {
            tokens.push(userDoc.data().fcmToken);
          }
        }
      }

      // Send push notifications
      for (const token of tokens) {
        sendPushNotification(token, currentUser.displayName, messageText);
      }
    }

    setMessageText('');
  };

  // Function to send push notifications
  const sendPushNotification = async (token, senderName, message) => {
    fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=YOUR_SERVER_KEY`, // Replace with your FCM server key
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title: 'Wallpaper',
          body: `${senderName}: ${message}`,
          sound: 'default',
        },
        data: {message},
      }),
    }).catch(error => console.error('Error sending notification:', error));
  };

  const extractUrls = text => {
    const urlRegex = /(https?:\/\/[^\s]+)/g; // Regex to find URLs
    return text.match(urlRegex);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{flex: 1}}>
      <View style={styles.container}>
        <MyStatusBar
          translucent={true}
          backgroundColor={colors?.primaryColor}
          barStyle="dark-content"
        />
        {/* Group Name Header */}
        <View style={styles.header}>
          <Text style={styles.groupName}>
            {groupName ? groupName : groupNameed}
          </Text>
        </View>

        {/* Messages List */}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({item}) => {
            const isCurrentUser = item.senderId === currentUser.uid;
            const messageTime = item.createdAt?.seconds
              ? new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Sending...';

            return (
              <TouchableOpacity onLongPress={() => deleteMessage(item)}>
                <View
                  style={[
                    styles.messageContainer,
                    isCurrentUser ? styles.sentMessage : styles.receivedMessage,
                  ]}>
                  {!isCurrentUser && (
                    <Text style={styles.senderName}>{item.senderName}</Text>
                  )}

                  {item.imageUrl ? (
                    <Image
                      source={{uri: item.imageUrl}}
                      style={styles.chatImage}
                    />
                  ) : (
                    <Text style={styles.message}>
                      {item.text.split(' ').map((word, index) => {
                        const urls = extractUrls(word);
                        if (urls) {
                          return (
                            <Text
                              key={index}
                              style={styles.urlText} // Style for clickable links
                              onPress={() => Linking.openURL(word)}>
                              {word}{' '}
                            </Text>
                          );
                        }
                        return word + ' '; // Add spaces back between words
                      })}
                    </Text>
                  )}

                  <Text style={styles.seenByText}>
                    {messageTime} {' • '}
                    {item.seenBy.length > 1
                      ? `Seen by ${item.seenBy.length} users`
                      : item.seenBy.includes(currentUser.uid)
                      ? 'Seen by you'
                      : 'Not seen yet'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{paddingBottom: 80}}
        />

        {/* Typing Indicator (Animated) */}
        {isTyping && (
          <Animated.View
            style={[styles.typingIndicator, {opacity: typingAnimation}]}>
            <Text style={styles.typingText}>{typingUser} is typing...</Text>
          </Animated.View>
        )}

        {/* Input Field */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={pickImage}
            style={styles.imagePickerButton}>
            <Text style={styles.imagePickerText}>📷</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor="#999"
          />

          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  header: {
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: colors?.primaryColor,
  },
  groupName: {fontSize: 18, fontWeight: 'bold', color: colors?.white},
  messageContainer: {maxWidth: '75%', padding: 10, margin: 5, borderRadius: 10},
  sentMessage: {alignSelf: 'flex-end', backgroundColor: colors?.primaryColor},
  receivedMessage: {alignSelf: 'flex-start', backgroundColor: '#e3e3e3'},
  message: {fontSize: 16, color: '#000'},
  senderName: {fontSize: 12, fontWeight: 'bold', color: colors?.primaryColor},
  seenByText: {fontSize: 12, color: '#777', marginTop: 5},
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    padding: 10,
    margin: 10,
  },
  input: {flex: 1, fontSize: 16, color: '#333'},
  sendButton: {
    backgroundColor: colors?.primaryColor,
    padding: 10,
    borderRadius: 20,
  },
  sendButtonText: {color: 'white', fontWeight: 'bold'},
  typingIndicator: {
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#333',
    borderRadius: 10,
  },
  chatImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 5,
  },
  imagePickerButton: {
    marginRight: 10,
    padding: 8,
    backgroundColor: '#ddd',
    borderRadius: 50,
  },
  imagePickerText: {
    fontSize: 18,
  },

  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#fff',
  },
  urlText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default ChatScreen;
