/**
 * Custom Firebase Hooks
 * Reusable hooks for common Firebase operations
 */

import {useState, useEffect, useCallback, useRef} from 'react';
import FirebaseService, {
  GroupChat,
  Message,
  User,
} from '../services/firebase/FirebaseService';
import {FIREBASE_CONFIG} from '../config/constants';

// ============ GROUP CHATS HOOKS ============

/**
 * Hook to fetch and manage user's group chats
 */
export const useGroupChats = (userId: string | undefined) => {
  const [chats, setChats] = useState<GroupChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChats = useCallback(async () => {
    if (!userId) {
      setChats([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const chatList = await FirebaseService.getUserGroupChats(userId);

      // Fetch additional data for each chat (last message, unread count)
      const chatsWithDetails = await Promise.all(
        chatList.map(async chat => {
          try {
            // Get last message
            const lastMessages = await FirebaseService.getLastMessages(
              chat.id!,
              1,
            );
            const lastMessage = lastMessages[0] || null;

            // Calculate unread count
            let unreadCount = 0;
            if (chat.lastReadTimestamps?.[userId]) {
              const allMessages = await FirebaseService.getLastMessages(
                chat.id!,
                100,
              );
              unreadCount = allMessages.filter(
                msg =>
                  msg.senderId !== userId &&
                  msg.createdAt > chat.lastReadTimestamps![userId],
              ).length;
            }

            return {...chat, lastMessage, unreadCount};
          } catch (err) {
            console.error(`Error fetching details for chat ${chat.id}:`, err);
            return {...chat, lastMessage: null, unreadCount: 0};
          }
        }),
      );

      setChats(chatsWithDetails);
    } catch (err: any) {
      console.error('Error fetching chats:', err);
      setError(err.message || 'Failed to fetch chats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return {
    chats,
    loading,
    error,
    refreshing,
    refresh,
    refetch: fetchChats,
  };
};

/**
 * Hook to listen to real-time messages in a chat
 */
export const useChatMessages = (chatId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = FirebaseService.subscribeToMessages(
      chatId,
      messages => {
        setMessages(messages);
        setLoading(false);
      },
      error => {
        console.error('Messages subscription error:', error);
        setError(error.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [chatId]);

  return {messages, loading, error};
};

/**
 * Hook to listen to a specific group chat
 */
export const useGroupChat = (chatId: string | undefined) => {
  const [chat, setChat] = useState<GroupChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatId) {
      setChat(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = FirebaseService.subscribeToGroupChat(
      chatId,
      chat => {
        setChat(chat);
        setLoading(false);
      },
      error => {
        console.error('Group chat subscription error:', error);
        setError(error.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [chatId]);

  return {chat, loading, error};
};

// ============ TYPING INDICATOR HOOK ============

/**
 * Hook to manage typing indicator
 */
export const useTypingIndicator = (
  chatId: string | undefined,
  currentUserName: string | undefined,
) => {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = FirebaseService.subscribeToGroupChat(chatId, chat => {
      if (chat.typingUser && chat.typingUser !== currentUserName) {
        setTypingUser(chat.typingUser);
        setIsTyping(true);
      } else {
        setIsTyping(false);
        setTypingUser(null);
      }
    });

    return () => unsubscribe();
  }, [chatId, currentUserName]);

  const startTyping = useCallback(() => {
    if (!chatId || !currentUserName) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update typing status
    FirebaseService.updateTypingStatus(chatId, currentUserName);

    // Auto-clear after timeout
    timeoutRef.current = setTimeout(() => {
      FirebaseService.updateTypingStatus(chatId, '');
    }, FIREBASE_CONFIG.TYPING_TIMEOUT);
  }, [chatId, currentUserName]);

  const stopTyping = useCallback(() => {
    if (!chatId) return;

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Clear typing status
    FirebaseService.updateTypingStatus(chatId, '');
  }, [chatId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isTyping,
    typingUser,
    startTyping,
    stopTyping,
  };
};

// ============ USERS HOOK ============

/**
 * Hook to fetch all users
 */
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userList = await FirebaseService.getAllUsers();
      setUsers(userList);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {users, loading, error, refetch: fetchUsers};
};

// ============ NEW MESSAGES DETECTOR ============

/**
 * Hook to detect new messages in chats
 */
export const useNewMessageDetector = (
  chats: GroupChat[],
  currentUserId: string | undefined,
) => {
  const [newMessageChats, setNewMessageChats] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (!currentUserId || chats.length === 0) return;

    const unsubscribers: (() => void)[] = [];

    chats.forEach(chat => {
      const unsubscribe = FirebaseService.subscribeToMessages(
        chat.id!,
        messages => {
          if (messages.length === 0) return;

          const latestMessage = messages[messages.length - 1];
          const messageTime = latestMessage.createdAt as any;
          const currentTime = new Date();

          // Check if message is recent and from another user
          if (
            latestMessage.senderId !== currentUserId &&
            messageTime &&
            currentTime.getTime() - messageTime.toDate().getTime() <
              FIREBASE_CONFIG.NEW_MESSAGE_WINDOW
          ) {
            setNewMessageChats(prev => new Set(prev).add(chat.id!));
          }
        },
      );

      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [chats, currentUserId]);

  const clearNewMessageIndicator = useCallback((chatId: string) => {
    setNewMessageChats(prev => {
      const newSet = new Set(prev);
      newSet.delete(chatId);
      return newSet;
    });
  }, []);

  return {newMessageChats, clearNewMessageIndicator};
};

// ============ DEBOUNCED CALLBACK ============

/**
 * Hook for debounced callbacks (useful for typing indicators)
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};
