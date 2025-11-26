import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
  StatusBar,
  SafeAreaView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {height, width} from '../../assets/string';
import ScreenConstants from '../../Routes/ScreenConstants';
import {colors} from '../../assets/color';
import {setLogOut} from '../../redux/actions/users';
import {removeUserData} from '../../utils/asynstorage';
import {RootState} from '../../reduxrf/reducers';
import auth from '@react-native-firebase/auth';
import {UserFace_Icon} from '../../assets/icons';
import {useSubscription} from '../../hooks/useSubscription';
import {ShowInfoMessage} from '../../component/FlashMessage/FlashMessage';

const HomeScreen = () => {
  const [chats, setChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [newMessageChats, setNewMessageChats] = useState(new Set());
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const {
    subscriptionStatus,
    loading: subscriptionLoading,
    isActive,
  } = useSubscription();
  const hasChatAccess =
    isActive && subscriptionStatus?.subscriptionType !== 'free';

  const notifySubscriptionBlock = useCallback((contextMessage?: string) => {
    ShowInfoMessage(
      contextMessage || 'Subscribe to unlock messaging and creation features.',
    );
  }, []);

  const ensureChatAccess = useCallback(
    (contextMessage?: string) => {
      if (hasChatAccess) {
        return true;
      }

      if (!subscriptionLoading) {
        notifySubscriptionBlock(contextMessage);
      }
      return false;
    },
    [hasChatAccess, notifySubscriptionBlock, subscriptionLoading],
  );

  // Helper function to get initials from name or email
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Debounce timer for auto-refresh
  const refreshTimerRef = useRef(null);

  const user = useSelector((state: RootState) => state.userDetails);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const userId = user?.user?.uid || authUserId || null;

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(1)).current;
  const floatButtonAnim = useRef(new Animated.Value(1)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  const deleteModalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(floatButtonAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerAnim, fadeAnim, slideAnim, floatButtonAnim]);

  // ⚡ REMOVED: Old duplicate listeners - now handled by optimized GroupChat listener below

  // Clean up new message highlighting when unread counts become 0
  useEffect(() => {
    setNewMessageChats(prev => {
      const newSet = new Set(prev);
      let hasChanges = false;

      chats.forEach(chat => {
        if (chat.unreadCount === 0 && newSet.has(chat.id)) {
          newSet.delete(chat.id);
          hasChanges = true;
          console.log(
            'Removed new message highlight from chat (read):',
            chat.name,
          );
        }
      });

      return hasChanges ? newSet : prev;
    });
  }, [chats]);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(currentUser => {
      setAuthUserId(currentUser?.uid ?? null);
    });

    return () => unsubscribe();
  }, []);

  // Helper function to check if a chat is a direct chat
  const isDirectChat = (chat: any): boolean => {
    return (
      (chat?.type === 'direct' ||
        (!chat?.type && chat?.members?.length === 2)) &&
      chat?.members &&
      chat.members.length === 2
    );
  };

  // Helper function to get display name for a chat
  const getChatDisplayName = async (
    chatData: any,
    currentUserId: string,
  ): Promise<string> => {
    // Check if it's a direct chat (either explicitly marked or has exactly 2 members)
    const isDirectChat =
      (chatData.type === 'direct' ||
        (!chatData.type && chatData.members?.length === 2)) &&
      chatData.members &&
      chatData.members.length === 2;

    if (isDirectChat) {
      // Find the other user's ID (not the current user)
      const otherUserId = chatData.members.find(
        (memberId: string) => memberId !== currentUserId,
      );

      if (otherUserId) {
        try {
          // Fetch the other user's name from Users collection
          const otherUserDoc = await firestore()
            .collection('Users')
            .doc(otherUserId)
            .get();

          if (otherUserDoc.exists) {
            const otherUserData = otherUserDoc.data();
            // Use displayName, name, or email as fallback
            return (
              otherUserData?.displayName ||
              otherUserData?.name ||
              otherUserData?.email?.split('@')[0] ||
              'Unknown User'
            );
          }
        } catch (error) {
          console.error('Error fetching other user name:', error);
        }
      }
      // Fallback to stored name if we can't fetch the other user
      return chatData.name || 'Direct Chat';
    }

    // For group chats, use the stored name
    return chatData.name || 'Group Chat';
  };

  const fetchChats = useCallback(
    async (showSpinner = true) => {
      if (!userId) {
        console.log('⚠️ No user UID found, cannot fetch chats');
        if (showSpinner) {
          setRefreshing(false);
        }
        return;
      }

      console.log('🔄 Fetching chats for user:', userId);

      // Only show spinner for manual refresh, not auto-refresh
      if (showSpinner) {
        setRefreshing(true);
      }

      try {
        const snapshot = await firestore()
          .collection('GroupChats')
          .where('members', 'array-contains', userId)
          .get();

        console.log('✅ Found', snapshot.size, 'chat(s)');

        if (snapshot.empty) {
          console.log('No chats found');
          setChats([]);
          if (showSpinner) setRefreshing(false);
          return;
        }

        // ⚡ OPTIMIZED: Process chat data without N+1 queries
        const processedChatsPromises = snapshot.docs.map(async doc => {
          const chatData: any = doc.data();

          // Use lastMessage from the document if available (optimization)
          const lastMessage = chatData.lastMessage || null;

          // Calculate unread count efficiently
          let unreadCount = 0;
          if (chatData.lastReadTimestamps?.[userId]) {
            // Use the unreadCounts map if available (optimization)
            if (
              chatData.unreadCounts &&
              chatData.unreadCounts[userId] !== undefined
            ) {
              unreadCount = chatData.unreadCounts[userId];
            }
          }

          // Get display name (computes correct name for direct chats)
          const displayName = await getChatDisplayName(chatData, userId);

          return {
            id: doc.id,
            ...chatData,
            name: displayName, // Use computed display name
            lastMessage,
            unreadCount,
          };
        });

        const processedChats = await Promise.all(processedChatsPromises);

        // Sort chats: pinned first, then by last message timestamp
        const sortedChats = processedChats.sort((a, b) => {
          // First, prioritize pinned chats
          const aPinned = a.pinned || false;
          const bPinned = b.pinned || false;

          if (aPinned && !bPinned) return -1; // a is pinned, move to top
          if (!aPinned && bPinned) return 1; // b is pinned, move to top

          // If both pinned or both unpinned, sort by timestamp
          const aTime =
            a.lastMessage?.createdAt?.toMillis?.() ||
            a.createdAt?.toMillis?.() ||
            0;
          const bTime =
            b.lastMessage?.createdAt?.toMillis?.() ||
            b.createdAt?.toMillis?.() ||
            0;
          return bTime - aTime; // Descending order (newest first)
        });

        setChats(sortedChats);
        console.log('⚡ Chats processed without sub-queries');
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        if (showSpinner) setRefreshing(false);
      }
    },
    [userId],
  );

  // ⚡ REMOVED: debouncedFetchChats - no longer needed with real-time GroupChat listener

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  // Initial load on component mount
  useEffect(() => {
    if (userId) {
      console.log('🚀 Initial fetch on mount');
      fetchChats(false);
    } else {
      setChats([]);
    }
  }, [userId, fetchChats]); // Only run when user becomes available

  // Real-time listener for chats to detect new chats immediately
  // ⚡ OPTIMIZED: Listen to GroupChat documents directly for lastMessage updates
  useEffect(() => {
    if (!userId) {
      return;
    }

    console.log('👂 Setting up real-time listener for chats');

    const unsubscribe = firestore()
      .collection('GroupChats')
      .where('members', 'array-contains', userId)
      .onSnapshot(
        async snapshot => {
          console.log('📡 Chat update detected:', snapshot.size, 'chat(s)');

          const currentTime = new Date();

          // Process the updates asynchronously to compute display names
          const processedChatsPromises = snapshot.docs.map(async doc => {
            const chatData: any = doc.data();
            const lastMessage = chatData.lastMessage || null;
            const unreadCount = chatData.unreadCounts?.[userId] || 0;

            // Detect NEW messages from others for highlighting
            if (lastMessage && lastMessage.createdAt) {
              const messageTime = lastMessage.createdAt.toDate
                ? lastMessage.createdAt.toDate()
                : new Date(lastMessage.createdAt.seconds * 1000);

              const timeDifference =
                currentTime.getTime() - messageTime.getTime();

              // Check if this is a new message (not from current user and very recent)
              if (
                lastMessage.senderId !== userId &&
                timeDifference < 30000 && // Within last 30 seconds
                timeDifference > 0 && // Message is not in the future
                unreadCount > 0 // Has unread messages
              ) {
                console.log('🎉 NEW MESSAGE DETECTED in chat:', chatData.name);

                // Add to new message chats set
                setNewMessageChats(prev => {
                  const newSet = new Set(prev);
                  newSet.add(doc.id);
                  return newSet;
                });
              }
            }

            // Get display name (computes correct name for direct chats)
            const displayName = await getChatDisplayName(chatData, userId);

            return {
              id: doc.id,
              ...chatData,
              name: displayName, // Use computed display name
              lastMessage,
              unreadCount,
            };
          });

          const processedChats = await Promise.all(processedChatsPromises);

          // Sort chats: pinned first, then by last message timestamp
          const sortedChats = processedChats.sort((a, b) => {
            const aPinned = a.pinned || false;
            const bPinned = b.pinned || false;

            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;

            const aTime =
              a.lastMessage?.createdAt?.toMillis?.() ||
              a.createdAt?.toMillis?.() ||
              0;
            const bTime =
              b.lastMessage?.createdAt?.toMillis?.() ||
              b.createdAt?.toMillis?.() ||
              0;
            return bTime - aTime;
          });

          setChats(sortedChats);
          console.log('⚡ Real-time chat list updated');
        },
        error => {
          console.error('Error in chats listener:', error);
        },
      );

    return () => {
      console.log('🧹 Cleaning up chats listener');
      unsubscribe();
    };
  }, [userId, hasChatAccess]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        console.log('🔄 Fetch on screen focus');
        fetchChats(false); // Silent refresh when returning to screen
      }
    }, [fetchChats, userId]),
  );

  const onRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    fetchChats(true); // true = show spinner for manual refresh
  }, [fetchChats]);

  const signOut = async () => {
    try {
      const currentUser = auth().currentUser;
      await auth().signOut();
      dispatch(setLogOut());
      await removeUserData();
      navigation.reset({
        index: 0,
        routes: [{name: ScreenConstants.LOGIN_SCREEN}],
      });
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const openSubscriptionScreen = useCallback(() => {
    navigation.navigate(ScreenConstants.SUBSCRIPTION_SCREEN as never);
  }, [navigation]);

  const handleCreateGroupPress = useCallback(() => {
    if (!ensureChatAccess('Subscribe to create new group chats.')) {
      return;
    }
    navigation.navigate(ScreenConstants?.CREATE_GROUP_CHAT as never);
  }, [ensureChatAccess, navigation]);

  const openChat = chat => {
    if (!ensureChatAccess('Activate a subscription to open chats.')) {
      return;
    }

    if (!chat || !chat.id) {
      console.error('Chat data is undefined or invalid', chat);
      return;
    }

    // Remove new message highlighting when user opens the chat
    setNewMessageChats(prev => {
      const newSet = new Set(prev);
      newSet.delete(chat.id);
      console.log('Removed new message highlight from chat:', chat.name);
      return newSet;
    });

    navigation.navigate(ScreenConstants.CHAT_SCREEN, {
      chatId: chat.id,
      groupNameed: chat.name || 'Group Chat',
    });
  };

  const deleteGroupChat = async () => {
    if (!selectedChat) {
      console.log('No chat selected for deletion');
      return;
    }

    console.log('Attempting to delete chat:', selectedChat.id);

    try {
      // First, try to delete just the group chat document
      console.log('Deleting group chat document...');
      await firestore().collection('GroupChats').doc(selectedChat.id).delete();
      console.log('Group chat document deleted successfully');

      // Then try to delete messages if they exist
      try {
        const messagesSnapshot = await firestore()
          .collection('GroupChats')
          .doc(selectedChat.id)
          .collection('Messages')
          .get();
        console.log(`Found ${messagesSnapshot.size} messages to delete`);

        if (messagesSnapshot.size > 0) {
          const batch = firestore().batch();
          messagesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          console.log('Messages deleted successfully');
        }
      } catch (messageError) {
        console.log(
          'No messages to delete or error deleting messages:',
          messageError,
        );
      }

      setShowDeleteModal(false);
      setSelectedChat(null);
      fetchChats();
    } catch (error) {
      console.error('Error deleting group chat:', error);
      Alert.alert(
        'Delete Failed',
        `Unable to delete the group chat: ${error.message}`,
        [{text: 'OK'}],
      );
    }
  };

  const togglePinChat = async chat => {
    if (!chat) return;

    try {
      const currentPinState = chat.pinned || false;
      const newPinState = !currentPinState;

      // Update Firestore with pin state
      await firestore()
        .collection('GroupChats')
        .doc(chat.id)
        .update({
          pinned: newPinState,
          pinnedAt: newPinState ? firestore.FieldValue.serverTimestamp() : null,
        });

      console.log(`Chat ${chat.name} ${newPinState ? 'pinned' : 'unpinned'}`);

      // Refresh chats to update UI
      fetchChats(false);
    } catch (error) {
      console.error('Error toggling pin state:', error);
      Alert.alert(
        'Pin Failed',
        `Unable to ${chat.pinned ? 'unpin' : 'pin'} the chat: ${error.message}`,
        [{text: 'OK'}],
      );
    }
  };

  const clearChatMessages = async chat => {
    if (!chat) return;

    try {
      const messagesSnapshot = await firestore()
        .collection('GroupChats')
        .doc(chat.id)
        .collection('Messages')
        .get();
      const batch = firestore().batch();

      messagesSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Messages cleared for ${chat.name}`);

      fetchChats();
    } catch (error) {
      console.error('Error clearing messages:', error);
    }
  };

  const showModal = () => {
    setShowOptionsModal(true);
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
      setShowOptionsModal(false);
    });
  };

  const showDeleteConfirmationModal = () => {
    console.log('showDeleteConfirmationModal called');
    setShowDeleteModal(true);
    console.log('setShowDeleteModal(true) executed');
    Animated.timing(deleteModalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideDeleteConfirmationModal = () => {
    Animated.timing(deleteModalAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowDeleteModal(false);
    });
  };

  // Separate component for chat item to properly use hooks
  const ChatItem = React.memo(
    ({
      item,
      onPress,
      onLongPress,
    }: {
      item: any;
      onPress: () => void;
      onLongPress: () => void;
    }) => {
      const isUnread = item.unreadCount > 0;
      const hasLastMessage = item.lastMessage;
      const isNewMessage = newMessageChats.has(item.id) && isUnread;

      // Animation for unread badge pulse
      const badgePulse = useRef(new Animated.Value(1)).current;

      useEffect(() => {
        if (isNewMessage) {
          const pulse = Animated.loop(
            Animated.sequence([
              Animated.timing(badgePulse, {
                toValue: 1.15,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(badgePulse, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
            ]),
          );
          pulse.start();
          return () => pulse.stop();
        } else {
          badgePulse.setValue(1);
        }
      }, [isNewMessage, badgePulse]);

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
              styles.chatItem,
              {
                backgroundColor: hasLastMessage ? '#1a1a1a' : '#0f0f0f',
                borderLeftWidth: isUnread && !isNewMessage ? 5 : 0,
                borderLeftColor:
                  isUnread && !isNewMessage ? '#6366f1' : 'transparent',
                // Enhanced highlighting for new messages
                ...(isNewMessage && {
                  backgroundColor: '#1e293b', // Darker slate background
                  borderWidth: 2,
                  borderColor: '#3b82f6', // Bright blue border
                  elevation: 10,
                  shadowColor: '#3b82f6',
                  shadowOffset: {width: 0, height: 6},
                  shadowOpacity: 0.4,
                  shadowRadius: 10,
                }),
                // Subtle elevation for unread (non-new) messages
                ...(isUnread &&
                  !isNewMessage && {
                    backgroundColor: '#1f1f1f',
                    elevation: 3,
                    shadowColor: '#6366f1',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                  }),
              },
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}>
            {/* New Message Indicator - Top Right Pulse Dot */}
            {isNewMessage && (
              <Animated.View
                style={[
                  styles.newMessageDot,
                  {
                    transform: [{scale: badgePulse}],
                  },
                ]}>
                <View style={styles.newMessageDotInner} />
              </Animated.View>
            )}

            <View
              style={[
                styles.chatCircle,
                {
                  backgroundColor: hasLastMessage ? '#6366f1' : '#374151',
                  // Blue avatar for new messages
                  ...(isNewMessage && {
                    backgroundColor: '#3b82f6', // Bright blue
                    elevation: 4,
                    shadowColor: '#3b82f6',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.5,
                    shadowRadius: 4,
                  }),
                },
              ]}>
              <Text style={styles.chatInitial}>
                {item.name ? item.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>

            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <View style={styles.chatNameContainer}>
                  {item.pinned && <Text style={styles.pinIcon}>📌</Text>}
                  <Text
                    style={[
                      styles.chatText,
                      isUnread && !isNewMessage && styles.chatTextUnread,
                      isNewMessage && styles.chatTextNew,
                    ]}>
                    {item.name || 'Group Chat'}
                  </Text>
                </View>
                {item.lastMessage && (
                  <Text
                    style={[
                      styles.timeText,
                      isUnread && !isNewMessage && styles.timeTextUnread,
                      isNewMessage && styles.timeTextNew,
                    ]}>
                    {(() => {
                      try {
                        const messageTime =
                          item.lastMessage.createdAt?.toDate();
                        if (messageTime && messageTime.getTime) {
                          return messageTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                        }
                        return '--:--';
                      } catch (error) {
                        console.error('Error formatting message time:', error);
                        return '--:--';
                      }
                    })()}
                  </Text>
                )}
              </View>

              <Text
                style={[
                  styles.lastMessage,
                  isUnread && !isNewMessage && styles.unreadText,
                  isNewMessage && styles.newMessageText,
                ]}
                numberOfLines={2}>
                {item.lastMessage ? item.lastMessage.text : 'No messages yet'}
              </Text>
            </View>

            {isUnread && (
              <Animated.View
                style={[
                  styles.badgeContainer,
                  isNewMessage && styles.newBadgeContainer,
                  isNewMessage && {
                    transform: [{scale: badgePulse}],
                  },
                ]}>
                <Text
                  style={[
                    styles.badgeText,
                    isNewMessage && styles.newBadgeText,
                  ]}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
                {/* Outer glow for new messages */}
                {isNewMessage && <View style={styles.badgeGlow} />}
              </Animated.View>
            )}
          </TouchableOpacity>
        </Animated.View>
      );
    },
  );

  // ⚡ OPTIMIZED: Memoize render function with useCallback
  const renderChatItem = useCallback(
    ({item}) => (
      <ChatItem
        item={item}
        onPress={() => openChat(item)}
        onLongPress={() => {
          if (!ensureChatAccess('Subscribe to manage chats.')) {
            return;
          }
          setSelectedChat(item);
          showModal();
        }}
      />
    ),
    [openChat, showModal, ensureChatAccess],
  );

  // ⚡ OPTIMIZED: Extract key for better FlatList performance
  const keyExtractor = useCallback((item: any) => item.id, []);

  if (subscriptionLoading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator color={colors.primaryColor} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors?.primaryColorSecondary}
      />

      <View style={styles.homeWrapper}>
        {/* Header Section */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.profileArea}>
            <TouchableOpacity
              style={styles.profileInfo}
              onPress={() =>
                navigation.navigate(ScreenConstants.PROFILE_SCREEN as never)
              }
              activeOpacity={0.8}>
              <View style={styles.avatarContainer}>
                {user?.user?.photoURL ? (
                  <Image
                    source={{uri: user.user.photoURL}}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>
                      {getInitials(
                        user?.user?.displayName || user?.user?.email,
                      )}
                    </Text>
                  </View>
                )}
                <View style={styles.onlineIndicator} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {user?.user?.displayName ||
                    user?.user?.email?.split('@')[0] ||
                    'User'}
                </Text>
                <Text style={styles.userStatus}>
                  <Text style={styles.statusDot}>●</Text> Active now
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() =>
                navigation.navigate(ScreenConstants.PROFILE_SCREEN as never)
              }
              activeOpacity={0.7}>
              <Text style={styles.profileButtonIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Inline subscription notice */}
        {!hasChatAccess && !subscriptionLoading && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.subscriptionBanner}
            onPress={openSubscriptionScreen}>
            <View style={styles.subscriptionBannerIcon}>
              <Text style={styles.subscriptionBannerIconText}>🔒</Text>
            </View>
            <View style={styles.subscriptionBannerTextWrap}>
              <Text style={styles.subscriptionBannerTitle}>
                Messaging locked
              </Text>
              <Text style={styles.subscriptionBannerSubtitle}>
                Explore the app freely. Subscribe when you are ready to start
                chatting again.
              </Text>
            </View>
            <Text style={styles.subscriptionBannerCta}>View plans</Text>
          </TouchableOpacity>
        )}

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Animated.View
            style={[
              styles.headerContainer,
              {
                opacity: fadeAnim,
                transform: [{translateY: slideAnim}],
              },
            ]}>
            <Text style={styles.headerTitle}>Your Conversations</Text>
            <Text style={styles.headerSubtitle}>
              {chats.length} {chats.length === 1 ? 'chat' : 'chats'}
            </Text>
          </Animated.View>

          {/* Chat List */}
          <FlatList
            data={chats}
            keyExtractor={keyExtractor}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#6366f1"
                colors={['#6366f1']}
              />
            }
            renderItem={renderChatItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            // ⚡ PERFORMANCE OPTIMIZATIONS
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={5}
            ListEmptyComponent={
              <Animated.View
                style={[styles.emptyContainer, {opacity: fadeAnim}]}>
                <View style={styles.emptyIcon}>
                  <Text style={styles.emptyIconText}>💬</Text>
                </View>
                <Text style={styles.emptyTitle}>No conversations yet</Text>
                <Text style={styles.emptySubtitle}>
                  {hasChatAccess
                    ? 'Start a new group chat to begin messaging'
                    : 'Messaging actions are disabled until you subscribe.'}
                </Text>
              </Animated.View>
            }
          />
        </View>

        {/* Floating Action Button */}
        <Animated.View
          style={[
            styles.floatButtonContainer,
            {
              transform: [
                {
                  scale: floatButtonAnim,
                },
              ],
            },
          ]}>
          <TouchableOpacity
            style={[
              styles.floatButton,
              !hasChatAccess && styles.floatButtonDisabled,
            ]}
            onPress={handleCreateGroupPress}
            disabled={!hasChatAccess}
            activeOpacity={0.8}>
            <Text style={styles.floatButtonText}>+</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Options Modal */}
        {showOptionsModal && (
          <Animated.View
            style={[
              styles.modalOverlay,
              {
                opacity: modalAnim,
              },
            ]}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={hideModal}
              activeOpacity={1}>
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
                  <Text style={styles.modalTitle}>Chat Options</Text>
                  <TouchableOpacity
                    onPress={hideModal}
                    style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    togglePinChat(selectedChat);
                    hideModal();
                  }}
                  activeOpacity={0.7}>
                  <Text style={styles.optionIcon}>
                    {selectedChat?.pinned ? '📌' : '📍'}
                  </Text>
                  <Text style={styles.optionText}>
                    {selectedChat?.pinned ? 'Unpin Chat' : 'Pin Chat'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    clearChatMessages(selectedChat);
                    hideModal();
                  }}
                  activeOpacity={0.7}>
                  <Text style={styles.optionIcon}>🗑️</Text>
                  <Text style={styles.optionText}>Clear Messages</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, styles.deleteOptionButton]}
                  onPress={() => {
                    console.log('Delete Chat button pressed');
                    hideModal();
                    showDeleteConfirmationModal();
                    // deleteGroupChat();
                  }}
                  activeOpacity={0.7}>
                  <Text style={styles.optionIcon}>⚠️</Text>
                  <Text style={[styles.optionText, styles.deleteOptionText]}>
                    {selectedChat && isDirectChat(selectedChat)
                      ? 'Delete Chat'
                      : 'Delete Group'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Delete Confirmation Modal */}
        {console.log('showDeleteModal state:', showDeleteModal)}
        {showDeleteModal && (
          <Animated.View
            style={[
              styles.modalOverlay,
              {
                opacity: deleteModalAnim,
              },
            ]}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={hideDeleteConfirmationModal}
              activeOpacity={1}>
              <Animated.View
                style={[
                  styles.modalContainer,
                  {
                    transform: [
                      {
                        scale: deleteModalAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                    ],
                  },
                ]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedChat && isDirectChat(selectedChat)
                      ? 'Delete Chat?'
                      : 'Delete Group?'}
                  </Text>
                  <TouchableOpacity
                    onPress={hideDeleteConfirmationModal}
                    style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalText}>
                  Are you sure you want to delete "{selectedChat?.name}"? This
                  action cannot be undone.
                </Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={hideDeleteConfirmationModal}
                    activeOpacity={0.7}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={deleteGroupChat}
                    activeOpacity={0.7}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

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
  homeWrapper: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  // Header Section - Enhanced
  headerSection: {
    backgroundColor: colors?.primaryColorSecondary,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 12,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.35,
    shadowRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99, 102, 241, 0.15)',
  },
  profileArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#8b5cf6',
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarInitials: {
    color: '#ffffff',
    fontSize: 23,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: '#1e293b',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 5,
    letterSpacing: 0.3,
  },
  userStatus: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    color: '#22c55e',
    fontSize: 11,
    marginRight: 5,
  },
  profileButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileButtonIcon: {
    fontSize: 22,
  },

  subscriptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(94,234,212,0.25)',
  },
  subscriptionBannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(94,234,212,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  subscriptionBannerIconText: {
    fontSize: 20,
  },
  subscriptionBannerTextWrap: {
    flex: 1,
  },
  subscriptionBannerTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  subscriptionBannerSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
  },
  subscriptionBannerCta: {
    color: '#5eead4',
    fontWeight: '700',
    marginLeft: 14,
  },

  // Content Section
  contentSection: {
    flex: 1,
    paddingTop: 20,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 100,
  },

  // Chat Items
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginVertical: 6,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chatCircle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  chatInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  chatNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  pinIcon: {
    fontSize: 14,
    marginRight: 2,
  },
  chatText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    flex: 1,
  },
  chatTextUnread: {
    color: '#ffffff',
    fontWeight: '800',
  },
  chatTextNew: {
    color: '#60a5fa',
    fontWeight: '900',
    textShadowColor: 'rgba(59, 130, 246, 0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  timeText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  timeTextUnread: {
    color: '#94a3b8',
    fontWeight: '700',
  },
  timeTextNew: {
    color: '#93c5fd',
    fontWeight: '800',
  },
  lastMessage: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  unreadText: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 14,
  },
  newMessageText: {
    color: '#93c5fd',
    fontWeight: '700',
    fontSize: 14,
    textShadowColor: 'rgba(59, 130, 246, 0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },

  // Badge - Enhanced Design
  badgeContainer: {
    backgroundColor: '#ef4444',
    borderRadius: 16,
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
    elevation: 4,
    shadowColor: '#ef4444',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // New message badge styles
  newBadgeContainer: {
    backgroundColor: '#3b82f6',
    borderColor: '#60a5fa',
    minWidth: 32,
    height: 32,
    elevation: 8,
    shadowColor: '#3b82f6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  newBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  badgeGlow: {
    position: 'absolute',
    width: '130%',
    height: '130%',
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    opacity: 0.3,
    zIndex: -1,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Floating Button
  floatButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  floatButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  floatButtonDisabled: {
    opacity: 0.4,
  },

  // Modals
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  modalText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    lineHeight: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#f8fafc',
    fontWeight: '500',
  },
  deleteOptionButton: {
    borderBottomWidth: 0,
  },
  deleteOptionText: {
    color: '#ef4444',
  },
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#f8fafc',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },

  // New Message Dot Indicator
  // New message indicator dot (top right)
  newMessageDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  newMessageDotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981', // Green color for new indicator
    borderWidth: 3,
    borderColor: '#ffffff',
    elevation: 6,
    shadowColor: '#10b981',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});
