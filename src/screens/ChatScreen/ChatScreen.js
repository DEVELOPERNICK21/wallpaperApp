import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
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
} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ChatScreen = ({route}) => {
  const {chatId} = route.params;
  const firestore = getFirestore();
  const currentUser = auth().currentUser; // Logged-in user info

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [groupName, setGroupName] = useState('');

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

    return () => unsubscribe();
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

  // Send Message
  const sendMessage = async () => {
    if (!messageText.trim()) return;

    await addDoc(collection(firestore, `GroupChats/${chatId}/Messages`), {
      text: messageText,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'Unknown',
      createdAt: new Date(),
      seenBy: [currentUser.uid], // Mark sender as seen by default
    });
    setMessageText('');
  };

  return (
    <View style={styles.container}>
      {/* Group Name Header */}
      <View style={styles.header}>
        <Text style={styles.groupName}>{groupName}</Text>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({item}) => {
          const isCurrentUser = item.senderId === currentUser.uid;
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

      {/* Input Field */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},

  /* Group Name Header */
  header: {
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#007bff',
    elevation: 3,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },

  /* Messages Styling */
  messageContainer: {
    maxWidth: '75%',
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    borderTopRightRadius: 0,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3e3e3',
    borderTopLeftRadius: 0,
  },
  message: {
    fontSize: 16,
    color: '#000',
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 3,
  },
  seenByText: {
    fontSize: 12,
    color: '#000',
    marginTop: 5,
    alignSelf: 'flex-end',
  },

  /* Input Field Styling */
  inputContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
