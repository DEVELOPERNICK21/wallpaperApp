import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../assets/color';
import fonts from '../../assets/fonts';
import ScreenConstants from '../../Routes/ScreenConstants';
import {useSubscription} from '../../hooks/useSubscription';
import SubscriptionRequiredView from '../../component/SubscriptionRequiredView';

const {width: screenWidth} = Dimensions.get('window');

const CreateGroupChatImproved = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const navigation = useNavigation();
  const currentUser = auth().currentUser;
  const {
    subscriptionStatus,
    loading: subscriptionLoading,
    isActive,
    refresh: refreshSubscription,
  } = useSubscription();
  const hasChatAccess =
    isActive && subscriptionStatus?.subscriptionType !== 'free';

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  // Search users by email or name
  const handleSearch = async () => {
    if (!hasChatAccess) {
      Alert.alert(
        'Subscription required',
        'Renew your plan to search and add new chats.',
      );
      return;
    }

    if (searchQuery.trim().length < 2) {
      Alert.alert('Search', 'Please enter at least 2 characters');
      setSearching(false); // Ensure searching state is reset
      return;
    }

    // Prevent multiple simultaneous searches
    if (searching) {
      console.log('⚠️ Search already in progress');
      return;
    }

    setSearching(true);
    setSearchPerformed(true);

    // Safety timeout - reset searching state after 15 seconds
    const timeoutId = setTimeout(() => {
      console.log('⚠️ Search timeout - resetting searching state');
      setSearching(false);
    }, 15000);

    try {
      const query = searchQuery.trim().toLowerCase();
      const usersSnapshot = await firestore().collection('Users').get();

      // Clear the timeout if search completes successfully
      clearTimeout(timeoutId);

      const results = usersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(user => {
          // Exclude current user
          if (user.id === currentUser?.uid) return false;

          // Search by email (exact or partial)
          const emailMatch = user.email?.toLowerCase().includes(query);

          // Search by name
          const nameMatch = user.name?.toLowerCase().includes(query);

          // Search by username if exists
          const usernameMatch = user.username?.toLowerCase().includes(query);

          return emailMatch || nameMatch || usernameMatch;
        });

      setSearchResults(results);

      if (results.length === 0) {
        Alert.alert(
          'No Users Found',
          `No users found matching "${searchQuery}". Make sure the email or name is correct.`,
        );
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users');
    } finally {
      clearTimeout(timeoutId);
      setSearching(false);
    }
  };

  // Add/remove user from selection
  const toggleUserSelection = user => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      if (exists) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  // Quick start 1-on-1 chat
  const startDirectChat = async user => {
    try {
      // Check if chat already exists
      const existingChatsSnapshot = await firestore()
        .collection('GroupChats')
        .where('members', 'array-contains', currentUser?.uid)
        .get();

      let existingChat = null;
      for (const doc of existingChatsSnapshot.docs) {
        const members = doc.data().members;
        if (
          members.length === 2 &&
          members.includes(currentUser?.uid) &&
          members.includes(user.id)
        ) {
          existingChat = doc.id;
          break;
        }
      }

      if (existingChat) {
        // Automatically navigate to existing chat
        console.log('✅ Chat already exists, navigating:', existingChat);
        navigation.navigate(ScreenConstants.CHAT_SCREEN, {
          chatId: existingChat,
          groupNameed: user.name || user.email,
        });
        return;
      }

      // Create new 1-on-1 chat
      const chatData = {
        name: user.name || user.email,
        members: [currentUser?.uid, user.id],
        createdAt: firestore.FieldValue.serverTimestamp(),
        createdBy: currentUser?.uid,
        type: 'direct', // Mark as direct chat
      };

      const docRef = await firestore().collection('GroupChats').add(chatData);

      console.log('✅ Chat created successfully:', docRef.id);

      // Wait a moment to ensure Firestore write is complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Automatically navigate to the chat
      navigation.navigate(ScreenConstants.CHAT_SCREEN, {
        chatId: docRef.id,
        groupNameed: user.name || user.email,
      });
    } catch (error) {
      console.error('Error creating direct chat:', error);
      Alert.alert('Error', 'Failed to create chat');
    }
  };

  // Create group chat
  const handleCreateGroup = async () => {
    if (!hasChatAccess) {
      Alert.alert(
        'Subscription required',
        'Renew your plan to continue creating groups.',
      );
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one user');
      return;
    }

    if (selectedUsers.length === 1) {
      // If only one user, suggest direct chat instead
      Alert.alert(
        'Create Direct Chat?',
        'You selected only one user. Would you like to create a direct chat instead?',
        [
          {
            text: 'Create Group',
            onPress: () => setShowGroupModal(true),
          },
          {
            text: 'Direct Chat',
            onPress: () => startDirectChat(selectedUsers[0]),
          },
          {text: 'Cancel', style: 'cancel'},
        ],
      );
      return;
    }

    setShowGroupModal(true);
  };

  const confirmCreateGroup = async () => {
    if (!hasChatAccess) {
      Alert.alert(
        'Subscription required',
        'An active plan is needed to finalize this group.',
      );
      return;
    }

    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    try {
      const memberIds = selectedUsers.map(u => u.id);
      const groupData = {
        name: groupName.trim(),
        members: [...memberIds, currentUser?.uid],
        createdAt: firestore.FieldValue.serverTimestamp(),
        createdBy: currentUser?.uid,
        type: 'group',
      };

      const docRef = await firestore().collection('GroupChats').add(groupData);

      console.log('✅ Group created successfully:', docRef.id);

      // Wait a moment to ensure Firestore write is complete
      await new Promise(resolve => setTimeout(resolve, 500));

      setShowGroupModal(false);

      // Navigate to the new group chat
      navigation.replace(ScreenConstants.CHAT_SCREEN, {
        chatId: docRef.id,
        groupNameed: groupName.trim(),
      });
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group');
    }
  };

  const renderSearchResult = ({item}) => {
    const isSelected = selectedUsers.find(u => u.id === item.id);

    return (
      <View style={styles.resultItem}>
        <TouchableOpacity
          style={[styles.userCard, isSelected && styles.selectedCard]}
          onPress={() => toggleUserSelection(item)}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, isSelected && styles.selectedAvatar]}>
              <Text style={styles.avatarText}>
                {item.name?.charAt(0)?.toUpperCase() ||
                  item.email?.charAt(0)?.toUpperCase() ||
                  'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text
                style={[styles.userName, isSelected && styles.selectedText]}>
                {item.name || 'Unknown User'}
              </Text>
              <Text
                style={[
                  styles.userEmail,
                  isSelected && styles.selectedEmailText,
                ]}>
                {item.email}
              </Text>
              {item.username && (
                <Text
                  style={[
                    styles.username,
                    isSelected && styles.selectedEmailText,
                  ]}>
                  @{item.username}
                </Text>
              )}
            </View>
          </View>
          {isSelected && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Quick action buttons */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => startDirectChat(item)}>
            <Text style={styles.quickButtonText}>💬 Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.quickButton,
              styles.addButton,
              isSelected && styles.removeButton,
            ]}
            onPress={() => toggleUserSelection(item)}>
            <Text style={styles.quickButtonText}>
              {isSelected ? '− Remove' : '+ Add to Group'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (subscriptionLoading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator color={colors.primaryColor} size="large" />
      </SafeAreaView>
    );
  }

  if (!hasChatAccess) {
    return (
      <SafeAreaView style={styles.blockedContainer}>
        <SubscriptionRequiredView
          featureName="create secret groups"
          subscriptionStatus={subscriptionStatus}
          loading={subscriptionLoading}
          onRefresh={refreshSubscription}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors?.primaryColor}
        translucent={false}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Chat</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>Find User</Text>
          <Text style={styles.searchSubtitle}>
            Search by email, name, or username
          </Text>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter email or name..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity
              style={[styles.searchButton, searching && styles.searchingButton]}
              onPress={handleSearch}
              disabled={searching}>
              {searching ? (
                <ActivityIndicator color={colors?.white} size="small" />
              ) : (
                <Text style={styles.searchButtonText}>🔍 Search</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Selected Users Badge */}
          {selectedUsers.length > 0 && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>
                {selectedUsers.length} user
                {selectedUsers.length !== 1 ? 's' : ''} selected
              </Text>
              <TouchableOpacity
                style={styles.createGroupButton}
                onPress={handleCreateGroup}>
                <Text style={styles.createGroupButtonText}>Create Group →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Search Results */}
        {searchPerformed && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              {searchResults.length > 0
                ? `Found ${searchResults.length} user${
                    searchResults.length !== 1 ? 's' : ''
                  }`
                : 'No users found'}
            </Text>

            <FlatList
              data={searchResults}
              keyExtractor={item => item.id}
              renderItem={renderSearchResult}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
              ListEmptyComponent={
                !searching && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🔍</Text>
                    <Text style={styles.emptyText}>
                      No users found with "{searchQuery}"
                    </Text>
                    <Text style={styles.emptyHint}>
                      Try searching by their email address
                    </Text>
                  </View>
                )
              }
            />
          </View>
        )}

        {/* Empty State */}
        {!searchPerformed && (
          <View style={styles.initialState}>
            <Text style={styles.initialIcon}>💬</Text>
            <Text style={styles.initialTitle}>Start a New Chat</Text>
            <Text style={styles.initialText}>
              Search for users by their email address{'\n'}
              to start a conversation or create a group
            </Text>
            <View style={styles.tipsContainer}>
              <Text style={styles.tipTitle}>💡 Tips:</Text>
              <Text style={styles.tipText}>
                • Use full email for exact match
              </Text>
              <Text style={styles.tipText}>
                • Search by name if you know it
              </Text>
              <Text style={styles.tipText}>
                • Select multiple users for groups
              </Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Group Name Modal */}
      <Modal visible={showGroupModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Group</Text>
              <TouchableOpacity
                onPress={() => setShowGroupModal(false)}
                style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalSubtitle}>Enter group name</Text>
              <TextInput
                style={styles.groupNameInput}
                placeholder="Group Name"
                placeholderTextColor="#64748b"
                value={groupName}
                onChangeText={setGroupName}
                autoFocus={true}
              />

              <View style={styles.membersList}>
                <Text style={styles.membersTitle}>Members:</Text>
                {selectedUsers.map(user => (
                  <Text key={user.id} style={styles.memberItem}>
                    • {user.name || user.email}
                  </Text>
                ))}
                <Text style={styles.memberItem}>• You</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !groupName.trim() && styles.disabledButton,
                ]}
                onPress={confirmCreateGroup}
                disabled={!groupName.trim()}>
                <Text style={styles.confirmButtonText}>Create Group</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  blockedContainer: {
    flex: 1,
    backgroundColor: colors.screenBackColor,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: colors.screenBackColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
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
  content: {
    flex: 1,
  },
  searchSection: {
    padding: 20,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
    marginBottom: 5,
  },
  searchSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: fonts?.PoppinsRegular,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    color: colors?.white,
    fontSize: 16,
    fontFamily: fonts?.PoppinsRegular,
    borderWidth: 1,
    borderColor: '#475569',
  },
  searchButton: {
    backgroundColor: colors?.primaryColor,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  searchingButton: {
    opacity: 0.7,
  },
  searchButtonText: {
    color: colors?.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fonts?.PoppinsSemiBold,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors?.primaryColor,
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
  },
  selectedBadgeText: {
    color: colors?.white,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts?.PoppinsSemiBold,
  },
  createGroupButton: {
    backgroundColor: colors?.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  createGroupButtonText: {
    color: colors?.primaryColor,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: fonts?.PoppinsSemiBold,
  },
  resultsSection: {
    flex: 1,
    paddingTop: 15,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultItem: {
    marginBottom: 15,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: '#1e40af',
    borderColor: colors?.primaryColor,
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
    marginRight: 12,
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
  selectedText: {
    color: colors?.white,
  },
  userEmail: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: fonts?.PoppinsRegular,
  },
  selectedEmailText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  username: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: fonts?.PoppinsRegular,
    marginTop: 2,
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
  quickActions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: colors?.primaryColor,
  },
  removeButton: {
    backgroundColor: '#ef4444',
  },
  quickButtonText: {
    color: colors?.white,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: fonts?.PoppinsSemiBold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    fontFamily: fonts?.PoppinsRegular,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: fonts?.PoppinsRegular,
    textAlign: 'center',
  },
  initialState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  initialIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  initialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
    marginBottom: 10,
    textAlign: 'center',
  },
  initialText: {
    fontSize: 16,
    color: '#94a3b8',
    fontFamily: fonts?.PoppinsRegular,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  tipsContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
    fontFamily: fonts?.PoppinsSemiBold,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#cbd5e1',
    fontFamily: fonts?.PoppinsRegular,
    marginBottom: 6,
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
    backgroundColor: '#374151',
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
    fontSize: 14,
    color: '#94a3b8',
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
  },
  membersList: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  membersTitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 10,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  memberItem: {
    fontSize: 14,
    color: colors?.white,
    marginBottom: 5,
    fontFamily: fonts?.PoppinsRegular,
  },
  confirmButton: {
    backgroundColor: colors?.primaryColor,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#374151',
    opacity: 0.5,
  },
  confirmButtonText: {
    color: colors?.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fonts?.PoppinsSemiBold,
  },
});

export default CreateGroupChatImproved;
