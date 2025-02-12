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
} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {colors} from '../../assets/color';
import MyStatusBar from '../../component/StatusBar';

const ChatScreen = ({route}) => {
  const {chatId, groupNameed} = route.params;
  const firestore = getFirestore();
  const currentUser = auth().currentUser; // Logged-in user info

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');

  const typingAnimation = useRef(new Animated.Value(0)).current; // Animation ref

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
  const sendMessage = async () => {
    if (!messageText.trim()) return;

    await addDoc(collection(firestore, `GroupChats/${chatId}/Messages`), {
      text: messageText,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'Unknown',
      createdAt: serverTimestamp(), // 🔥 Firestore server timestamp
      seenBy: [currentUser.uid], // Mark sender as seen by default
    });

    setMessageText('');
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
              <View
                style={[
                  styles.messageContainer,
                  isCurrentUser ? styles.sentMessage : styles.receivedMessage,
                ]}>
                {!isCurrentUser && (
                  <Text style={styles.senderName}>{item.senderName}</Text>
                )}
                <Text style={styles.message}>{item.text}</Text>
                <Text style={styles.seenByText}>
                  {messageTime} {' • '}
                  {item.seenBy.length > 1
                    ? `Seen by ${item.seenBy.length} users`
                    : item.seenBy.includes(currentUser.uid)
                    ? 'Seen by you'
                    : 'Not seen yet'}
                </Text>
              </View>
            );
          }}
          contentContainerStyle={{paddingBottom: 80}} // Space for input field
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
});

export default ChatScreen;
