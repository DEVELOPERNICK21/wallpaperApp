import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  writeBatch,
  doc,
} from 'firebase/firestore';
import {getAuth} from 'firebase/auth';
import CustomButton from './CustomButton';
import {height, width} from '../../assets/string';
import {colors} from '../../assets/color';
import firebase from 'firebase/app'; // Import the main firebase object

// Initialize Firebase if not already initialized
// if (!firebase.apps.length) {
//   const firebaseConfig = {
//     // ... Your Firebase config
//   };
//   firebase.initializeApp(firebaseConfig);
// }

const UserSelectionModal = ({onClose}) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const auth = getAuth();
  const firestore = getFirestore();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(firestore, 'Users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs
        .map(doc => ({...doc.data(), id: doc.id}))
        .filter(user => user.id !== currentUser.uid);
      setUsers(userList);
    };

    fetchUsers();
  }, []);

  const toggleSelectUser = userId => {
    setSelectedUsers(prevSelectedUsers =>
      prevSelectedUsers.includes(userId)
        ? prevSelectedUsers.filter(id => id !== userId)
        : [...prevSelectedUsers, userId],
    );
  };

  const createChatRoom = async () => {
    if (selectedUsers.length > 0 && groupName.trim() !== '') {
      try {
        const chatRoomsCollection = collection(firestore, 'chatRooms');
        const roomRef = await addDoc(chatRoomsCollection, {
          name: groupName,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(), // Use serverTimestamp
          createdBy: currentUser.uid,
          admin: currentUser.uid,
          users: [currentUser.uid, ...selectedUsers],
        });

        const batch = writeBatch(firestore);

        selectedUsers.forEach(userId => {
          const userDocRef = doc(
            chatRoomsCollection,
            roomRef.id,
            'users',
            userId,
          );
          batch.set(userDocRef, {userId});
        });

        const currentUserDocRef = doc(
          chatRoomsCollection,
          roomRef.id,
          'users',
          currentUser.uid,
        );
        batch.set(currentUserDocRef, {userId: currentUser.uid});

        await batch.commit();

        onClose();
      } catch (error) {
        console.error('Error creating chat room:', error);
        // Handle the error appropriately (e.g., show an alert)
      }
    }
  };

  // ... rest of your component (JSX, styles)
};

// ... styles

export default UserSelectionModal;
