import React, {useEffect, useState, useMemo} from 'react';
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
  Modal,
  TextInput,
  Platform,
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
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [reauthVisible, setReauthVisible] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthError, setReauthError] = useState('');
  const [reauthProcessing, setReauthProcessing] = useState(false);

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

  const resetToLogin = () => {
    const parentNav = (navigation as any)?.getParent?.();
    const targetNav = parentNav || navigation;
    targetNav.reset({
      index: 0,
      routes: [{name: ScreenConstants.LOGIN_SCREEN}],
    });
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
            resetToLogin();
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  const confirmDeleteAccount = () => {
    if (deletingAccount) {
      return;
    }

    Alert.alert(
      'Delete account',
      'This will permanently remove your profile, subscription, and chat data. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: deletingAccount ? 'Deleting…' : 'Delete',
          style: 'destructive',
          onPress: handleDeleteAccount,
        },
      ],
    );
  };

  const handleDeleteAccount = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Deletion failed', 'No active user session found.');
      return;
    }

    const uid = currentUser.uid;

    try {
      setDeletingAccount(true);

      try {
        await SubscriptionService.cancelSubscription(uid);
      } catch (error) {
        console.warn('subscription cancellation failed (non-blocking)', error);
      }

      try {
        await firestore().collection('Users').doc(uid).delete();
      } catch (error) {
        console.warn('user profile deletion failed (non-blocking)', error);
      }

      await currentUser.delete();
      await removeUserData();
      dispatch(setLogOut());

      Alert.alert('Account deleted', 'Your account has been permanently removed.');
      resetToLogin();
    } catch (error: any) {
      console.error('Account deletion error:', error);

      if (error?.code === 'auth/requires-recent-login') {
        setReauthVisible(true);
        setReauthPassword('');
        setReauthError('');
      } else {
        Alert.alert(
          'Deletion failed',
          'We could not delete your account. Please try again in a moment.',
        );
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleReauthCancel = () => {
    if (reauthProcessing) return;
    setReauthVisible(false);
    setReauthPassword('');
    setReauthError('');
  };

  const handleReauthConfirm = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser || !currentUser.email) {
      setReauthError('Session expired. Please log in again.');
      return;
    }

    if (!reauthPassword.trim()) {
      setReauthError('Please enter your password.');
      return;
    }

    try {
      setReauthProcessing(true);
      const credential = auth.EmailAuthProvider.credential(
        currentUser.email,
        reauthPassword.trim(),
      );
      await currentUser.reauthenticateWithCredential(credential);
      setReauthVisible(false);
      setReauthPassword('');
      setReauthError('');
      await handleDeleteAccount();
    } catch (error: any) {
      console.error('Re-authentication failed:', error);
      setReauthError('Incorrect password. Please try again.');
    } finally {
      setReauthProcessing(false);
    }
  };

  const menuItems = useMemo(() => [
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
    ...(Platform.OS === 'ios'
      ? [
          {
            id: 'dynamicIsland',
            icon: '🏝️',
            title: 'Dynamic Island',
            subtitle: 'Live year progress on Dynamic Island',
            onPress: () => {
              console.log('🏝️ Dynamic Island button pressed!');
              console.log('Navigation object:', navigation);
              console.log('Screen constant:', ScreenConstants.DYNAMIC_ISLAND_SETTINGS_SCREEN);
              
              try {
                const screenName = ScreenConstants.DYNAMIC_ISLAND_SETTINGS_SCREEN;
                
                // Verify navigation is available
                if (!navigation) {
                  Alert.alert('Error', 'Navigation is not available');
                  return;
                }
                
                if (typeof navigation.navigate !== 'function') {
                  Alert.alert('Error', 'Navigation.navigate is not a function');
                  return;
                }
                
                // Attempt navigation
                console.log('Calling navigation.navigate with:', screenName);
                navigation.navigate(screenName as never);
                console.log('Navigation call completed');
              } catch (error: any) {
                console.error('❌ Error navigating to Dynamic Island:', error);
                Alert.alert(
                  'Navigation Error',
                  `Could not open Dynamic Island settings.\n\nError: ${error?.message || String(error)}`,
                  [{text: 'OK'}],
                );
              }
            },
            color: '#06b6d4',
          },
        ]
      : []),
  ], [navigation, subscriptionStatus]);

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
          {menuItems.map((item, index) => {
            const isDangerItem =
              item.id === 'logout' || item.id === 'delete-account';
            const isDisabled = Boolean(item.disabled);

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, isDangerItem && styles.menuItemLogout]}
                onPress={item.onPress}
                activeOpacity={0.7}
                disabled={isDisabled}>
                <Animated.View
                  style={[
                    styles.menuItemContent,
                    isDangerItem && styles.menuItemContentLogout,
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
                      isDangerItem && styles.menuIconContainerLogout,
                    ]}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text
                      style={[
                        styles.menuTitle,
                        isDangerItem && styles.menuTitleLogout,
                      ]}>
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.menuSubtitle,
                        isDangerItem && styles.menuSubtitleLogout,
                      ]}>
                      {item.subtitle}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.menuArrow,
                      isDangerItem && styles.menuArrowLogout,
                    ]}>
                    ›
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.dangerSection}>
          <Text style={styles.sectionTitleDanger}>Danger zone</Text>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleLogout}
            activeOpacity={0.75}>
            <View style={styles.dangerButtonTextWrap}>
              <Text style={styles.dangerButtonTitle}>Logout</Text>
              <Text style={styles.dangerButtonSubtitle}>
                Sign out of this device
              </Text>
            </View>
            <Text style={styles.dangerButtonIcon}>↗</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.dangerButton,
              styles.dangerButtonDelete,
              deletingAccount && styles.dangerButtonDisabled,
            ]}
            onPress={confirmDeleteAccount}
            activeOpacity={0.75}
            disabled={deletingAccount}>
            <View style={styles.dangerButtonTextWrap}>
              <Text style={styles.dangerButtonTitle}>Delete account</Text>
              <Text style={styles.dangerButtonSubtitle}>
                Permanently erase your profile and data
              </Text>
            </View>
            <Text style={styles.dangerButtonIcon}>🗑️</Text>
          </TouchableOpacity>
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
      <Modal
        visible={reauthVisible}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={handleReauthCancel}>
        <View style={styles.modalOverlayFull}>
          <View style={styles.reauthCard}>
            <Text style={styles.reauthTitle}>Confirm your password</Text>
            <Text style={styles.reauthSubtitle}>
              For your security, please re-enter your password to delete your
              account.
            </Text>
            <TextInput
              style={styles.reauthInput}
              value={reauthPassword}
              onChangeText={text => {
                setReauthPassword(text);
                setReauthError('');
              }}
              secureTextEntry
              placeholder="Password"
              placeholderTextColor="#94a3b8"
            />
            {reauthError ? (
              <Text style={styles.reauthError}>{reauthError}</Text>
            ) : null}
            <View style={styles.reauthActions}>
              <TouchableOpacity
                style={[styles.reauthButton, styles.reauthCancel]}
                onPress={handleReauthCancel}
                disabled={reauthProcessing}>
                <Text style={styles.reauthCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reauthButton, styles.reauthConfirm]}
                onPress={handleReauthConfirm}
                disabled={reauthProcessing}>
                <Text style={styles.reauthConfirmText}>
                  {reauthProcessing ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  dangerSection: {
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4c0519',
    backgroundColor: '#1f0a17',
  },
  sectionTitleDanger: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fda4af',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#2c0f1f',
    borderWidth: 1,
    borderColor: '#f87171',
    marginBottom: 12,
  },
  dangerButtonDelete: {
    backgroundColor: '#450a0a',
    borderColor: '#dc2626',
  },
  dangerButtonDisabled: {
    opacity: 0.5,
  },
  dangerButtonTextWrap: {
    flex: 1,
    paddingRight: 16,
  },
  dangerButtonTitle: {
    color: '#fee2e2',
    fontSize: 15,
    fontWeight: '700',
  },
  dangerButtonSubtitle: {
    color: '#fca5a5',
    fontSize: 12,
    marginTop: 2,
  },
  dangerButtonIcon: {
    fontSize: 18,
    color: '#fecdd3',
  },
  modalOverlayFull: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  reauthCard: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  reauthTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  reauthSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 16,
  },
  reauthInput: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#e2e8f0',
    fontSize: 15,
  },
  reauthError: {
    color: '#f87171',
    marginTop: 8,
    fontSize: 13,
  },
  reauthActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  reauthButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  reauthCancel: {
    borderWidth: 1,
    borderColor: '#475569',
  },
  reauthConfirm: {
    backgroundColor: '#dc2626',
  },
  reauthCancelText: {
    color: '#cbd5f5',
    fontSize: 14,
    fontWeight: '600',
  },
  reauthConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
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
