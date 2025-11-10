import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const ChatScreen = ({route}) => {
  const {chatId} = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('Chats')
      .doc(chatId)
      .collection('Messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
        setMessages(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
      });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!messageText) return;
    await firestore()
      .collection('Chats')
      .doc(chatId)
      .collection('Messages')
      .add({
        text: messageText,
        createdAt: new Date(),
      });
    setMessageText('');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({item}) => <Text style={styles.message}>{item.text}</Text>}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text>Sended</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  message: {
    padding: 10,
    backgroundColor: '#e3e3e3',
    margin: 5,
    borderRadius: 5,
  },
  inputContainer: {flexDirection: 'row', padding: 10},
  input: {flex: 1, borderWidth: 1, padding: 8},
  sendButton: {padding: 10, backgroundColor: '#007bff'},
});

export default ChatScreen;
