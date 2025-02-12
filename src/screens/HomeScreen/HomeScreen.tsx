import React, {useEffect, useState, useCallback} from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  getDocs,
} from '@react-native-firebase/firestore';
import {colors} from '../../assets/color';
import {height, width} from '../../assets/string';
import ScreenConstants from '../../Routes/ScreenConstants';
import images from '../../assets/images';
import {setLogOut} from '../../redux/actions/users';
import {removeUserData} from '../../utils/asynstorage';
import {RootState} from '../../reduxrf/reducers';
import auth from '@react-native-firebase/auth';
import MyStatusBar from '../../component/StatusBar';
import {UserFace_Icon} from '../../assets/icons';

const HomeScreen = () => {
  const [chats, setChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const user = useSelector((state: RootState) => state.userDetails);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const firestore = getFirestore();

  const fetchChats = async () => {
    if (!user?.user?.uid) return;
    setRefreshing(true);

    try {
      const q = query(
        collection(firestore, 'GroupChats'),
        where('members', 'array-contains', user.user.uid),
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('No chats found');
        setChats([]);
        setRefreshing(false);
        return;
      }

      const chatData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

      const updatedChats = await Promise.all(
        chatData.map(async chat => {
          try {
            const messagesQuery = query(
              collection(firestore, `GroupChats/${chat.id}/Messages`),
              orderBy('createdAt', 'desc'),
              limit(1),
            );

            const messageSnapshot = await getDocs(messagesQuery);
            const lastMessage =
              messageSnapshot.docs.length > 0
                ? messageSnapshot.docs[0].data()
                : null;

            return {...chat, lastMessage};
          } catch (error) {
            console.error(
              `Error fetching messages for chat ${chat.id}:`,
              error,
            );
            return {...chat, lastMessage: null};
          }
        }),
      );

      setChats(updatedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [user]),
  );

  const onRefresh = useCallback(() => {
    fetchChats();
  }, []);

  const signOut = async () => {
    try {
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

  const openChat = chat => {
    if (!chat || !chat.id) {
      console.error('Chat data is undefined or invalid', chat);
      return;
    }
    navigation.navigate(ScreenConstants.CHAT_SCREEN, {
      chatId: chat.id,
      groupNameed: chat.name || 'Group Chat',
    });
  };

  const deleteGroupChat = async () => {
    if (!selectedChat) return;

    try {
      const messagesRef = collection(
        firestore,
        `GroupChats/${selectedChat.id}/Messages`,
      );
      const messagesSnapshot = await getDocs(messagesRef);
      const batch = firestore.batch();

      messagesSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      const chatRef = collection(firestore, 'GroupChats');
      batch.delete(chatRef.doc(selectedChat.id));

      await batch.commit();
      console.log('Group Chat deleted successfully');

      setShowDeleteModal(false); // Close modal after deletion
      setSelectedChat(null);
      fetchChats(); // Refresh chat list
    } catch (error) {
      console.error('Error deleting group chat:', error);
    }
  };

  return (
    <View style={[styles.homeWrapper]}>
      <MyStatusBar
        translucent={true}
        backgroundColor={colors?.primaryColor}
        barStyle="dark-content"
      />

      <View style={styles.ProfileArea}>
        <View style={styles?.firstArea}>
          {/* <View style={styles.profileArea}> */}
          {/* <Image source={images?.userDummy} style={styles.imageStyling} /> */}
          <UserFace_Icon height={height / 7} width={width / 4} />
          {/* </View> */}
          <Text style={styles.uperText}>
            {user?.user?.displayName || 'User'}
          </Text>
        </View>
        <Pressable onPress={signOut}>
          <Text style={styles.uperTextNew}>Sign Out</Text>
        </Pressable>
      </View>

      {/* Chat List Title */}
      <Text style={styles.header}>Your Chats</Text>

      {/* Chat List */}
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <TouchableOpacity
            style={[
              styles.chatItem,
              {backgroundColor: item.lastMessage ? '#000' : '#1A1A1A'},
            ]}
            onPress={() => openChat(item)}
            onLongPress={() => {
              setSelectedChat(item);
              setShowDeleteModal(true);
            }}>
            <View style={styles.chatCircle}>
              <Text style={styles.chatInitial}>
                {item.name ? item.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>

            <View>
              <Text style={styles.chatText}>{item.name || 'Group Chat'}</Text>
              <Text
                style={[
                  styles.lastMessage,
                  user?.user?.uid &&
                    !item.lastMessage?.seenBy?.includes(user.user.uid) &&
                    styles.unreadText,
                ]}>
                {item.lastMessage ? item.lastMessage.text : 'No messages yet'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.noChats}>No chats found</Text>}
      />

      {showDeleteModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delete Group?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete "{selectedChat?.name}"?
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowDeleteModal(false)}
                style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={deleteGroupChat}
                style={styles.deleteConfirmButton}>
                <Text style={styles.deleteConfirmText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Floating Button */}
      <Pressable
        style={styles.FloatButton}
        onPress={() => navigation.navigate(ScreenConstants?.CREATE_GROUP_CHAT)}>
        <Text style={styles.FloatText}>+</Text>
      </Pressable>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  homeWrapper: {
    height: height,
    backgroundColor: '#000',
  },

  /* Profile Header */
  ProfileArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors?.primaryColor,
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    height: height / 7,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileArea: {
    height: height / 15,
    width: '20%',
    // backgroundColor: 'green',
    borderRadius: width,
    overflow: 'hidden',
    justifyContent: 'center',
    // alignItems: 'center',
  },
  firstArea: {
    width: '75%',
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyling: {
    height: height / 20,
    width: height / 20,
  },
  uperText: {
    fontSize: 18,
    color: colors?.black,
    width: '45%',
    textTransform: 'uppercase',
  },

  /* Chat List */
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 15,
    color: '#333',
  },
  chatCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  chatInitial: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 15,
    elevation: 5,
    shadowColor: colors?.greyColor,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  chatIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors?.white,
  },
  lastMessage: {
    fontSize: 14,
    color: colors?.greyColor,
  },
  unreadText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
  },

  /* No Chats Found */
  noChats: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    marginTop: 20,
  },

  /* Floating Button */
  FloatButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: width / 15,
    backgroundColor: colors?.primaryColor,
    borderRadius: width,
    paddingVertical: 15,
    paddingHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  FloatText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors?.white,
  },
  chatItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },

  deleteButton: {
    padding: 10,
    marginLeft: 10,
  },

  deleteButtonText: {
    fontSize: 18,
    color: 'red',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#ddd',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginRight: 5,
  },

  deleteConfirmButton: {
    flex: 1,
    backgroundColor: 'red',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },

  cancelText: {
    fontSize: 16,
    color: '#000',
  },

  deleteConfirmText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
