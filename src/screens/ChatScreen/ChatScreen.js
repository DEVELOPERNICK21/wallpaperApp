import React, {useEffect, useState, useRef, useCallback, useMemo} from 'react';
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
  Clipboard,
  Image,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Modal,
  PanResponder,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {colors} from '../../assets/color';
// import storage from '@react-native-image-picker';
import {launchImageLibrary} from 'react-native-image-picker';
import {width, height} from '../../assets/string';
import fonts from '../../assets/fonts';
import {presenceTracker, formatLastSeen} from '../../utils/presenceTracker';
import AIMessageService, {MESSAGE_STYLES} from '../../services/AIMessageService';

const {width: screenWidth} = Dimensions.get('window');

const ChatScreen = ({route, navigation}) => {
  const {chatId, groupNameed} = route.params;
  const currentUser = auth().currentUser;

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [replyMessage, setReplyMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showSeenByModal, setShowSeenByModal] = useState(false);
  const [seenByMessage, setSeenByMessage] = useState(null);
  const [seenByUsers, setSeenByUsers] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showPinnedModal, setShowPinnedModal] = useState(false);
  const [showMessageOptionsModal, setShowMessageOptionsModal] = useState(false);
  const [selectedMessageForOptions, setSelectedMessageForOptions] =
    useState(null);
  const [groupData, setGroupData] = useState(null);
  const [pinnedSectionExpanded, setPinnedSectionExpanded] = useState(true);
  const [currentPinnedIndex, setCurrentPinnedIndex] = useState(0);
  const [showChatMenuModal, setShowChatMenuModal] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const [blockedByUser, setBlockedByUser] = useState(false);
  const [otherUserOnlineStatus, setOtherUserOnlineStatus] = useState({
    isOnline: false,
    lastSeen: null,
  });
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const flatListRef = useRef(null);
  // Throttle snapshot updates refs (must be at top level)
  const snapshotUpdateTimeoutRef = useRef(null);
  const pendingSnapshotRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Helper function to get initials for avatar
  const getInitials = name => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper function to format date separator
  const formatDateSeparator = date => {
    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year:
        messageDate.getFullYear() !== today.getFullYear()
          ? 'numeric'
          : undefined,
    });
  };

  // Helper function to check if we need a date separator
  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;

    const currentDate =
      currentMessage.createdAt?.toDate?.() ||
      new Date(currentMessage.createdAt?.seconds * 1000);
    const previousDate =
      previousMessage.createdAt?.toDate?.() ||
      new Date(previousMessage.createdAt?.seconds * 1000);

    return currentDate.toDateString() !== previousDate.toDateString();
  };

  // Helper function to highlight search text
  const highlightSearchText = text => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      return text;
    }

    const query = searchQuery.trim();
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <Text key={index} style={styles.highlightedText}>
          {part}
        </Text>
      ) : (
        part
      ),
    );
  };

  // Animations
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const inputAnim = useRef(new Animated.Value(0)).current;
  const replyAnim = useRef(new Animated.Value(0)).current;
  const sendButtonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
      Animated.spring(inputAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (!chatId) {
      console.warn('ChatId is not available');
      return;
    }

    // Function to update chat name based on chat data
    const updateChatName = async (data) => {
      console.log('🔍 Updating chat name. Chat data:', {
        type: data.type,
        members: data.members,
        membersLength: data.members?.length,
        storedName: data.name,
        currentUserId: currentUser.uid,
      });

      // Check if it's a direct chat (either explicitly marked or has exactly 2 members)
      const isDirectChat = 
        (data.type === 'direct' || (!data.type && data.members?.length === 2)) &&
        data.members && 
        data.members.length === 2;

      if (isDirectChat) {
        // Find the other user's ID (not the current user)
        const otherUserId = data.members.find(
          memberId => memberId !== currentUser.uid
        );
        
        console.log('👤 Direct chat detected. Other user ID:', otherUserId);
        
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
              const otherUserName = 
                otherUserData.displayName || 
                otherUserData.name || 
                otherUserData.email?.split('@')[0] || 
                'Unknown User';
              
              console.log('✅ Setting chat name to other user:', otherUserName);
              setGroupName(otherUserName);
            } else {
              console.warn('⚠️ Other user document not found, using stored name');
              // Fallback to stored name if user doc doesn't exist
              setGroupName(data.name || 'Unknown User');
            }
          } catch (userError) {
            console.error('❌ Error fetching other user name:', userError);
            // Fallback to stored name
            setGroupName(data.name || 'Unknown User');
          }
        } else {
          console.warn('⚠️ Could not find other user ID');
          setGroupName(data.name || 'Direct Chat');
        }
      } else {
        // For group chats, use the stored name
        console.log('👥 Group chat detected. Using stored name:', data.name);
        setGroupName(data.name || 'Group Chat');
      }
    };

    // Fetch Group Name and Data
    const fetchGroupName = async () => {
      try {
        setIsLoading(true);
        const groupDoc = await firestore()
          .collection('GroupChats')
          .doc(chatId)
          .get();
        if (groupDoc.exists) {
          const data = groupDoc.data();
          setGroupData(data);
          await updateChatName(data);
        } else {
          setGroupName('Group Chat');
        }
      } catch (error) {
        console.error('Error fetching group name:', error);
        setGroupName('Group Chat');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupName();

    // Listen for chat data changes in real-time (to update name when someone starts chatting with you)
    const unsubscribeChatData = firestore()
      .collection('GroupChats')
      .doc(chatId)
      .onSnapshot(
        snapshot => {
          if (snapshot.exists) {
            const data = snapshot.data();
            setGroupData(data);
            // Update chat name whenever chat data changes
            updateChatName(data);
          }
        },
        error => {
          console.error('Error listening to chat data:', error);
        }
      );

    // Listen for Pinned Messages
    let unsubscribePinned;
    try {
      // Using namespaced API (still supported in v21)
      // Note: Deprecation warning is for future v22 migration
      unsubscribePinned = firestore()
        .collection('GroupChats')
        .doc(chatId)
        .collection('Messages')
        .where('pinned', '==', true)
        // Removed .orderBy() to avoid needing Firestore index
        // We'll sort in JavaScript instead
        .onSnapshot(
          snapshot => {
            const pinned = snapshot.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data(),
              }))
              // Sort by pinnedAt in JavaScript (newest first)
              .sort((a, b) => {
                const timeA = a.pinnedAt?.toDate?.() || new Date(0);
                const timeB = b.pinnedAt?.toDate?.() || new Date(0);
                return timeB - timeA;
              });

            console.log(`📌 Pinned messages loaded: ${pinned.length}`);
            if (pinned.length > 0) {
              console.log('📌 First pinned message:', pinned[0].text);
              console.log('📌 Pinned message data:', {
                id: pinned[0].id,
                pinned: pinned[0].pinned,
                pinnedBy: pinned[0].pinnedBy,
                pinnedAt: pinned[0].pinnedAt,
              });
            }
            setPinnedMessages(pinned);
          },
          error => {
            console.error('❌ Error listening to pinned messages:', error);
            console.error('❌ Error code:', error.code);
            console.error('❌ Error message:', error.message);
            // If index doesn't exist, just set empty array
            if (error.code === 'failed-precondition') {
              console.log(
                '📌 Firestore index needed for pinned messages. Click the link in the error to create it.',
              );
              console.log(error.message);
            }
            setPinnedMessages([]);
          },
        );
    } catch (error) {
      console.error('❌ Error setting up pinned messages listener:', error);
      unsubscribePinned = () => {}; // No-op function
    }

    // Process a single message (simplified - no encryption)
    const processMessage = (doc) => {
      const data = doc.data();
      const messageId = doc.id;
      
      // Return plain text message
      return {
        id: messageId,
        ...data,
        text: data.text || data.encryptedText || '', // Support both encryptedText (old messages) and text
      };
    };

    // Process snapshot update (throttled)
    const processSnapshotUpdate = (snapshot) => {
      // Clear any pending timeout
      if (snapshotUpdateTimeoutRef.current) {
        clearTimeout(snapshotUpdateTimeoutRef.current);
      }
      
      // Store the latest snapshot
      pendingSnapshotRef.current = snapshot;
      
      // Throttle updates to max once per 100ms
      snapshotUpdateTimeoutRef.current = setTimeout(() => {
        if (!pendingSnapshotRef.current) return;
        
        const snapshotToProcess = pendingSnapshotRef.current;
        pendingSnapshotRef.current = null;
        
        // Process messages (no encryption/decryption needed)
        const processedMessages = snapshotToProcess.docs.map(doc => processMessage(doc));

        // Filter out messages deleted by current user (Delete for Me)
        const filteredMessages = processedMessages.filter(msg => {
          const deletedForUsers = msg.deletedForUsers || [];
          return !deletedForUsers.includes(currentUser.uid);
        });
        
        // Use requestIdleCallback if available, otherwise requestAnimationFrame
        const scheduleUpdate = (typeof requestIdleCallback !== 'undefined') 
          ? requestIdleCallback 
          : requestAnimationFrame;
        
        scheduleUpdate(() => {
          setMessages(prevMessages => {
            // Quick check: if messages haven't changed, don't update
            if (prevMessages.length === filteredMessages.length) {
              let hasChanges = false;
              for (let idx = 0; idx < filteredMessages.length; idx++) {
                const msg = filteredMessages[idx];
                const prev = prevMessages[idx];
                if (!prev || prev.id !== msg.id || prev.text !== msg.text) {
                  hasChanges = true;
                  break;
                }
              }
              if (!hasChanges) {
                return prevMessages;
              }
            }

            // Keep optimistic messages that aren't in Firestore yet
            const existingIds = new Set(filteredMessages.map(msg => msg.id));
            const optimisticMessages = prevMessages.filter(
              msg => !existingIds.has(msg.id) && msg.senderId === currentUser.uid
            );
            
            // Pre-calculate timestamps for faster sorting
            const messagesWithTimestamps = filteredMessages.map(msg => ({
              ...msg,
              _sortTime: msg.createdAt?.toMillis?.() || msg.createdAt?.seconds * 1000 || 0
            }));
            
            const optimisticWithTimestamps = optimisticMessages.map(msg => ({
              ...msg,
              _sortTime: msg.createdAt?.toMillis?.() || msg.createdAt?.seconds * 1000 || 0
            }));
            
            // Combine and sort by pre-calculated timestamp
            const allMessages = [...messagesWithTimestamps, ...optimisticWithTimestamps];
            allMessages.sort((a, b) => a._sortTime - b._sortTime);
            
            // Remove temporary sort property
            return allMessages.map(({_sortTime, ...msg}) => msg);
          });
        });
        
        // Mark messages as seen (non-blocking, debounced)
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => {
            markMessagesAsSeen(filteredMessages);
          });
        } else {
          setTimeout(() => markMessagesAsSeen(filteredMessages), 0);
        }
      }, 100);
    };

    // Listen for Messages with ultra-optimized processing
    const unsubscribe = firestore()
      .collection('GroupChats')
      .doc(chatId)
      .collection('Messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(processSnapshotUpdate);

    // Listen for Typing Status (throttled)
    const unsubscribeTyping = firestore()
      .collection('GroupChats')
      .doc(chatId)
      .onSnapshot(snapshot => {
        // Throttle typing updates
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          const data = snapshot.data();
          if (data?.typingUser && data.typingUser !== currentUser.displayName) {
            setTypingUser(data.typingUser);
            setIsTyping(true);
            fadeInTyping();
          } else {
            fadeOutTyping();
          }
        }, 300);
      });

    return () => {
      // Cleanup timeouts
      if (snapshotUpdateTimeoutRef.current) {
        clearTimeout(snapshotUpdateTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      unsubscribe();
      unsubscribeTyping();
      if (unsubscribeChatData) {
        unsubscribeChatData();
      }
      if (unsubscribePinned) {
        unsubscribePinned();
      }
    };
  }, [chatId]);

  useEffect(() => {
    if (chatId) {
      markChatAsRead(chatId);
    }
  }, [chatId]);

  // Debug: Track pinned messages state and reset index if needed
  useEffect(() => {
    console.log('📊 Pinned messages state updated:', pinnedMessages.length);
    if (pinnedMessages.length > 0) {
      console.log(
        '📊 Current pinned messages:',
        pinnedMessages.map(m => m.text?.substring(0, 30)),
      );

      // Reset index if it's out of bounds
      if (currentPinnedIndex >= pinnedMessages.length) {
        console.log(
          '⚠️ Resetting pinned index from',
          currentPinnedIndex,
          'to 0',
        );
        setCurrentPinnedIndex(0);
      }
    } else {
      // No pinned messages, reset index
      if (currentPinnedIndex !== 0) {
        setCurrentPinnedIndex(0);
      }
    }
  }, [pinnedMessages, currentPinnedIndex]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('GroupChats')
      .doc(chatId)
      .collection('Messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
        const newMessages = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
          // Filter out messages deleted by current user (Delete for Me)
          .filter(msg => {
            const deletedForUsers = msg.deletedForUsers || [];
            return !deletedForUsers.includes(currentUser.uid);
          });
        setMessages(newMessages);
        markMessagesAsSeen(newMessages);
      });

    return () => {
      // Update lastReadTimestamps one final time when leaving the chat
      const updateTimestampOnExit = async () => {
        if (messages.length > 0) {
          const latestMessage = messages[messages.length - 1];
          if (latestMessage?.createdAt) {
            try {
              const messageTime = latestMessage.createdAt.toDate
                ? latestMessage.createdAt.toDate()
                : new Date(latestMessage.createdAt.seconds * 1000);

              await firestore()
                .collection('GroupChats')
                .doc(chatId)
                .update({
                  [`lastReadTimestamps.${currentUser.uid}`]:
                    firestore.Timestamp.fromDate(messageTime),
                });
              console.log('✅ Updated lastReadTimestamps on exit');
            } catch (error) {
              console.error('Error updating timestamp on exit:', error);
            }
          }
        }
      };

      updateTimestampOnExit();
      unsubscribe();
    };
  }, [chatId]);

  // Animate send button when text changes
  useEffect(() => {
    Animated.spring(sendButtonAnim, {
      toValue: messageText.trim().length > 0 ? 1 : 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [messageText, sendButtonAnim]);

  // Animate reply preview
  useEffect(() => {
    Animated.timing(replyAnim, {
      toValue: replyMessage ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [replyMessage]);

  const markChatAsRead = async chatId => {
    try {
      const userId = auth().currentUser.uid;

      await firestore()
        .collection('GroupChats')
        .doc(chatId)
        .update({
          [`lastReadTimestamps.${userId}`]:
            firestore.FieldValue.serverTimestamp(),
        });

      console.log(`Marked chat ${chatId} as read`);
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  };

  const markMessagesAsSeen = async messages => {
    if (!messages || messages.length === 0) return;

    let latestMessageTimestamp = null;

    for (let message of messages) {
      if (
        !message.seenBy?.includes(currentUser.uid) &&
        message.senderId !== currentUser.uid
      ) {
        await firestore()
          .collection('GroupChats')
          .doc(chatId)
          .collection('Messages')
          .doc(message.id)
          .update({
            seenBy: firestore.FieldValue.arrayUnion(currentUser.uid),
            [`seenByDetails.${currentUser.uid}`]: {
              userId: currentUser.uid,
              userName: currentUser.displayName || currentUser.email,
              seenAt: firestore.FieldValue.serverTimestamp(),
            },
          });
      }

      // Track the latest message timestamp
      if (message.createdAt) {
        const messageTime = message.createdAt.toDate
          ? message.createdAt.toDate()
          : new Date(message.createdAt.seconds * 1000);

        if (!latestMessageTimestamp || messageTime > latestMessageTimestamp) {
          latestMessageTimestamp = messageTime;
        }
      }
    }

    // Update lastReadTimestamps in the GroupChat document
    // This ensures HomeScreen shows correct unread count
    if (latestMessageTimestamp) {
      try {
        await firestore()
          .collection('GroupChats')
          .doc(chatId)
          .update({
            [`lastReadTimestamps.${currentUser.uid}`]:
              firestore.Timestamp.fromDate(latestMessageTimestamp),
            // ⚡ PERFORMANCE OPTIMIZATION: Reset unread count for current user
            [`unreadCounts.${currentUser.uid}`]: 0,
          });
        console.log('✅ Updated lastReadTimestamps and reset unread count');
      } catch (error) {
        console.error('Error updating lastReadTimestamps:', error);
      }
    }
  };

  const fetchSeenByUsers = async message => {
    try {
      const seenByArray = message.seenBy || [];
      const seenByDetails = message.seenByDetails || {};

      const users = seenByArray
        .filter(uid => uid !== message.senderId) // Don't show sender
        .map(uid => {
          const details = seenByDetails[uid];
          return {
            userId: uid,
            userName: details?.userName || 'Unknown User',
            seenAt: details?.seenAt,
          };
        });

      setSeenByUsers(users);
    } catch (error) {
      console.error('Error fetching seen by users:', error);
      setSeenByUsers([]);
    }
  };

  const showSeenByInfo = async message => {
    if (!message.seenBy || message.seenBy.length <= 1) {
      return; // No one has seen it yet
    }
    setSeenByMessage(message);
    await fetchSeenByUsers(message);
    setShowSeenByModal(true);
  };

  // Handle AI message rephrasing
  const handleRephraseMessage = async (style) => {
    if (!messageText.trim()) {
      Alert.alert('No Message', 'Please type a message first');
      return;
    }

    setIsRephrasing(true);
    setShowStyleSelector(false);

    try {
      const rephrasedMessage = await AIMessageService.rephraseMessage(
        messageText,
        style
      );
      setMessageText(rephrasedMessage);
    } catch (error) {
      console.error('Error rephrasing message:', error);
      Alert.alert(
        'Rephrasing Failed',
        error?.message || 'Failed to rephrase message. Please try again.'
      );
    } finally {
      setIsRephrasing(false);
    }
  };

  const handleTyping = async text => {
    setMessageText(text);
    await firestore()
      .collection('GroupChats')
      .doc(chatId)
      .update({
        typingUser: text ? currentUser.displayName : '',
      });
  };

  const sendImageMessage = async imageUrl => {
    if (!imageUrl) return;

    await firestore()
      .collection('GroupChats')
      .doc(chatId)
      .collection('Messages')
      .add({
        imageUrl: imageUrl,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Unknown',
        createdAt: firestore.FieldValue.serverTimestamp(),
        seenBy: [currentUser.uid],
      });

    await firestore()
      .collection('GroupChats')
      .doc(chatId)
      .update({typingUser: ''});
  };

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

  const deleteMessage = async message => {
    setSelectedMessage(message);
    setShowDeleteModal(true);
  };

  const deleteForMe = async messageId => {
    try {
      // Add current user to deletedForUsers array in Firestore
      await firestore()
        .collection('GroupChats')
        .doc(chatId)
        .collection('Messages')
        .doc(messageId)
        .update({
          deletedForUsers: firestore.FieldValue.arrayUnion(currentUser.uid),
        });

      console.log('✅ Message deleted for you');
    } catch (error) {
      console.error('❌ Error deleting message for me:', error);
      Alert.alert('Error', 'Failed to delete message');
    }
  };

  const deleteForEveryone = async messageId => {
    try {
      // Mark the message as deleted instead of removing it
      await firestore()
        .collection('GroupChats')
        .doc(chatId)
        .collection('Messages')
        .doc(messageId)
        .update({
          deleted: true,
          deletedAt: firestore.FieldValue.serverTimestamp(),
          deletedBy: currentUser.uid,
          text: '', // Clear the text content
          imageUrl: null, // Clear any image
        });

      // Optimistically update local state
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                deleted: true,
                deletedAt: new Date(),
                deletedBy: currentUser.uid,
                text: '',
                imageUrl: null,
              }
            : msg,
        ),
      );

      // Update pinned messages if it was pinned
      setPinnedMessages(prevPinned =>
        prevPinned.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                deleted: true,
                deletedAt: new Date(),
                deletedBy: currentUser.uid,
                text: '',
                imageUrl: null,
              }
            : msg,
        ),
      );

      console.log('✅ Message marked as deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      Alert.alert('Error', 'Failed to delete message');
    }
  };

  // Pin/Unpin Message Functions
  const togglePinMessage = async message => {
    if (!chatId || !message || !message.id) {
      console.error('❌ Missing required data for pin/unpin');
      Alert.alert('Error', 'Cannot pin/unpin this message');
      return;
    }

    try {
      const isPinned = message.pinned || false;
      console.log(
        `📌 ${isPinned ? 'Unpinning' : 'Pinning'} message:`,
        message.text?.substring(0, 50),
      );

      // Optimistically update local state
      if (isPinned) {
        // Remove from pinned messages
        setPinnedMessages(prev => prev.filter(msg => msg.id !== message.id));
      } else {
        // Add to pinned messages
        const pinnedMessage = {
          ...message,
          pinned: true,
          pinnedBy: currentUser.uid,
          pinnedAt: new Date(),
          pinnedByName: currentUser.displayName || currentUser.email,
        };
        setPinnedMessages(prev => [pinnedMessage, ...prev]);
      }

      // Update Firestore
      await firestore()
        .collection('GroupChats')
        .doc(chatId)
        .collection('Messages')
        .doc(message.id)
        .update({
          pinned: !isPinned,
          pinnedBy: !isPinned ? currentUser.uid : null,
          pinnedAt: !isPinned ? firestore.FieldValue.serverTimestamp() : null,
          pinnedByName: !isPinned
            ? currentUser.displayName || currentUser.email
            : null,
        });

      console.log(
        `✅ Message ${isPinned ? 'unpinned' : 'pinned'} successfully`,
      );
      Alert.alert(
        'Success',
        isPinned ? 'Message unpinned' : 'Message pinned successfully',
      );
    } catch (error) {
      console.error('❌ Error toggling pin:', error);
      Alert.alert('Error', 'Failed to pin/unpin message');
    }
  };

  const handleMessageLongPress = message => {
    setSelectedMessageForOptions(message);
    setShowMessageOptionsModal(true);
  };

  // Block/Unblock User
  const blockUser = async userId => {
    try {
      const userDoc = await firestore()
        .collection('Users')
        .doc(currentUser?.uid)
        .get();

      const blockedUsers = userDoc.data()?.privacySettings?.blockedUsers || [];

      if (blockedUsers.includes(userId)) {
        // Unblock
        Alert.alert('Unblock User', 'Do you want to unblock this user?', [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Unblock',
            onPress: async () => {
              await firestore()
                .collection('Users')
                .doc(currentUser?.uid)
                .update({
                  'privacySettings.blockedUsers':
                    firestore.FieldValue.arrayRemove(userId),
                });
              Alert.alert('Success', 'User unblocked');
              setShowChatMenuModal(false);
              // Refresh block status
              await checkBlockStatus();
            },
          },
        ]);
      } else {
        // Block
        Alert.alert(
          'Block User',
          'Are you sure you want to block this user? They will not be able to send you messages.',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Block',
              style: 'destructive',
              onPress: async () => {
                await firestore()
                  .collection('Users')
                  .doc(currentUser?.uid)
                  .update({
                    'privacySettings.blockedUsers':
                      firestore.FieldValue.arrayUnion(userId),
                  });
                Alert.alert('Success', 'User blocked');
                setShowChatMenuModal(false);
                // Refresh block status
                await checkBlockStatus();
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      Alert.alert('Error', 'Failed to update block status');
    }
  };

  // Check if user is blocked (both ways)
  const checkBlockStatus = async () => {
    if (!groupData || !groupData.members || groupData.members.length !== 2) {
      setIsUserBlocked(false);
      setBlockedByUser(false);
      return;
    }

    try {
      const otherUserId = groupData.members.find(id => id !== currentUser?.uid);

      if (!otherUserId) return;

      // Check if I blocked them
      const myDoc = await firestore()
        .collection('Users')
        .doc(currentUser?.uid)
        .get();
      const myBlockedUsers = myDoc.data()?.privacySettings?.blockedUsers || [];
      setIsUserBlocked(myBlockedUsers.includes(otherUserId));

      // Check if they blocked me
      const theirDoc = await firestore()
        .collection('Users')
        .doc(otherUserId)
        .get();
      const theirBlockedUsers =
        theirDoc.data()?.privacySettings?.blockedUsers || [];
      setBlockedByUser(theirBlockedUsers.includes(currentUser?.uid));
    } catch (error) {
      console.error('Error checking block status:', error);
    }
  };

  // Check block status when groupData changes
  useEffect(() => {
    checkBlockStatus();
  }, [groupData]);

  // Real-time listener for block status changes
  useEffect(() => {
    if (!groupData || !groupData.members || groupData.members.length !== 2) {
      return;
    }

    const otherUserId = groupData.members.find(id => id !== currentUser?.uid);
    if (!otherUserId) return;

    console.log('👂 Setting up real-time block status listener');

    // Listen to my block list changes
    const unsubscribeMyBlocks = firestore()
      .collection('Users')
      .doc(currentUser?.uid)
      .onSnapshot(
        doc => {
          const myBlockedUsers =
            doc.data()?.privacySettings?.blockedUsers || [];
          const wasBlocked = isUserBlocked;
          const nowBlocked = myBlockedUsers.includes(otherUserId);
          setIsUserBlocked(nowBlocked);

          if (!wasBlocked && nowBlocked) {
            console.log('🚫 You blocked this user');
          } else if (wasBlocked && !nowBlocked) {
            console.log('✅ You unblocked this user');
          }
        },
        error => {
          console.error('Error listening to my blocks:', error);
        },
      );

    // Listen to their block list changes
    const unsubscribeTheirBlocks = firestore()
      .collection('Users')
      .doc(otherUserId)
      .onSnapshot(
        doc => {
          const theirBlockedUsers =
            doc.data()?.privacySettings?.blockedUsers || [];
          const wasBlockedByThem = blockedByUser;
          const nowBlockedByThem = theirBlockedUsers.includes(currentUser?.uid);
          setBlockedByUser(nowBlockedByThem);

          if (!wasBlockedByThem && nowBlockedByThem) {
            console.log('🚫 You have been blocked by this user');
            Alert.alert(
              'You Have Been Blocked',
              'This user has blocked you. You can no longer send messages to them.',
              [{text: 'OK'}],
            );
          } else if (wasBlockedByThem && !nowBlockedByThem) {
            console.log('✅ You have been unblocked by this user');
            Alert.alert(
              'You Have Been Unblocked',
              'You can now send messages to this user.',
              [{text: 'OK'}],
            );
          }
        },
        error => {
          console.error('Error listening to their blocks:', error);
        },
      );

    return () => {
      console.log('🧹 Cleaning up block status listeners');
      unsubscribeMyBlocks();
      unsubscribeTheirBlocks();
    };
  }, [groupData, currentUser?.uid]);

  // Listen to other user's online status (for direct chats only)
  useEffect(() => {
    if (!groupData || !groupData.members || groupData.members.length !== 2) {
      // Not a direct chat, reset status
      setOtherUserOnlineStatus({isOnline: false, lastSeen: null});
      return;
    }

    // Get other user's ID
    const otherUserId = groupData.members.find(id => id !== currentUser?.uid);

    if (!otherUserId) return;

    console.log('👂 Setting up online status listener for user:', otherUserId);

    // Listen to other user's status
    const unsubscribe = presenceTracker.listenToUserStatus(
      otherUserId,
      (isOnline, lastSeen) => {
        setOtherUserOnlineStatus({isOnline, lastSeen});
      },
    );

    return () => {
      console.log('🧹 Cleaning up online status listener');
      unsubscribe();
    };
  }, [groupData, currentUser]);

  // Chat Menu Actions
  const clearAllMessages = async () => {
    Alert.alert(
      'Clear All Messages',
      'Are you sure you want to clear all messages in this chat? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const messagesSnapshot = await firestore()
                .collection('GroupChats')
                .doc(chatId)
                .collection('Messages')
                .get();

              const batch = firestore().batch();
              messagesSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
              });

              await batch.commit();
              Alert.alert('Success', 'All messages cleared');
              setShowChatMenuModal(false);
            } catch (error) {
              console.error('Error clearing messages:', error);
              Alert.alert('Error', 'Failed to clear messages');
            }
          },
        },
      ],
    );
  };

  const unpinAllMessages = async () => {
    Alert.alert(
      'Unpin All Messages',
      `Are you sure you want to unpin all ${
        pinnedMessages.length
      } pinned message${pinnedMessages.length !== 1 ? 's' : ''}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unpin All',
          style: 'destructive',
          onPress: async () => {
            try {
              const batch = firestore().batch();
              pinnedMessages.forEach(msg => {
                const msgRef = firestore()
                  .collection('GroupChats')
                  .doc(chatId)
                  .collection('Messages')
                  .doc(msg.id);
                batch.update(msgRef, {
                  pinned: false,
                  pinnedBy: null,
                  pinnedAt: null,
                  pinnedByName: null,
                });
              });

              await batch.commit();

              // Optimistically clear pinned messages
              setPinnedMessages([]);
              setCurrentPinnedIndex(0);

              Alert.alert('Success', 'All messages unpinned');
              setShowChatMenuModal(false);
            } catch (error) {
              console.error('Error unpinning messages:', error);
              Alert.alert('Error', 'Failed to unpin messages');
            }
          },
        },
      ],
    );
  };

  // Fetch and show group members
  const showGroupMembers = async () => {
    if (!groupData || !groupData.members || groupData.members.length === 0) {
      Alert.alert('No Members', 'This chat has no members.');
      return;
    }

    // If it's a direct chat (only 2 members), don't show members
    if (groupData.type === 'direct' || groupData.members.length === 2) {
      return; // Don't show members for 1-on-1 chats
    }

    setLoadingMembers(true);
    setShowMembersModal(true);

    try {
      const memberDetails = await Promise.all(
        groupData.members.map(async memberId => {
          try {
            const userDoc = await firestore()
              .collection('Users')
              .doc(memberId)
              .get();

            if (userDoc.exists) {
              return {
                id: memberId,
                ...userDoc.data(),
                isCurrentUser: memberId === currentUser?.uid,
                isCreator: memberId === groupData.createdBy,
              };
            }
            return {
              id: memberId,
              name: 'Unknown User',
              email: 'N/A',
              isCurrentUser: memberId === currentUser?.uid,
              isCreator: memberId === groupData.createdBy,
            };
          } catch (error) {
            console.error('Error fetching member:', error);
            return {
              id: memberId,
              name: 'Unknown User',
              email: 'N/A',
              isCurrentUser: memberId === currentUser?.uid,
              isCreator: memberId === groupData.createdBy,
            };
          }
        }),
      );

      setGroupMembers(memberDetails);
    } catch (error) {
      console.error('Error fetching group members:', error);
      Alert.alert('Error', 'Failed to load group members');
    } finally {
      setLoadingMembers(false);
    }
  };

  // Search functionality
  const handleSearch = query => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }

    const results = messages
      .filter(
        msg =>
          msg.text &&
          msg.text.toLowerCase().includes(query.toLowerCase().trim()),
      )
      .map((msg, index) => ({
        ...msg,
        originalIndex: messages.findIndex(m => m.id === msg.id),
      }));

    setSearchResults(results);
    setCurrentSearchIndex(0);

    if (results.length > 0) {
      scrollToMessage(results[0].originalIndex);
    }
  };

  const goToNextSearchResult = () => {
    if (searchResults.length > 0) {
      const nextIndex = (currentSearchIndex + 1) % searchResults.length;
      setCurrentSearchIndex(nextIndex);
      scrollToMessage(searchResults[nextIndex].originalIndex);
    }
  };

  const goToPreviousSearchResult = () => {
    if (searchResults.length > 0) {
      const prevIndex =
        currentSearchIndex === 0
          ? searchResults.length - 1
          : currentSearchIndex - 1;
      setCurrentSearchIndex(prevIndex);
      scrollToMessage(searchResults[prevIndex].originalIndex);
    }
  };

  const closeSearch = () => {
    setShowSearchBar(false);
    setSearchQuery('');
    setSearchResults([]);
    setCurrentSearchIndex(0);
  };

  const scrollToMessage = index => {
    if (flatListRef.current && index >= 0 && index < messages.length) {
      try {
        flatListRef.current.scrollToIndex({
          index: index,
          animated: true,
          viewPosition: 0.5,
        });
      } catch (error) {
        console.log('Scroll error:', error);
      }
    }
  };

  // Navigate between pinned messages
  const goToNextPinned = () => {
    if (pinnedMessages.length > 1) {
      setCurrentPinnedIndex(prev =>
        prev >= pinnedMessages.length - 1 ? 0 : prev + 1,
      );
    }
  };

  const goToPreviousPinned = () => {
    if (pinnedMessages.length > 1) {
      setCurrentPinnedIndex(prev =>
        prev <= 0 ? pinnedMessages.length - 1 : prev - 1,
      );
    }
  };

  // Scroll to pinned message in chat
  const scrollToPinnedMessage = messageId => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1 && flatListRef.current) {
      try {
        flatListRef.current.scrollToIndex({
          index: messageIndex,
          animated: true,
          viewPosition: 0.5,
        });
      } catch (error) {
        console.log('Scroll error, trying alternative method:', error);
        // Fallback: scroll to end then try again
        flatListRef.current.scrollToEnd({animated: false});
        setTimeout(() => {
          try {
            flatListRef.current.scrollToIndex({
              index: messageIndex,
              animated: true,
              viewPosition: 0.5,
            });
          } catch (e) {
            console.log('Could not scroll to message');
          }
        }, 100);
      }
    }
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      if (imageUri) {
        uploadImage(imageUri);
      } else {
        console.error('No image URI found');
      }
    } else {
      console.error('No image selected');
    }
  };

  const uploadImage = async uri => {
    // const fileName = `chat_images/${chatId}/${Date.now()}.jpg`;
    // const reference = storage().ref(fileName);
    // try {
    //   await reference.putFile(uri);
    //   const imageUrl = await reference.getDownloadURL();
    //   sendImageMessage(imageUrl);
    // } catch (error) {
    //   console.error('Error uploading image:', error);
    // }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    // Check if user is blocked
    if (isUserBlocked) {
      Alert.alert(
        'Cannot Send Message',
        'You have blocked this user. Unblock them to send messages.',
      );
      return;
    }

    if (blockedByUser) {
      Alert.alert(
        'Cannot Send Message',
        'This user has blocked you. You cannot send messages.',
      );
      return;
    }

      try {
      let messageData = {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Unknown',
        text: messageText,
        createdAt: firestore.FieldValue.serverTimestamp(),
        seenBy: [currentUser.uid],
        isEncrypted: false,
        replyTo: replyMessage
          ? {
              id: replyMessage.id,
              text: replyMessage.text,
              sender: replyMessage.senderName,
            }
          : null,
      };
      
      // Send message to Firestore
      await firestore()
        .collection('GroupChats')
        .doc(chatId)
        .collection('Messages')
        .add(messageData);
      
      setMessageText('');
      setReplyMessage(null);

      // ⚡ PERFORMANCE OPTIMIZATION: Update GroupChat with lastMessage and unreadCounts
      try {
        const groupDoc = await firestore()
          .collection('GroupChats')
          .doc(chatId)
          .get();

        if (groupDoc.exists) {
          const groupData = groupDoc.data();
          const members = groupData.members || [];

          // Prepare lastMessage object for quick access in HomeScreen
          // Use Timestamp.now() instead of serverTimestamp() so it's immediately available
          const now = firestore.Timestamp.now();
          const lastMessageText = messageText;
          const lastMessageData = {
            text: lastMessageText,
            senderId: currentUser.uid,
            senderName: currentUser.displayName || 'Unknown',
            createdAt: now,
          };

          // Calculate new unread counts for all members except sender
          const unreadCounts = {};
          members.forEach(memberId => {
            if (memberId !== currentUser.uid) {
              // Increment unread count for other members
              const currentCount = groupData.unreadCounts?.[memberId] || 0;
              unreadCounts[`unreadCounts.${memberId}`] = currentCount + 1;
            } else {
              // Reset count for sender
              unreadCounts[`unreadCounts.${memberId}`] = 0;
            }
          });

          // Update GroupChat document with optimized fields
          await firestore()
            .collection('GroupChats')
            .doc(chatId)
            .update({
              lastMessage: lastMessageData,
              typingUser: '',
              ...unreadCounts,
            });

          console.log('⚡ Updated GroupChat with lastMessage and unreadCounts');

          // Send push notifications
          const tokens = [];
          for (const memberId of members) {
            if (memberId !== currentUser.uid) {
              const userDoc = await firestore()
                .collection('users')
                .doc(memberId)
                .get();
              if (userDoc.exists && userDoc.data().fcmToken) {
                tokens.push(userDoc.data().fcmToken);
              }
            }
          }

          for (const token of tokens) {
            sendPushNotification(
              token,
              currentUser.displayName,
              sentMessageText,
            );
          }
        }
      } catch (error) {
        console.error('Error updating GroupChat metadata:', error);
        // Don't fail the message send if metadata update fails
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleReply = message => {
    setReplyMessage(message);
  };

  const sendPushNotification = async (token, senderName, message) => {
    fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=YOUR_SERVER_KEY`,
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
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex);
  };

  const copyToClipboard = text => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Message copied to clipboard');
  };

  // Memoize renderMessage to prevent unnecessary re-renders
  const renderMessage = useCallback(({item, index}) => {
    const isCurrentUser = item.senderId === currentUser.uid;
    const previousMessage =
      index < messages.length - 1 ? messages[index + 1] : null;
    const showDateSeparator = shouldShowDateSeparator(item, previousMessage);

    // Safe timestamp handling (memoized computation)
    let messageTime = 'Sending...';
    let messageDate = null;
    if (item.createdAt) {
      if (item.createdAt.seconds) {
        // Firestore timestamp
        const date = new Date(item.createdAt.seconds * 1000);
        messageTime = date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        messageDate = date;
      } else if (item.createdAt.toDate) {
        // Firestore timestamp with toDate method
        const date = item.createdAt.toDate();
        messageTime = date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        messageDate = date;
      } else if (item.createdAt.getTime) {
        // JavaScript Date object
        messageTime = item.createdAt.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        messageDate = item.createdAt;
      }
    }

    return (
      <View>
        {/* Date Separator */}
        {showDateSeparator && messageDate && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateSeparatorLine} />
            <Text style={styles.dateSeparatorText}>
              {formatDateSeparator(messageDate)}
            </Text>
            <View style={styles.dateSeparatorLine} />
          </View>
        )}

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
          entering={Animated.spring({
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          })}>
          <View style={styles.messageRow}>
            {/* Avatar for received messages */}
            {!isCurrentUser && (
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(item.senderName)}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              onLongPress={() => handleMessageLongPress(item)}
              onPress={() => handleReply(item)}
              activeOpacity={0.8}
              style={{flex: 1}}>
              <View
                style={[
                  styles.messageContainer,
                  isCurrentUser ? styles.sentMessage : styles.receivedMessage,
                  item.pinned && styles.pinnedMessage,
                ]}>
                {item.pinned && (
                  <View style={styles.pinnedIndicator}>
                    <Text style={styles.pinnedIcon}>📌</Text>
                    <Text style={styles.pinnedText}>Pinned</Text>
                  </View>
                )}
                {!isCurrentUser && (
                  <Text style={styles.senderName}>{item.senderName}</Text>
                )}

                {item.replyTo && (
                  <View style={styles.replyContainer}>
                    <Text style={styles.replyText}>
                      {item.replyTo.sender}: {item.replyTo.text}
                    </Text>
                  </View>
                )}

                {/* Check if message is deleted */}
                {item.deleted ? (
                  <View style={styles.deletedMessageContainer}>
                    <Text style={styles.deletedIcon}>🚫</Text>
                    <Text style={styles.deletedText}>
                      {item.deletedBy === currentUser.uid
                        ? 'You deleted this message'
                        : 'This message was deleted'}
                    </Text>
                  </View>
                ) : item.imageUrl ? (
                  <Image
                    source={{uri: item.imageUrl}}
                    style={styles.chatImage}
                  />
                ) : (
                  <Text
                    style={[
                      styles.message,
                      isCurrentUser
                        ? styles.sentMessageText
                        : styles.receivedMessageText,
                    ]}>
                    {item.text.split(' ').map((word, index) => {
                      const urls = extractUrls(word);
                      if (urls) {
                        return (
                          <Text
                            key={index}
                            style={styles.urlText}
                            onPress={() => Linking.openURL(word)}>
                            {word}{' '}
                          </Text>
                        );
                      }
                      return (
                        <Text key={index}>
                          {highlightSearchText(word + ' ')}
                        </Text>
                      );
                    })}
                  </Text>
                )}

                <View style={styles.messageFooter}>
                  <Text style={styles.messageTime}>{messageTime}</Text>
                  {isCurrentUser && (
                    <TouchableOpacity
                      style={styles.seenIndicator}
                      onPress={() => showSeenByInfo(item)}
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          styles.seenText,
                          item.seenBy.length > 1 && styles.seenTextRead,
                        ]}>
                        {item.seenBy.length > 1 ? '✓✓' : '✓'}
                      </Text>
                      {item.seenBy && item.seenBy.length > 1 && (
                        <Text style={styles.seenCount}>
                          {item.seenBy.length - 1}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Spacer for sent messages to align avatar on right */}
            {isCurrentUser && <View style={styles.avatarSpacer} />}
          </View>
        </Animated.View>
      </View>
    );
  }, [messages, currentUser.uid, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors?.primaryColor}
        translucent={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        {/* Enhanced Header */}
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

          <TouchableOpacity
            style={styles.headerInfo}
            onPress={showGroupMembers}
            disabled={
              !groupData ||
              groupData.type === 'direct' ||
              (groupData.members && groupData.members.length === 2)
            }>
            <Text style={styles.groupName}>
              {/* For direct chats, always use computed groupName (other person's name) */}
              {/* For group chats, use computed groupName or fallback to groupNameed */}
              {groupName || (!groupData?.type && !(groupData?.members?.length === 2) ? groupNameed : null) || 'Group Chat'}
            </Text>
            <View style={styles.onlineStatusContainer}>
              {groupData &&
              groupData.members &&
              groupData.members.length > 2 ? (
                <>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineStatus}>
                    {groupData.members.length} members
                  </Text>
                </>
              ) : (
                <>
                  {otherUserOnlineStatus.isOnline && (
                    <View style={styles.onlineDot} />
                  )}
                  <Text style={styles.onlineStatus}>
                    {otherUserOnlineStatus.isOnline
                      ? 'Online'
                      : formatLastSeen(otherUserOnlineStatus.lastSeen)}
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => setShowChatMenuModal(true)}>
            <Text style={styles.moreButtonText}>⋯</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Enhanced Pinned Messages Section - Stays at Top */}
        {pinnedMessages.length > 0 &&
          pinnedMessages[currentPinnedIndex] &&
          (() => {
            console.log(
              '🎨 Rendering pinned section with',
              pinnedMessages.length,
              'messages',
            );
            return (
              <Animated.View style={styles.stickyPinnedSection}>
                {/* Header */}
                <View style={styles.pinnedSectionHeader}>
                  <TouchableOpacity
                    onPress={() =>
                      setPinnedSectionExpanded(!pinnedSectionExpanded)
                    }
                    style={styles.pinnedHeaderLeft}>
                    <Text style={styles.pinnedHeaderIcon}>📌</Text>
                    <Text style={styles.pinnedHeaderTitle}>
                      {pinnedMessages.length} Pinned
                    </Text>
                    <Text style={styles.expandIcon}>
                      {pinnedSectionExpanded ? '▼' : '▶'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.pinnedHeaderRight}>
                    {pinnedMessages.length > 1 && (
                      <View style={styles.pinnedCounter}>
                        <TouchableOpacity
                          onPress={goToPreviousPinned}
                          style={styles.navButton}>
                          <Text style={styles.navButtonText}>‹</Text>
                        </TouchableOpacity>
                        <Text style={styles.counterText}>
                          {currentPinnedIndex + 1}/{pinnedMessages.length}
                        </Text>
                        <TouchableOpacity
                          onPress={goToNextPinned}
                          style={styles.navButton}>
                          <Text style={styles.navButtonText}>›</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => setShowPinnedModal(true)}
                      style={styles.viewAllButton}>
                      <Text style={styles.viewAllText}>All</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Pinned Message Content - Collapsible */}
                {pinnedSectionExpanded &&
                  pinnedMessages[currentPinnedIndex] && (
                    <TouchableOpacity
                      style={styles.pinnedMessageContent}
                      onPress={() =>
                        scrollToPinnedMessage(
                          pinnedMessages[currentPinnedIndex].id,
                        )
                      }
                      activeOpacity={0.8}>
                      {/* Sender Info */}
                      <View style={styles.pinnedSenderRow}>
                        <View style={styles.pinnedSenderAvatar}>
                          <Text style={styles.pinnedSenderAvatarText}>
                            {getInitials(
                              pinnedMessages[currentPinnedIndex].senderName,
                            )}
                          </Text>
                        </View>
                        <View style={styles.pinnedSenderInfo}>
                          <Text style={styles.pinnedSenderName}>
                            {pinnedMessages[currentPinnedIndex].senderName}
                          </Text>
                          <Text style={styles.pinnedTimestamp}>
                            {pinnedMessages[currentPinnedIndex].createdAt
                              ?.toDate
                              ? pinnedMessages[currentPinnedIndex].createdAt
                                  .toDate()
                                  .toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })
                              : 'Recently'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() =>
                            togglePinMessage(pinnedMessages[currentPinnedIndex])
                          }
                          style={styles.quickUnpinButton}>
                          <Text style={styles.quickUnpinIcon}>📍</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Message Content */}
                      {pinnedMessages[currentPinnedIndex].deleted ? (
                        <View style={styles.deletedMessageContainer}>
                          <Text style={styles.deletedIcon}>🚫</Text>
                          <Text style={styles.deletedText}>
                            This message was deleted
                          </Text>
                        </View>
                      ) : pinnedMessages[currentPinnedIndex].imageUrl ? (
                        <Image
                          source={{
                            uri: pinnedMessages[currentPinnedIndex].imageUrl,
                          }}
                          style={styles.pinnedMessageImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text
                          style={styles.pinnedMessageText}
                          numberOfLines={2}
                          ellipsizeMode="tail">
                          {pinnedMessages[currentPinnedIndex].text}
                        </Text>
                      )}

                      {/* Jump indicator */}
                      <View style={styles.jumpToMessageHint}>
                        <Text style={styles.jumpToMessageText}>
                          👆 Tap to jump to this message in chat
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
              </Animated.View>
            );
          })()}

        {/* Search Bar */}
        {showSearchBar && (
          <Animated.View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search messages..."
                placeholderTextColor="#64748b"
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus={true}
              />
              {searchResults.length > 0 && (
                <View style={styles.searchNavigation}>
                  <TouchableOpacity
                    onPress={goToPreviousSearchResult}
                    style={styles.searchNavButton}>
                    <Text style={styles.searchNavText}>‹</Text>
                  </TouchableOpacity>
                  <Text style={styles.searchCounter}>
                    {currentSearchIndex + 1}/{searchResults.length}
                  </Text>
                  <TouchableOpacity
                    onPress={goToNextSearchResult}
                    style={styles.searchNavButton}>
                    <Text style={styles.searchNavText}>›</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity
                onPress={closeSearch}
                style={styles.closeSearchButton}>
                <Text style={styles.closeSearchText}>×</Text>
              </TouchableOpacity>
            </View>
            {searchQuery.length > 0 && searchResults.length === 0 && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  No messages found for "{searchQuery}"
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Messages List or Blocked Status */}
        {isUserBlocked || blockedByUser ? (
          <View style={styles.blockedMainContainer}>
            <Animated.View
              style={[
                styles.blockedContentCard,
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
              <View style={styles.blockedIconContainerLarge}>
                <Text style={styles.blockedIconExtraLarge}>🚫</Text>
              </View>
              <Text style={styles.blockedTitleLarge}>
                {isUserBlocked
                  ? 'You Blocked This User'
                  : 'You Have Been Blocked'}
              </Text>
              <Text style={styles.blockedDescriptionText}>
                {isUserBlocked
                  ? 'You cannot send or receive messages from this user. Unblock them to resume communication.'
                  : 'This user has blocked you. You cannot send messages or see their activity.'}
              </Text>

              {isUserBlocked && (
                <TouchableOpacity
                  style={styles.unblockButtonLarge}
                  onPress={() => {
                    const otherUserId = groupData.members.find(
                      id => id !== currentUser?.uid,
                    );
                    if (otherUserId) {
                      blockUser(otherUserId);
                    }
                  }}>
                  <Text style={styles.unblockButtonIcon}>🔓</Text>
                  <Text style={styles.unblockButtonTextLarge}>
                    Unblock User
                  </Text>
                </TouchableOpacity>
              )}

              {blockedByUser && (
                <View style={styles.blockedByInfoBox}>
                  <Text style={styles.blockedByIcon}>ℹ️</Text>
                  <Text style={styles.blockedByInfoTextLarge}>
                    You cannot unblock yourself. Only they can unblock you.
                  </Text>
                </View>
              )}

              <View style={styles.blockedDivider} />

              <Text style={styles.blockedHintText}>
                {isUserBlocked
                  ? '💡 Unblocking allows both of you to communicate again'
                  : '💡 If this was a mistake, try reaching out through other means'}
              </Text>
            </Animated.View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            inverted={false}
            onContentSizeChange={() => {
              // Throttle scroll to end to reduce jitter
              if (flatListRef.current) {
                requestAnimationFrame(() => {
                  flatListRef.current?.scrollToEnd({animated: false});
                });
              }
            }}
            onLayout={() => {
              // Only scroll on initial layout
              if (messages.length > 0) {
                requestAnimationFrame(() => {
                  flatListRef.current?.scrollToEnd({animated: false});
                });
              }
            }}
            onScrollToIndexFailed={info => {
              const wait = new Promise(resolve => setTimeout(resolve, 500));
              wait.then(() => {
                flatListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                  viewPosition: 0.5,
                });
              });
            }}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContainer}
            // ⚡ PERFORMANCE OPTIMIZATIONS
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            updateCellsBatchingPeriod={200}
            initialNumToRender={8}
            windowSize={2}
            legacyImplementation={false}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
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
                <View style={styles.emptyIcon}>
                  <Text style={styles.emptyIconText}>💬</Text>
                </View>
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start the conversation by sending a message
                </Text>
              </Animated.View>
            }
          />
        )}

        {/* Reply Preview */}
        {replyMessage && (
          <Animated.View
            style={[
              styles.replyPreview,
              {
                opacity: replyAnim,
                transform: [
                  {
                    translateY: replyAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.replyContent}>
              <Text style={styles.replyLabel}>
                Replying to {replyMessage.senderName}
              </Text>
              <Text style={styles.replyText} numberOfLines={1}>
                "{replyMessage.text}"
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setReplyMessage(null)}
              style={styles.cancelReplyButton}>
              <Text style={styles.cancelReplyText}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <Animated.View
            style={[
              styles.typingIndicator,
              {
                opacity: typingAnimation,
                transform: [
                  {
                    translateY: typingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.typingDots}>
              <Animated.View style={[styles.dot, {opacity: typingAnimation}]} />
              <Animated.View style={[styles.dot, {opacity: typingAnimation}]} />
              <Animated.View style={[styles.dot, {opacity: typingAnimation}]} />
            </View>
            <Text style={styles.typingText}>{typingUser} is typing...</Text>
          </Animated.View>
        )}

        {/* Input Field */}
        <Animated.View
          style={[
            styles.inputContainer,
            {
              transform: [
                {
                  scale: inputAnim,
                },
              ],
            },
          ]}
          entering={Animated.spring({
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          })}>
          {/* Hide input area completely when blocked */}
          {!isUserBlocked && !blockedByUser && (
            <>
              <TouchableOpacity
                onPress={pickImage}
                style={styles.imagePickerButton}>
                <Text style={styles.imagePickerText}>📷</Text>
              </TouchableOpacity>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={messageText}
                  onChangeText={handleTyping}
                  placeholder="Type a message..."
                  placeholderTextColor={colors?.greyColor}
                  multiline={true}
                  maxLength={1000}
                />
                {/* AI Rephrase Button */}
                {messageText.trim().length > 0 && (
                  <TouchableOpacity
                    onPress={() => setShowStyleSelector(true)}
                    style={styles.aiRephraseButton}
                    disabled={isRephrasing}>
                    <Text style={styles.aiRephraseButtonText}>
                      ✨
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <Animated.View
                style={[
                  styles.sendButtonContainer,
                  {
                    transform: [
                      {
                        scale: sendButtonAnim,
                      },
                    ],
                  },
                ]}>
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    messageText.trim().length > 0 && styles.sendButtonActive,
                  ]}
                  onPress={sendMessage}
                  disabled={!messageText.trim() || isRephrasing}>
                  <Text
                    style={[
                      styles.sendButtonText,
                      messageText.trim().length > 0 &&
                        styles.sendButtonTextActive,
                    ]}>
                    {isRephrasing ? '...' : 'Send'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          )}
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Custom Delete Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.deleteModalContainer}>
            <View style={styles.deleteModalHeader}>
              <Text style={styles.deleteModalTitle}>Delete Message</Text>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={styles.closeDeleteButton}>
                <Text style={styles.closeDeleteText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.deleteModalContent}>
              <View style={styles.deleteIconContainer}>
                <Text style={styles.deleteIcon}>🗑️</Text>
              </View>

              <Text style={styles.deleteModalMessage}>
                Are you sure you want to delete this message?
              </Text>

              {selectedMessage && (
                <View style={styles.messagePreview}>
                  <Text style={styles.messagePreviewText} numberOfLines={2}>
                    "{selectedMessage.text || 'Image message'}"
                  </Text>
                </View>
              )}

              <View style={styles.deleteModalButtons}>
                <TouchableOpacity
                  style={styles.cancelDeleteButton}
                  onPress={() => setShowDeleteModal(false)}>
                  <Text style={styles.cancelDeleteText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteForMeButton}
                  onPress={() => {
                    if (selectedMessage) {
                      deleteForMe(selectedMessage.id);
                    }
                    setShowDeleteModal(false);
                  }}>
                  <Text style={styles.deleteForMeText}>Delete for Me</Text>
                </TouchableOpacity>

                {selectedMessage &&
                  selectedMessage.senderId === currentUser.uid &&
                  !selectedMessage.deleted && (
                    <TouchableOpacity
                      style={styles.deleteForEveryoneButton}
                      onPress={() => {
                        if (selectedMessage) {
                          deleteForEveryone(selectedMessage.id);
                        }
                        setShowDeleteModal(false);
                      }}>
                      <Text style={styles.deleteForEveryoneText}>
                        Delete for Everyone
                      </Text>
                    </TouchableOpacity>
                  )}
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Seen By Modal */}
      <Modal visible={showSeenByModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setShowSeenByModal(false)}
            activeOpacity={1}>
            <Animated.View style={styles.seenByModalContainer}>
              <View style={styles.seenByModalHeader}>
                <Text style={styles.seenByModalTitle}>Seen By</Text>
                <TouchableOpacity
                  onPress={() => setShowSeenByModal(false)}
                  style={styles.closeDeleteButton}>
                  <Text style={styles.closeDeleteText}>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.seenByModalContent}>
                {seenByUsers.length === 0 ? (
                  <View style={styles.emptySeenByContainer}>
                    <Text style={styles.emptySeenByIcon}>👁️</Text>
                    <Text style={styles.emptySeenByText}>
                      No one has seen this message yet
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={seenByUsers}
                    keyExtractor={(item, index) =>
                      item.userId || index.toString()
                    }
                    renderItem={({item}) => (
                      <View style={styles.seenByUserItem}>
                        <View style={styles.seenByAvatar}>
                          <Text style={styles.seenByAvatarText}>
                            {getInitials(item.userName)}
                          </Text>
                        </View>
                        <View style={styles.seenByUserInfo}>
                          <Text style={styles.seenByUserName}>
                            {item.userName}
                          </Text>
                          <Text style={styles.seenByTime}>
                            {item.seenAt
                              ? item.seenAt.toDate
                                ? item.seenAt.toDate().toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Recently'
                              : 'Recently'}
                          </Text>
                        </View>
                        <Text style={styles.seenByCheckmark}>✓✓</Text>
                      </View>
                    )}
                    style={styles.seenByUsersList}
                  />
                )}
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Message Options Modal */}
      <Modal visible={showMessageOptionsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowMessageOptionsModal(false)}>
            <Animated.View style={styles.messageOptionsModal}>
              <View style={styles.messageOptionsHeader}>
                <Text style={styles.messageOptionsTitle}>Message Options</Text>
              </View>

              <View style={styles.messageOptionsContent}>
                {selectedMessageForOptions && (
                  <View style={styles.messagePreview}>
                    <Text style={styles.messagePreviewText} numberOfLines={2}>
                      {selectedMessageForOptions.deleted
                        ? '🚫 This message was deleted'
                        : `"${
                            selectedMessageForOptions.text || 'Image message'
                          }"`}
                    </Text>
                  </View>
                )}

                {/* Hide Reply option for deleted messages */}
                {!selectedMessageForOptions?.deleted && (
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => {
                      setShowMessageOptionsModal(false);
                      handleReply(selectedMessageForOptions);
                    }}>
                    <Text style={styles.optionIcon}>↩️</Text>
                    <Text style={styles.optionText}>Reply</Text>
                  </TouchableOpacity>
                )}

                {/* Hide Pin option for deleted messages */}
                {!selectedMessageForOptions?.deleted && (
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => {
                      setShowMessageOptionsModal(false);
                      togglePinMessage(selectedMessageForOptions);
                    }}>
                    <Text style={styles.optionIcon}>
                      {selectedMessageForOptions?.pinned ? '📍' : '📌'}
                    </Text>
                    <Text style={styles.optionText}>
                      {selectedMessageForOptions?.pinned ? 'Unpin' : 'Pin'}{' '}
                      Message
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Hide Copy option for deleted messages */}
                {selectedMessageForOptions?.text &&
                  !selectedMessageForOptions?.deleted && (
                    <TouchableOpacity
                      style={styles.optionButton}
                      onPress={() => {
                        setShowMessageOptionsModal(false);
                        copyToClipboard(selectedMessageForOptions.text);
                      }}>
                      <Text style={styles.optionIcon}>📋</Text>
                      <Text style={styles.optionText}>Copy Text</Text>
                    </TouchableOpacity>
                  )}

                {/* Delete for Me - Available for all messages */}
                {!selectedMessageForOptions?.deleted && (
                  <TouchableOpacity
                    style={[styles.optionButton, styles.deleteForMeOption]}
                    onPress={() => {
                      setShowMessageOptionsModal(false);
                      if (selectedMessageForOptions) {
                        deleteForMe(selectedMessageForOptions.id);
                      }
                    }}>
                    <Text style={styles.optionIcon}>🗑️</Text>
                    <Text
                      style={[styles.optionText, styles.deleteForMeOptionText]}>
                      Delete for Me
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Delete for Everyone - Only for your own messages */}
                {selectedMessageForOptions?.senderId === currentUser.uid &&
                  !selectedMessageForOptions?.deleted && (
                    <TouchableOpacity
                      style={[styles.optionButton, styles.deleteOption]}
                      onPress={() => {
                        setShowMessageOptionsModal(false);
                        if (selectedMessageForOptions) {
                          deleteForEveryone(selectedMessageForOptions.id);
                        }
                      }}>
                      <Text style={styles.optionIcon}>🗑️</Text>
                      <Text
                        style={[styles.optionText, styles.deleteOptionText]}>
                        Delete for Everyone
                      </Text>
                    </TouchableOpacity>
                  )}

                <TouchableOpacity
                  style={[styles.optionButton, styles.cancelOption]}
                  onPress={() => setShowMessageOptionsModal(false)}>
                  <Text style={styles.optionText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* All Pinned Messages Modal */}
      <Modal visible={showPinnedModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.pinnedMessagesModal}>
            <View style={styles.pinnedMessagesHeader}>
              <Text style={styles.pinnedMessagesTitle}>
                Pinned Messages ({pinnedMessages.length})
              </Text>
              <TouchableOpacity
                onPress={() => setShowPinnedModal(false)}
                style={styles.closePinnedButton}>
                <Text style={styles.closePinnedText}>×</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={pinnedMessages}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <View style={styles.pinnedMessageItem}>
                  <View style={styles.pinnedMessageHeader}>
                    <View style={styles.pinnedMessageAvatar}>
                      <Text style={styles.pinnedMessageAvatarText}>
                        {getInitials(item.senderName)}
                      </Text>
                    </View>
                    <View style={styles.pinnedMessageInfo}>
                      <Text style={styles.pinnedMessageSender}>
                        {item.senderName}
                      </Text>
                      <Text style={styles.pinnedMessageTime}>
                        {item.createdAt?.toDate
                          ? item.createdAt.toDate().toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })
                          : 'Unknown time'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.unpinButton}
                      onPress={() => togglePinMessage(item)}>
                      <Text style={styles.unpinIcon}>📍</Text>
                    </TouchableOpacity>
                  </View>

                  {item.deleted ? (
                    <View style={styles.deletedMessageContainer}>
                      <Text style={styles.deletedIcon}>🚫</Text>
                      <Text style={styles.deletedText}>
                        This message was deleted
                      </Text>
                    </View>
                  ) : item.imageUrl ? (
                    <Image
                      source={{uri: item.imageUrl}}
                      style={styles.pinnedMessageImage}
                    />
                  ) : (
                    <Text style={styles.pinnedMessageText}>{item.text}</Text>
                  )}

                  <Text style={styles.pinnedByText}>
                    Pinned by {item.pinnedByName || 'Unknown'}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyPinnedContainer}>
                  <Text style={styles.emptyPinnedIcon}>📌</Text>
                  <Text style={styles.emptyPinnedText}>
                    No pinned messages yet
                  </Text>
                </View>
              }
              contentContainerStyle={styles.pinnedMessagesList}
            />
          </SafeAreaView>
        </View>
      </Modal>

      {/* Chat Menu Modal */}
      <Modal
        visible={showChatMenuModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChatMenuModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowChatMenuModal(false)}>
          <View style={styles.chatMenuContainer}>
            <View style={styles.chatMenuHeader}>
              <Text style={styles.chatMenuTitle}>Chat Options</Text>
              <TouchableOpacity
                onPress={() => setShowChatMenuModal(false)}
                style={styles.closeChatMenuButton}>
                <Text style={styles.closeChatMenuText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.chatMenuContent}>
              {/* View Group Members */}
              {groupData &&
                groupData.members &&
                groupData.members.length > 2 && (
                  <TouchableOpacity
                    style={styles.menuOption}
                    onPress={() => {
                      setShowChatMenuModal(false);
                      showGroupMembers();
                    }}>
                    <Text style={styles.menuOptionIcon}>👥</Text>
                    <View style={styles.menuOptionTextContainer}>
                      <Text style={styles.menuOptionText}>
                        View Group Members
                      </Text>
                      <Text style={styles.menuOptionSubtext}>
                        {groupData.members.length} member
                        {groupData.members.length !== 1 ? 's' : ''} in this
                        group
                      </Text>
                    </View>
                    <Text style={styles.menuOptionArrow}>›</Text>
                  </TouchableOpacity>
                )}

              {/* View Pinned Messages */}
              {pinnedMessages.length > 0 && (
                <TouchableOpacity
                  style={styles.menuOption}
                  onPress={() => {
                    setShowChatMenuModal(false);
                    setShowPinnedModal(true);
                  }}>
                  <Text style={styles.menuOptionIcon}>📌</Text>
                  <View style={styles.menuOptionTextContainer}>
                    <Text style={styles.menuOptionText}>
                      View Pinned Messages
                    </Text>
                    <Text style={styles.menuOptionSubtext}>
                      {pinnedMessages.length} message
                      {pinnedMessages.length !== 1 ? 's' : ''} pinned
                    </Text>
                  </View>
                  <Text style={styles.menuOptionArrow}>›</Text>
                </TouchableOpacity>
              )}

              {/* Unpin All Messages */}
              {pinnedMessages.length > 0 && (
                <TouchableOpacity
                  style={styles.menuOption}
                  onPress={unpinAllMessages}>
                  <Text style={styles.menuOptionIcon}>📍</Text>
                  <View style={styles.menuOptionTextContainer}>
                    <Text style={styles.menuOptionText}>
                      Unpin All Messages
                    </Text>
                    <Text style={styles.menuOptionSubtext}>
                      Remove all {pinnedMessages.length} pins
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Search Messages */}
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setShowChatMenuModal(false);
                  setShowSearchBar(true);
                }}>
                <Text style={styles.menuOptionIcon}>🔍</Text>
                <View style={styles.menuOptionTextContainer}>
                  <Text style={styles.menuOptionText}>Search Messages</Text>
                  <Text style={styles.menuOptionSubtext}>
                    Find messages in this chat
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Mute Notifications */}
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setShowChatMenuModal(false);
                  Alert.alert('Coming Soon', 'Mute notifications feature');
                }}>
                <Text style={styles.menuOptionIcon}>🔕</Text>
                <View style={styles.menuOptionTextContainer}>
                  <Text style={styles.menuOptionText}>Mute Notifications</Text>
                  <Text style={styles.menuOptionSubtext}>
                    Stop receiving alerts
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Export Chat */}
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setShowChatMenuModal(false);
                  Alert.alert('Coming Soon', 'Export chat feature');
                }}>
                <Text style={styles.menuOptionIcon}>📤</Text>
                <View style={styles.menuOptionTextContainer}>
                  <Text style={styles.menuOptionText}>Export Chat</Text>
                  <Text style={styles.menuOptionSubtext}>
                    Save chat history
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Block/Unblock User - Only for direct chats */}
              {groupData &&
                groupData.members &&
                groupData.members.length === 2 && (
                  <TouchableOpacity
                    style={[styles.menuOption, styles.destructiveOption]}
                    onPress={() => {
                      setShowChatMenuModal(false);
                      // Get the other user's ID
                      const otherUserId = groupData.members.find(
                        id => id !== currentUser?.uid,
                      );
                      if (otherUserId) {
                        blockUser(otherUserId);
                      }
                    }}>
                    <Text style={styles.menuOptionIcon}>🚫</Text>
                    <View style={styles.menuOptionTextContainer}>
                      <Text
                        style={[styles.menuOptionText, styles.destructiveText]}>
                        Block/Unblock User
                      </Text>
                      <Text style={styles.menuOptionSubtext}>
                        Manage user block status
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

              {/* Clear All Messages - Destructive */}
              <TouchableOpacity
                style={[styles.menuOption, styles.destructiveOption]}
                onPress={clearAllMessages}>
                <Text style={styles.menuOptionIcon}>🗑️</Text>
                <View style={styles.menuOptionTextContainer}>
                  <Text style={[styles.menuOptionText, styles.destructiveText]}>
                    Clear All Messages
                  </Text>
                  <Text style={styles.menuOptionSubtext}>
                    Delete all messages in this chat
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Cancel */}
              <TouchableOpacity
                style={[styles.menuOption, styles.cancelOption]}
                onPress={() => setShowChatMenuModal(false)}>
                <Text style={styles.menuOptionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Group Members Modal */}
      <Modal
        visible={showMembersModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMembersModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.membersModalContainer}>
            <View style={styles.membersModalHeader}>
              <Text style={styles.membersModalTitle}>
                Group Members ({groupMembers.length})
              </Text>
              <TouchableOpacity
                onPress={() => setShowMembersModal(false)}
                style={styles.closeMembersButton}>
                <Text style={styles.closeMembersText}>×</Text>
              </TouchableOpacity>
            </View>

            {loadingMembers ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading members...</Text>
              </View>
            ) : (
              <FlatList
                data={groupMembers}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <View style={styles.memberItem}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>
                        {getInitials(item.name || item.email)}
                      </Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <View style={styles.memberNameContainer}>
                        <Text style={styles.memberName}>
                          {item.name || 'Unknown User'}
                        </Text>
                        {item.isCreator && (
                          <View style={styles.creatorBadge}>
                            <Text style={styles.creatorBadgeText}>Admin</Text>
                          </View>
                        )}
                        {item.isCurrentUser && (
                          <View style={styles.youBadge}>
                            <Text style={styles.youBadgeText}>You</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.memberEmail}>{item.email}</Text>
                    </View>
                  </View>
                )}
                contentContainerStyle={styles.membersList}
                ListEmptyComponent={
                  <View style={styles.emptyMembersContainer}>
                    <Text style={styles.emptyMembersText}>
                      No members found
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>

      {/* AI Style Selector Modal */}
      <Modal
        visible={showStyleSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStyleSelector(false)}>
        <View style={styles.styleSelectorOverlay}>
          <TouchableOpacity
            style={styles.styleSelectorBackdrop}
            activeOpacity={1}
            onPress={() => setShowStyleSelector(false)}
          />
          <Animated.View style={styles.styleSelectorContainer}>
            <View style={styles.styleSelectorHeader}>
              <Text style={styles.styleSelectorTitle}>Rephrase Message</Text>
              <TouchableOpacity
                onPress={() => setShowStyleSelector(false)}
                style={styles.closeStyleButton}>
                <Text style={styles.closeStyleText}>×</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.styleSelectorSubtitle}>
              Choose a style to rephrase your message
            </Text>
            <View style={styles.styleSelectorContent}>
              <FlatList
                data={MESSAGE_STYLES}
                numColumns={2}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.styleOption}
                    onPress={() => handleRephraseMessage(item.id)}
                    disabled={isRephrasing}>
                    <Text style={styles.styleEmoji}>{item.emoji}</Text>
                    <Text style={styles.styleName}>{item.name}</Text>
                    <Text style={styles.styleDescription}>{item.description}</Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.styleList}
              />
            </View>
          </Animated.View>
        </View>
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
    elevation: 12,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    marginTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#4f46e5',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    fontSize: 22,
    color: colors?.white,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  onlineStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  onlineStatus: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: fonts?.PoppinsRegular,
  },
  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  moreButtonText: {
    fontSize: 22,
    color: colors?.white,
    fontWeight: 'bold',
  },
  messagesContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  // Date Separator Styles
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
    opacity: 0.5,
  },
  dateSeparatorText: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: fonts?.PoppinsMedium,
    marginHorizontal: 15,
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  // Message Row with Avatar
  messageRow: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingHorizontal: 0,
  },
  avatarContainer: {
    marginRight: 8,
    marginTop: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4f46e5',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: fonts?.PoppinsSemiBold,
  },
  avatarSpacer: {
    width: 40,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 14,
    marginVertical: 2,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
    marginLeft: 50,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 4,
    marginRight: 10,
  },
  sentMessageText: {
    fontSize: 16,
    color: colors?.white,
    fontFamily: fonts?.PoppinsRegular,
  },
  receivedMessageText: {
    fontSize: 16,
    color: colors?.white,
    fontFamily: fonts?.PoppinsRegular,
  },
  // Deleted Message Styles
  deletedMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    gap: 8,
  },
  deletedIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  deletedText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#9ca3af',
    fontFamily: fonts?.PoppinsRegular,
    flex: 1,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors?.primaryColor,
    marginBottom: 4,
    fontFamily: fonts?.PoppinsMedium,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    color: colors?.greyColor,
    fontFamily: fonts?.PoppinsRegular,
  },
  seenIndicator: {
    marginLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  seenText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  seenTextRead: {
    color: '#22c55e',
  },
  chatImage: {
    width: 200,
    height: 200,
    borderRadius: 15,
    marginTop: 5,
  },
  urlText: {
    color: colors?.blueUSP,
    textDecorationLine: 'underline',
    fontFamily: fonts?.PoppinsMedium,
  },
  replyContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors?.primaryColor,
  },
  replyText: {
    color: colors?.greyColor,
    fontSize: 12,
    fontFamily: fonts?.PoppinsRegular,
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  replyContent: {
    flex: 1,
  },
  replyLabel: {
    fontSize: 13,
    color: '#6366f1',
    fontFamily: fonts?.PoppinsSemiBold,
    marginBottom: 3,
  },
  cancelReplyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  cancelReplyText: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#1e293b',
    borderRadius: 18,
    alignSelf: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors?.primaryColor,
    marginHorizontal: 1,
  },
  typingText: {
    fontSize: 12,
    color: colors?.greyColor,
    fontFamily: fonts?.PoppinsRegular,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1e293b',
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 6,
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  imagePickerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  imagePickerText: {
    fontSize: 20,
  },
  inputWrapper: {
    flex: 1,
    maxHeight: 100,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    fontSize: 16,
    color: colors?.white,
    fontFamily: fonts?.PoppinsRegular,
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingRight: 80, // Space for AI buttons
    minHeight: 44,
    flex: 1,
  },
  sendButtonContainer: {
    marginLeft: 8,
  },
  sendButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
    opacity: 0.4,
    minWidth: 70,
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#6366f1',
    opacity: 1,
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  sendButtonText: {
    color: colors?.greyColor,
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: fonts?.PoppinsSemiBold,
  },
  sendButtonTextActive: {
    color: colors?.white,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors?.white,
    marginBottom: 8,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors?.greyColor,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: fonts?.PoppinsRegular,
  },
  // Delete Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContainer: {
    width: screenWidth * 0.85,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  deleteModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  closeDeleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeDeleteText: {
    fontSize: 20,
    color: colors?.white,
    fontWeight: 'bold',
  },
  deleteModalContent: {
    padding: 20,
  },
  deleteIconContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  deleteIcon: {
    fontSize: 50,
  },
  deleteModalMessage: {
    fontSize: 16,
    color: colors?.white,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: fonts?.PoppinsRegular,
  },
  messagePreview: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: colors?.primaryColor,
  },
  messagePreviewText: {
    fontSize: 14,
    color: colors?.greyColor,
    fontFamily: fonts?.PoppinsRegular,
    fontStyle: 'italic',
  },
  deleteModalButtons: {
    gap: 12,
  },
  cancelDeleteButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  cancelDeleteText: {
    color: colors?.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fonts?.PoppinsSemiBold,
  },
  deleteForMeButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  deleteForMeText: {
    color: colors?.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fonts?.PoppinsSemiBold,
  },
  deleteForEveryoneButton: {
    backgroundColor: '#991b1b',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  deleteForEveryoneText: {
    color: colors?.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fonts?.PoppinsSemiBold,
  },
  // Seen Count Badge
  seenCount: {
    fontSize: 9,
    color: '#22c55e',
    fontWeight: 'bold',
    marginLeft: 2,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  // Seen By Modal Styles
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  seenByModalContainer: {
    width: screenWidth * 0.85,
    maxHeight: screenWidth * 1.2,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  seenByModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    backgroundColor: '#0f172a',
  },
  seenByModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  seenByModalContent: {
    maxHeight: screenWidth * 0.8,
  },
  seenByUsersList: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  seenByUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  seenByAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#4f46e5',
  },
  seenByAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: fonts?.PoppinsSemiBold,
  },
  seenByUserInfo: {
    flex: 1,
  },
  seenByUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors?.white,
    marginBottom: 2,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  seenByTime: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: fonts?.PoppinsRegular,
  },
  seenByCheckmark: {
    fontSize: 16,
    color: '#22c55e',
    marginLeft: 8,
  },
  emptySeenByContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptySeenByIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptySeenByText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    fontFamily: fonts?.PoppinsRegular,
  },
  // Pinned Message Styles
  pinnedMessage: {
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  pinnedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.2)',
  },
  pinnedIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  pinnedText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
    fontFamily: fonts?.PoppinsSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Enhanced Sticky Pinned Section Styles - Compact
  stickyPinnedSection: {
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#f59e0b',
    elevation: 3,
    shadowColor: '#f59e0b',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 100,
  },
  pinnedSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0f172a',
  },
  pinnedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pinnedHeaderIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  pinnedHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f59e0b',
    fontFamily: fonts?.PoppinsSemiBold,
    marginRight: 6,
  },
  expandIcon: {
    fontSize: 10,
    color: '#f59e0b',
  },
  pinnedHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pinnedCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  navButton: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  navButtonText: {
    fontSize: 16,
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  counterText: {
    fontSize: 10,
    color: '#cbd5e1',
    marginHorizontal: 6,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  viewAllButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  viewAllText: {
    fontSize: 11,
    color: '#1e293b',
    fontWeight: 'bold',
    fontFamily: fonts?.PoppinsSemiBold,
  },
  pinnedMessageContent: {
    padding: 10,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  pinnedSenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pinnedSenderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  pinnedSenderAvatarText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  pinnedSenderInfo: {
    flex: 1,
  },
  pinnedSenderName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors?.white,
    marginBottom: 1,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  pinnedTimestamp: {
    fontSize: 10,
    color: '#64748b',
    fontFamily: fonts?.PoppinsRegular,
  },
  quickUnpinButton: {
    padding: 4,
    backgroundColor: '#374151',
    borderRadius: 6,
  },
  quickUnpinIcon: {
    fontSize: 14,
  },
  pinnedMessageText: {
    fontSize: 13,
    color: '#e2e8f0',
    lineHeight: 18,
    fontFamily: fonts?.PoppinsRegular,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 8,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  pinnedMessageImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  jumpToMessageHint: {
    marginTop: 6,
    alignItems: 'center',
  },
  jumpToMessageText: {
    fontSize: 10,
    color: '#64748b',
    fontStyle: 'italic',
    fontFamily: fonts?.PoppinsRegular,
  },
  // Message Options Modal Styles
  messageOptionsModal: {
    width: screenWidth * 0.85,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  messageOptionsHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    backgroundColor: '#0f172a',
  },
  messageOptionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
    textAlign: 'center',
  },
  messageOptionsContent: {
    padding: 15,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: colors?.white,
    fontFamily: fonts?.PoppinsRegular,
  },
  deleteOption: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  deleteOptionText: {
    color: '#ef4444',
  },
  deleteForMeOption: {
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
  },
  deleteForMeOptionText: {
    color: '#f97316',
  },
  cancelOption: {
    backgroundColor: '#374151',
    marginTop: 10,
    justifyContent: 'center',
  },
  // Pinned Messages Modal Styles
  pinnedMessagesModal: {
    flex: 1,
    backgroundColor: '#0f172a',
    marginTop: 100,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  pinnedMessagesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    backgroundColor: '#1e293b',
  },
  pinnedMessagesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  closePinnedButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePinnedText: {
    fontSize: 28,
    color: colors?.white,
    fontWeight: 'bold',
  },
  pinnedMessagesList: {
    padding: 15,
  },
  pinnedMessageItem: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pinnedMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pinnedMessageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pinnedMessageAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  pinnedMessageInfo: {
    flex: 1,
  },
  pinnedMessageSender: {
    fontSize: 15,
    fontWeight: '600',
    color: colors?.white,
    marginBottom: 2,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  pinnedMessageTime: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: fonts?.PoppinsRegular,
  },
  unpinButton: {
    padding: 8,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  unpinIcon: {
    fontSize: 16,
  },
  pinnedMessageText: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 10,
    fontFamily: fonts?.PoppinsRegular,
  },
  pinnedMessageImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  pinnedByText: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
    fontFamily: fonts?.PoppinsRegular,
  },
  emptyPinnedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyPinnedIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyPinnedText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontFamily: fonts?.PoppinsRegular,
  },
  // Chat Menu Modal Styles
  chatMenuContainer: {
    width: screenWidth * 0.9,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    maxHeight: screenWidth * 1.4,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  chatMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  chatMenuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  closeChatMenuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeChatMenuText: {
    fontSize: 24,
    color: colors?.white,
    fontWeight: 'bold',
  },
  chatMenuContent: {
    padding: 10,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuOptionIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  menuOptionTextContainer: {
    flex: 1,
  },
  menuOptionText: {
    fontSize: 16,
    color: colors?.white,
    fontWeight: '600',
    fontFamily: fonts?.PoppinsSemiBold,
    marginBottom: 3,
  },
  menuOptionSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: fonts?.PoppinsRegular,
  },
  menuOptionArrow: {
    fontSize: 24,
    color: '#64748b',
    marginLeft: 8,
  },
  destructiveOption: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  destructiveText: {
    color: '#ef4444',
  },
  cancelOption: {
    backgroundColor: '#374151',
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Search Bar Styles
  searchBarContainer: {
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#0f172a',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors?.white,
    fontFamily: fonts?.PoppinsRegular,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1e293b',
    borderRadius: 8,
  },
  searchNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 16,
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  searchNavButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  searchNavText: {
    fontSize: 20,
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  searchCounter: {
    fontSize: 11,
    color: '#cbd5e1',
    marginHorizontal: 6,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  closeSearchButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  closeSearchText: {
    fontSize: 24,
    color: colors?.white,
    fontWeight: 'bold',
  },
  noResultsContainer: {
    padding: 12,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    fontFamily: fonts?.PoppinsRegular,
  },
  highlightedText: {
    backgroundColor: '#fbbf24',
    color: '#000',
    fontWeight: 'bold',
    borderRadius: 3,
    paddingHorizontal: 2,
  },
  // Members Modal Styles
  membersModalContainer: {
    width: screenWidth * 0.9,
    maxHeight: '80%',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    overflow: 'hidden',
  },
  membersModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    backgroundColor: colors?.primaryColor,
  },
  membersModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  closeMembersButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeMembersText: {
    fontSize: 24,
    color: colors?.white,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#94a3b8',
    fontFamily: fonts?.PoppinsRegular,
  },
  membersList: {
    padding: 15,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors?.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
    marginRight: 8,
  },
  memberEmail: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: fonts?.PoppinsRegular,
  },
  creatorBadge: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
  },
  creatorBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: fonts?.PoppinsSemiBold,
  },
  youBadge: {
    backgroundColor: colors?.primaryColor,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  youBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  emptyMembersContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyMembersText: {
    fontSize: 16,
    color: '#64748b',
    fontFamily: fonts?.PoppinsRegular,
  },
  // Blocked User Styles - Improved UI (Main Screen)
  blockedMainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: 'transparent',
  },
  blockedContentCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  blockedIconContainerLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#ef4444',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  blockedIconExtraLarge: {
    fontSize: 50,
  },
  blockedTitleLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsBold,
    marginBottom: 16,
    textAlign: 'center',
  },
  blockedDescriptionText: {
    fontSize: 15,
    color: '#94a3b8',
    fontFamily: fonts?.PoppinsRegular,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  unblockButtonLarge: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
  },
  unblockButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  unblockButtonTextLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: colors?.white,
    fontFamily: fonts?.PoppinsBold,
  },
  blockedByInfoBox: {
    backgroundColor: '#334155',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  blockedByIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  blockedByInfoTextLarge: {
    flex: 1,
    fontSize: 14,
    color: '#cbd5e1',
    fontFamily: fonts?.PoppinsRegular,
    lineHeight: 20,
  },
  blockedDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#475569',
    marginVertical: 20,
  },
  blockedHintText: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: fonts?.PoppinsRegular,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  // Old Blocked Styles (kept for backward compatibility if needed elsewhere)
  blockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  blockedCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  blockedIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  blockedIconLarge: {
    fontSize: 40,
  },
  blockedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsBold,
    marginBottom: 12,
    textAlign: 'center',
  },
  blockedMessage: {
    fontSize: 14,
    color: '#9ca3af',
    fontFamily: fonts?.PoppinsRegular,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  unblockButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  unblockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  blockedByInfo: {
    backgroundColor: '#374151',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  blockedByInfoText: {
    fontSize: 13,
    color: '#9ca3af',
    fontFamily: fonts?.PoppinsRegular,
    fontStyle: 'italic',
  },
  // AI Rephrasing Styles
  aiRephraseButton: {
    position: 'absolute',
    right: 40,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  aiRephraseButtonText: {
    fontSize: 16,
  },
  styleSelectorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  styleSelectorBackdrop: {
    flex: 1,
  },
  styleSelectorContainer: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  styleSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  styleSelectorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  closeStyleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeStyleText: {
    fontSize: 24,
    color: colors?.white,
    lineHeight: 28,
  },
  styleSelectorSubtitle: {
    fontSize: 14,
    color: colors?.greyColor,
    paddingHorizontal: 20,
    paddingTop: 10,
    fontFamily: fonts?.PoppinsRegular,
  },
  styleSelectorContent: {
    paddingTop: 20,
  },
  styleList: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  styleOption: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    margin: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 120,
    justifyContent: 'center',
  },
  styleEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  styleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
    marginBottom: 4,
  },
  styleDescription: {
    fontSize: 12,
    color: colors?.greyColor,
    fontFamily: fonts?.PoppinsRegular,
    textAlign: 'center',
  },
});

export default ChatScreen;
