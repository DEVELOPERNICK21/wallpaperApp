import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../assets/color';
import MyStatusBar from '../../component/StatusBar';
import fonts from '../../assets/fonts';
import {width} from '../../assets/string';

const CreateGroupChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const currentUser = auth().currentUser; // Get the logged-in user

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await firestore().collection('Users').get();
        const usersListed = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Automatically add the logged-in user to the selected users
        setSelectedUsers([currentUser?.uid]);
        setUsers(usersListed);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const toggleUserSelection = userId => {
    if (userId === currentUser?.uid) return; // Prevent deselecting the logged-in user

    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId],
    );
  };

  const handleCreateGroup = async () => {
    if (selectedUsers.length < 2) {
      Alert.alert('Error', 'Select at least two users');
      return;
    }
    if (!groupName.trim()) {
      Alert.alert('Error', 'Enter a group name');
      return;
    }

    try {
      await firestore().collection('GroupChats').add({
        name: groupName,
        members: selectedUsers,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'Group chat created successfully!');
      setModalVisible(false);
      navigation.goBack(); // Navigate back to the home screen
    } catch (error) {
      console.error('Error creating group chat:', error);
      Alert.alert('Error', 'Failed to create group chat');
    }
  };

  return (
    <View style={styles.container}>
      <MyStatusBar
        translucent={true}
        backgroundColor={colors?.primaryColor}
        barStyle="dark-content"
      />
      <Text style={styles.header}>Create Group Chat</Text>

      {/* List of users */}
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={[
              styles.userItem,
              selectedUsers.includes(item.id) && styles.selectedUser,
            ]}
            onPress={() => toggleUserSelection(item.id)}>
            <Text style={styles?.userNamme}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Open modal to enter group name */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.createButtonText}>Next</Text>
      </TouchableOpacity>

      {/* Modal for entering group name */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Group Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Group Name"
              value={groupName}
              onChangeText={setGroupName}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCreateGroup}>
              <Text style={styles.modalButtonText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors?.white,
    marginVertical: 20,
    marginHorizontal: 10,
  },
  userItem: {padding: 10, borderBottomWidth: 1},
  userNamme: {
    color: colors?.primaryColor,
    textTransform: 'uppercase',
    fontFamily: fonts?.PoppinsSemiBold,
    fontSize: 18,
  },
  selectedUser: {backgroundColor: colors?.greyColor, borderRadius: 20},
  createButton: {
    padding: 10,
    backgroundColor: colors?.primaryColor,
    alignItems: 'center',
    marginTop: 10,
    padding: 20,
    borderRadius: 10,
    bottom: width / 10,
    marginHorizontal: 20,
  },
  createButtonText: {color: 'white', fontWeight: 'bold'},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 10},
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {color: 'white', fontWeight: 'bold'},
});

export default CreateGroupChat;
