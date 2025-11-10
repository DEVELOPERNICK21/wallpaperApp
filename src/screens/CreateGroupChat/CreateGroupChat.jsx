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
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../assets/color';
import fonts from '../../assets/fonts';
import {width, height} from '../../assets/string';

const {width: screenWidth} = Dimensions.get('window');

const CreateGroupChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const currentUser = auth().currentUser;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const selectedCountAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersSnapshot = await firestore().collection('Users').get();
        const usersListed = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter out current user from the list
        const filteredUsers = usersListed.filter(
          user => user.id !== currentUser?.uid,
        );
        setUsers(filteredUsers);
        setSelectedUsers([currentUser?.uid]);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate selected count
  useEffect(() => {
    Animated.spring(selectedCountAnim, {
      toValue: selectedUsers.length,
      useNativeDriver: false,
    }).start();
  }, [selectedUsers.length]);

  const toggleUserSelection = userId => {
    if (userId === currentUser?.uid) return;

    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId],
    );

    // Button animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCreateGroup = async () => {
    if (selectedUsers.length < 2) {
      Alert.alert('Error', 'Select at least two users to create a group');
      return;
    }
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    try {
      const groupData = {
        name: groupName.trim(),
        members: [...selectedUsers, currentUser?.uid], // Include the current user as a member
        createdAt: firestore.FieldValue.serverTimestamp(),
        createdBy: currentUser?.uid,
      };

      console.log('🆕 Creating new group:', groupName.trim());
      console.log('👥 Members:', [...selectedUsers, currentUser?.uid]);

      const docRef = await firestore().collection('GroupChats').add(groupData);

      console.log('✅ Group created with ID:', docRef.id);

      Alert.alert('Success', 'Group chat created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setModalVisible(false);
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating group chat:', error);
      Alert.alert('Error', 'Failed to create group chat. Please try again.');
    }
  };

  const showModal = () => {
    setModalVisible(true);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderUserItem = ({item, index}) => {
    const isSelected = selectedUsers.includes(item.id);
    const isCurrentUser = item.id === currentUser?.uid;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }}>
        <TouchableOpacity
          style={[
            styles.userItem,
            isSelected && styles.selectedUser,
            isCurrentUser && styles.currentUser,
          ]}
          onPress={() => toggleUserSelection(item.id)}
          disabled={isCurrentUser}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, isSelected && styles.selectedAvatar]}>
              <Text style={styles.avatarText}>
                {item.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text
                style={[
                  styles.userName,
                  isSelected && styles.selectedUserName,
                ]}>
                {item.name || 'Unknown User'}
                {isCurrentUser && ' (You)'}
              </Text>
              <Text
                style={[
                  styles.userEmail,
                  isSelected && styles.selectedUserEmail,
                ]}>
                {item.email || 'No email'}
              </Text>
            </View>
          </View>
          {isSelected && (
            <Animated.View style={[styles.checkmark, {opacity: fadeAnim}]}>
              <Text style={styles.checkmarkText}>✓</Text>
            </Animated.View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors?.primaryColor}
        translucent={false}
      />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group Chat</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Search Bar */}
      <Animated.View
        style={[
          styles.searchContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={colors?.greyColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </Animated.View>

      {/* Selected Users Count */}
      <Animated.View
        style={[
          styles.selectedCountContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}>
        <Text style={styles.selectedCountText}>
          Selected: {selectedUsers.length - 1} users
        </Text>
      </Animated.View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        renderItem={renderUserItem}
        style={styles.userList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.userListContent}
        ListEmptyComponent={
          <Animated.View
            style={[
              styles.emptyContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading users...' : 'No users found'}
            </Text>
          </Animated.View>
        }
      />

      {/* Next Button */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{scale: buttonScale}],
          },
        ]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedUsers.length < 2 && styles.disabledButton,
          ]}
          onPress={showModal}
          disabled={selectedUsers.length < 2}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Modal for Group Name */}
      <Modal visible={modalVisible} transparent animationType="none">
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: modalAnim,
            },
          ]}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [
                  {
                    scale: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Group Chat</Text>
              <TouchableOpacity onPress={hideModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>Enter group name</Text>
              <TextInput
                style={styles.groupNameInput}
                placeholder="Group Name"
                placeholderTextColor={colors?.greyColor}
                value={groupName}
                onChangeText={setGroupName}
                autoFocus={true}
              />

              <View style={styles.selectedUsersPreview}>
                <Text style={styles.previewTitle}>Selected Users:</Text>
                <Text style={styles.previewCount}>
                  {selectedUsers.length} members
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.createButton,
                  !groupName.trim() && styles.disabledCreateButton,
                ]}
                onPress={handleCreateGroup}
                disabled={!groupName.trim()}>
                <Text style={styles.createButtonText}>Create Group</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    backgroundColor: colors?.primaryColor,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: colors?.white,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchInput: {
    backgroundColor: '#1e293b',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    color: colors?.white,
    fontSize: 16,
    fontFamily: fonts?.PoppinsRegular,
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectedCountContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  selectedCountText: {
    color: colors?.primaryColor,
    fontSize: 14,
    fontFamily: fonts?.PoppinsMedium,
  },
  userList: {
    flex: 1,
  },
  userListContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedUser: {
    backgroundColor: '#1e40af',
    borderColor: colors?.primaryColor,
  },
  currentUser: {
    backgroundColor: '#374151',
    opacity: 0.7,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors?.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  selectedAvatar: {
    backgroundColor: colors?.white,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
    marginBottom: 2,
  },
  selectedUserName: {
    color: colors?.white,
  },
  userEmail: {
    fontSize: 14,
    color: colors?.greyColor,
    fontFamily: fonts?.PoppinsRegular,
  },
  selectedUserEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checkmark: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors?.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 16,
    color: colors?.primaryColor,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: colors?.greyColor,
    fontSize: 16,
    fontFamily: fonts?.PoppinsRegular,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  nextButton: {
    backgroundColor: colors?.primaryColor,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors?.primaryColor,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#374151',
    opacity: 0.5,
  },
  nextButtonText: {
    color: colors?.white,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: fonts?.PoppinsSemiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: screenWidth * 0.9,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: colors?.white,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors?.greyColor,
    marginBottom: 15,
    fontFamily: fonts?.PoppinsRegular,
  },
  groupNameInput: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    color: colors?.white,
    fontSize: 16,
    fontFamily: fonts?.PoppinsRegular,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors?.primaryColor,
    elevation: 2,
    shadowColor: colors?.primaryColor,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectedUsersPreview: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 14,
    color: colors?.greyColor,
    marginBottom: 5,
    fontFamily: fonts?.PoppinsMedium,
  },
  previewCount: {
    fontSize: 16,
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  createButton: {
    backgroundColor: colors?.primaryColor,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  disabledCreateButton: {
    backgroundColor: '#374151',
    opacity: 0.5,
  },
  createButtonText: {
    color: colors?.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fonts?.PoppinsSemiBold,
  },
});

export default CreateGroupChat;
