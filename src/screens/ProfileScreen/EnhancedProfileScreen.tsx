import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Animated,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {RootState} from '../../reduxrf/reducers';
import {setLogOut} from '../../redux/actions/users';
import {removeUserData} from '../../utils/asynstorage';
import {height, width} from '../../assets/string';
import {colors} from '../../assets/color';
import ScreenConstants from '../../Routes/ScreenConstants';
import SubscriptionService, {
  SubscriptionStatus,
} from '../../services/SubscriptionService';
import usageTracker from '../../utils/usageTracker';

const EnhancedProfileScreen = () => {
  const user = useSelector((state: RootState) => state.userDetails);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Real-time statistics
  const [stats, setStats] = useState({
    chats: 0,
    messages: 0,
    groups: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Subscription status
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Daily usage for free users
  const [dailyUsage, setDailyUsage] = useState({
    messagesSent: 0,
    chatsAccessed: 0,
    appOpens: 0,
  });
  const [usageLoading, setUsageLoading] = useState(false);

  // Animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    fetchUserData();
    fetchStatistics();
    fetchSubscriptionStatus();

    // Set up real-time listener for statistics
    const currentUser = auth().currentUser;
    if (currentUser) {
      const unsubscribe = firestore()
        .collection('GroupChats')
        .where('members', 'array-contains', currentUser.uid)
        .onSnapshot(() => {
          // Refresh statistics when chats change
          fetchStatistics();
        });

      return () => unsubscribe();
    }
  }, []);

  // Track app open for free users and fetch usage
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser && subscriptionStatus) {
      if (!subscriptionStatus.isActive) {
        usageTracker.trackAppOpen(currentUser.uid);
        fetchDailyUsage();
      }
    }
  }, [subscriptionStatus?.isActive]);

  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      const currentUser = auth().currentUser;
      if (!currentUser) {
        setStatsLoading(false);
        return;
      }

      // Fetch number of chats (groups user is a member of)
      const chatsSnapshot = await firestore()
        .collection('GroupChats')
        .where('members', 'array-contains', currentUser.uid)
        .get();

      const chatsCount = chatsSnapshot.size;

      // Fetch total messages sent by user across all chats
      let totalMessages = 0;
      if (chatsCount > 0) {
        const messagePromises = chatsSnapshot.docs.map(async chatDoc => {
          const messagesSnapshot = await firestore()
            .collection('GroupChats')
            .doc(chatDoc.id)
            .collection('Messages')
            .where('senderId', '==', currentUser.uid)
            .get();
          return messagesSnapshot.size;
        });

        const messageCounts = await Promise.all(messagePromises);
        totalMessages = messageCounts.reduce((sum, count) => sum + count, 0);
      }

      // Groups count is same as chats count
      setStats({
        chats: chatsCount,
        messages: totalMessages,
        groups: chatsCount,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Keep default values on error
    } finally {
      setStatsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchUserData(),
      fetchStatistics(),
      fetchSubscriptionStatus(),
      fetchDailyUsage(),
    ]);
    setRefreshing(false);
  };

  const fetchSubscriptionStatus = async () => {
    try {
      setSubscriptionLoading(true);
      const currentUser = auth().currentUser;
      if (currentUser) {
        const status = await SubscriptionService.checkSubscriptionStatus(
          currentUser.uid,
        );
        setSubscriptionStatus(status);

        // If free user, fetch daily usage
        if (!status.isActive) {
          await fetchDailyUsage();
        }
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const fetchDailyUsage = async () => {
    try {
      setUsageLoading(true);
      const currentUser = auth().currentUser;
      if (currentUser) {
        const usage = await usageTracker.getTodayUsage(currentUser.uid);
        setDailyUsage(usage);
      }
    } catch (error) {
      console.error('Error fetching daily usage:', error);
    } finally {
      setUsageLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const userDoc = await firestore()
          .collection('Users')
          .doc(currentUser.uid)
          .get();

        if (userDoc.exists) {
          setUserData({uid: currentUser.uid, ...userDoc.data()});
        } else {
          // Use auth data if Firestore doc doesn't exist
          setUserData({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || 'User',
            photoURL: currentUser.photoURL,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            const currentUser = auth().currentUser;
            await auth().signOut();
            await removeUserData();
            dispatch(setLogOut());

            // Reset navigation to login screen
            navigation.reset({
              index: 0,
              routes: [{name: ScreenConstants.LOGIN_SCREEN}],
            });
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  const menuItems = [
    {
      id: 'subscription',
      icon: '💎',
      title: 'Subscription',
      subtitle: subscriptionStatus?.isActive
        ? `${getSubscriptionPlanName(subscriptionStatus.subscriptionType)} Plan`
        : 'Upgrade to Premium',
      onPress: () =>
        navigation.navigate(ScreenConstants.SUBSCRIPTION_SCREEN as never),
      color: subscriptionStatus?.isActive ? '#a855f7' : '#f59e0b',
    },
    {
      id: 'edit-profile',
      icon: '👤',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: () =>
        navigation.navigate(ScreenConstants.EDIT_PROFILE_SCREEN as never),
      color: '#6366f1',
    },
    {
      id: 'change-password',
      icon: '🔐',
      title: 'Change Password',
      subtitle: 'Update your security password',
      onPress: () =>
        navigation.navigate(ScreenConstants.CHANGE_PASSWORD_SCREEN as never),
      color: '#10b981',
    },
    {
      id: 'notifications',
      icon: '🔔',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      onPress: () =>
        navigation.navigate(
          ScreenConstants.NOTIFICATION_SETTINGS_SCREEN as never,
        ),
      color: '#f59e0b',
    },
    {
      id: 'privacy',
      icon: '🛡️',
      title: 'Privacy & Security',
      subtitle: 'Control your privacy settings',
      onPress: () =>
        navigation.navigate(ScreenConstants.PRIVACY_SECURITY_SCREEN as never),
      color: '#8b5cf6',
    },
    {
      id: 'logout',
      icon: '🚪',
      title: 'Logout',
      subtitle: 'Sign out of your account',
      onPress: () => handleLogout(),
      color: '#dc2626',
    },
  ];

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    return names
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getSubscriptionPlanName = (type: string): string => {
    switch (type) {
      case 'premium':
        return 'Premium';
      case 'enterprise':
      case 'pro':
        return 'Pro';
      case 'basic':
        return 'Basic';
      default:
        return 'Free';
    }
  };

  const getSubscriptionPlanColor = (type: string): string => {
    switch (type) {
      case 'premium':
        return '#a855f7';
      case 'enterprise':
      case 'pro':
        return '#6366f1';
      case 'basic':
        return '#10b981';
      default:
        return '#64748b';
    }
  };

  const formatDate = (date?: Date): string => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (endDate?: Date): number | null => {
    if (!endDate) return null;
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#6366f1"
            colors={['#6366f1']}
          />
        }>
        {/* Header Section */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {userData?.photoURL ? (
              <Image source={{uri: userData.photoURL}} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {getInitials(userData?.displayName || userData?.email)}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={() =>
                navigation.navigate(
                  ScreenConstants.EDIT_PROFILE_SCREEN as never,
                )
              }>
              <Text style={styles.editAvatarIcon}>✏️</Text>
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <Text style={styles.userName}>
            {userData?.displayName || userData?.email?.split('@')[0] || 'User'}
          </Text>
          <Text style={styles.userEmail}>{userData?.email || ''}</Text>

          {userData?.bio && <Text style={styles.userBio}>{userData.bio}</Text>}
        </Animated.View>

        {/* Stats Section - Real-time */}
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          {statsLoading ? (
            <View style={styles.statsLoadingContainer}>
              <ActivityIndicator size="small" color="#6366f1" />
              <Text style={styles.statsLoadingText}>Loading statistics...</Text>
            </View>
          ) : (
            <>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.chats}</Text>
                <Text style={styles.statLabel}>Chats</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.messages}</Text>
                <Text style={styles.statLabel}>Messages</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.groups}</Text>
                <Text style={styles.statLabel}>Groups</Text>
              </View>
            </>
          )}
        </Animated.View>

        {/* Compact Subscription Status Section */}
        <Animated.View
          style={[
            styles.subscriptionContainer,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          {subscriptionLoading ? (
            <View style={styles.subscriptionLoadingContainer}>
              <ActivityIndicator size="small" color="#6366f1" />
            </View>
          ) : subscriptionStatus?.isActive ? (
            <TouchableOpacity
              style={styles.subscriptionActiveCard}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate(
                  ScreenConstants.SUBSCRIPTION_SCREEN as never,
                )
              }>
              <View style={styles.subscriptionCompactHeader}>
                <View style={styles.subscriptionLeft}>
                  <View
                    style={[
                      styles.subscriptionBadgeCompact,
                      {
                        backgroundColor: `${getSubscriptionPlanColor(
                          subscriptionStatus.subscriptionType,
                        )}20`,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.subscriptionBadgeTextCompact,
                        {
                          color: getSubscriptionPlanColor(
                            subscriptionStatus.subscriptionType,
                          ),
                        },
                      ]}>
                      ✓
                    </Text>
                  </View>
                  <View style={styles.subscriptionInfo}>
                    <Text style={styles.subscriptionPlanNameCompact}>
                      {getSubscriptionPlanName(
                        subscriptionStatus.subscriptionType,
                      )}
                    </Text>
                    {subscriptionStatus.isLifetime ? (
                      <Text style={styles.subscriptionSubtext}>Lifetime</Text>
                    ) : subscriptionStatus.endDate ? (
                      <Text style={styles.subscriptionSubtext}>
                        {getDaysRemaining(subscriptionStatus.endDate)! > 0
                          ? `${getDaysRemaining(
                              subscriptionStatus.endDate,
                            )}d left`
                          : 'Expired'}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <Text style={styles.subscriptionArrow}>›</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.subscriptionInactiveCard}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate(
                  ScreenConstants.SUBSCRIPTION_SCREEN as never,
                )
              }>
              <View style={styles.subscriptionCompactHeader}>
                <View style={styles.subscriptionLeft}>
                  <View
                    style={[
                      styles.subscriptionBadgeCompact,
                      {backgroundColor: '#64748b20'},
                    ]}>
                    <Text
                      style={[
                        styles.subscriptionBadgeTextCompact,
                        {color: '#64748b'},
                      ]}>
                      ⭐
                    </Text>
                  </View>
                  <View style={styles.subscriptionInfo}>
                    <Text style={styles.subscriptionPlanNameCompact}>
                      Free Plan
                    </Text>
                    <Text style={styles.subscriptionSubtext}>
                      {dailyUsage.messagesSent} msgs today • Upgrade now
                    </Text>
                  </View>
                </View>
                <View style={styles.subscriptionUpgradeBadge}>
                  <Text style={styles.subscriptionUpgradeText}>UPGRADE</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                item.id === 'logout' && styles.menuItemLogout,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}>
              <Animated.View
                style={[
                  styles.menuItemContent,
                  item.id === 'logout' && styles.menuItemContentLogout,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [(index + 1) * 20, 0],
                        }),
                      },
                    ],
                  },
                ]}>
                <View
                  style={[
                    styles.menuIconContainer,
                    {
                      backgroundColor: `${item.color}20`,
                    },
                    item.id === 'logout' && styles.menuIconContainerLogout,
                  ]}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <View style={styles.menuTextContainer}>
                  <Text
                    style={[
                      styles.menuTitle,
                      item.id === 'logout' && styles.menuTitleLogout,
                    ]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.menuSubtitle,
                      item.id === 'logout' && styles.menuSubtitleLogout,
                    ]}>
                    {item.subtitle}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.menuArrow,
                    item.id === 'logout' && styles.menuArrowLogout,
                  ]}>
                  ›
                </Text>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        {/* <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View> */}

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#6366f1',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1e293b',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  editAvatarIcon: {
    fontSize: 14,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
    textAlign: 'center',
  },
  userBio: {
    fontSize: 13,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#334155',
  },
  statsLoadingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  statsLoadingText: {
    color: '#94a3b8',
    fontSize: 14,
    marginLeft: 10,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 12,
  },
  menuItem: {
    marginBottom: 10,
  },
  menuItemLogout: {
    marginTop: 8,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    width: '100%',
  },
  menuItemContentLogout: {
    backgroundColor: '#1e1a1a',
    borderWidth: 1,
    borderColor: '#dc262620',
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIconContainerLogout: {
    backgroundColor: '#dc262620',
  },
  menuIcon: {
    fontSize: 20,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 2,
  },
  menuTitleLogout: {
    color: '#fca5a5',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  menuSubtitleLogout: {
    color: '#f87171',
  },
  menuArrow: {
    fontSize: 24,
    color: '#64748b',
    fontWeight: '300',
  },
  menuArrowLogout: {
    color: '#dc2626',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#dc2626',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: '100%',
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 12,
    marginTop: 10,
    marginBottom: 30,
  },
  subscriptionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  subscriptionLoadingContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  subscriptionLoadingText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 8,
  },
  subscriptionActiveCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#22c55e',
  },
  subscriptionInactiveCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#a855f7',
  },
  subscriptionCompactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscriptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subscriptionBadgeCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subscriptionBadgeTextCompact: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionPlanNameCompact: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 2,
  },
  subscriptionSubtext: {
    fontSize: 12,
    color: '#94a3b8',
  },
  subscriptionArrow: {
    fontSize: 24,
    color: '#64748b',
    fontWeight: '300',
    marginLeft: 8,
  },
  subscriptionUpgradeBadge: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  subscriptionUpgradeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default EnhancedProfileScreen;
