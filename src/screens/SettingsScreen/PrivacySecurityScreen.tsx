import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colors} from '../../assets/color';
import fonts from '../../assets/fonts';
import {width, height} from '../../assets/string';

const PrivacySecurityScreen = () => {
  const navigation = useNavigation();
  const currentUser = auth().currentUser;

  // Privacy Settings States
  const [readReceipts, setReadReceipts] = useState(true);
  const [lastSeen, setLastSeen] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(true);
  const [groupInvites, setGroupInvites] = useState('everyone'); // 'everyone', 'contacts', 'nobody'

  // Security Settings States
  const [screenLock, setScreenLock] = useState(false);
  const [screenLockTimer, setScreenLockTimer] = useState('immediate'); // 'immediate', '1min', '5min', '30min'
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // Blocked Users
  const [blockedUsers, setBlockedUsers] = useState([]);

  // Loading State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      setLoading(true);

      // Load from Firestore
      const userDoc = await firestore()
        .collection('Users')
        .doc(currentUser?.uid)
        .get();

      if (userDoc.exists) {
        const data = userDoc.data();
        const privacy = data.privacySettings || {};

        setReadReceipts(privacy.readReceipts !== false);
        setLastSeen(privacy.lastSeen !== false);
        setProfilePhoto(privacy.profilePhoto !== false);
        setGroupInvites(privacy.groupInvites || 'everyone');
        setBlockedUsers(privacy.blockedUsers || []);
      }

      // Load security settings from AsyncStorage
      const screenLockEnabled = await AsyncStorage.getItem('screenLock');
      const lockTimer = await AsyncStorage.getItem('screenLockTimer');
      const twoFactorEnabled = await AsyncStorage.getItem('twoFactorAuth');

      setScreenLock(screenLockEnabled === 'true');
      // Default to '1min' if not set (not 'immediate')
      setScreenLockTimer(lockTimer || '1min');
      setTwoFactorAuth(twoFactorEnabled === 'true');

      console.log('📱 Privacy settings loaded:', {
        screenLock: screenLockEnabled,
        lockTimer: lockTimer || '1min (default)',
        twoFactorAuth: twoFactorEnabled,
      });
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      Alert.alert('Error', 'Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const savePrivacySettings = async (key: string, value: any) => {
    try {
      setSaving(true);

      await firestore()
        .collection('Users')
        .doc(currentUser?.uid)
        .update({
          [`privacySettings.${key}`]: value,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const saveSecuritySetting = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, String(value));
    } catch (error) {
      console.error('Error saving security setting:', error);
    }
  };

  const handleReadReceiptsToggle = (value: boolean) => {
    setReadReceipts(value);
    savePrivacySettings('readReceipts', value);
  };

  const handleLastSeenToggle = (value: boolean) => {
    setLastSeen(value);
    savePrivacySettings('lastSeen', value);
  };

  const handleProfilePhotoToggle = (value: boolean) => {
    setProfilePhoto(value);
    savePrivacySettings('profilePhoto', value);
  };

  const handleGroupInvitesChange = (option: string) => {
    Alert.alert('Group Invites', 'Who can add you to groups?', [
      {
        text: 'Everyone',
        onPress: () => {
          setGroupInvites('everyone');
          savePrivacySettings('groupInvites', 'everyone');
        },
      },
      {
        text: 'My Contacts',
        onPress: () => {
          setGroupInvites('contacts');
          savePrivacySettings('groupInvites', 'contacts');
        },
      },
      {
        text: 'Nobody',
        onPress: () => {
          setGroupInvites('nobody');
          savePrivacySettings('groupInvites', 'nobody');
        },
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const handleScreenLockToggle = async (value: boolean) => {
    setScreenLock(value);
    await saveSecuritySetting('screenLock', value);

    if (value) {
      Alert.alert(
        'Screen Lock Enabled',
        'You will need to enter your password when you return to the app.',
      );
    }
  };

  const handleScreenLockTimerChange = () => {
    Alert.alert('Screen Lock Timer', 'When should the screen lock activate?', [
      {
        text: 'Immediately',
        onPress: async () => {
          setScreenLockTimer('immediate');
          await saveSecuritySetting('screenLockTimer', 'immediate');
        },
      },
      {
        text: '1 Minute',
        onPress: async () => {
          console.log('⏱️ User selected: 1 Minute lock timer');
          setScreenLockTimer('1min');
          await saveSecuritySetting('screenLockTimer', '1min');
          console.log('✅ Saved screenLockTimer = 1min');
          Alert.alert('Timer Set', 'Lock timer set to 1 minute');
        },
      },
      {
        text: '5 Minutes',
        onPress: async () => {
          setScreenLockTimer('5min');
          await saveSecuritySetting('screenLockTimer', '5min');
        },
      },
      {
        text: '30 Minutes',
        onPress: async () => {
          setScreenLockTimer('30min');
          await saveSecuritySetting('screenLockTimer', '30min');
        },
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const handleTwoFactorAuthToggle = async (value: boolean) => {
    if (value) {
      Alert.alert(
        'Two-Factor Authentication',
        'This feature will be available soon. You will be able to add an extra layer of security to your account.',
      );
    } else {
      setTwoFactorAuth(value);
      await saveSecuritySetting('twoFactorAuth', value);
    }
  };

  const handleBlockedUsers = () => {
    if (blockedUsers.length === 0) {
      Alert.alert('No Blocked Users', 'You have not blocked anyone yet.');
    } else {
      Alert.alert(
        'Blocked Users',
        `You have blocked ${blockedUsers.length} user(s). Go to a chat and long-press on a message to block/unblock users.`,
      );
    }
  };

  const handleDataUsage = () => {
    Alert.alert('Data Usage', 'View and manage your data usage settings.', [
      {text: 'OK'},
    ]);
  };

  const handleAccountSecurity = () => {
    Alert.alert(
      'Account Security',
      'Your account is secured with email authentication. Change your email password to enhance security.',
      [{text: 'OK'}],
    );
  };

  const getTimerLabel = () => {
    switch (screenLockTimer) {
      case 'immediate':
        return 'Immediately';
      case '1min':
        return '1 Minute';
      case '5min':
        return '5 Minutes';
      case '30min':
        return '30 Minutes';
      default:
        return 'Immediately';
    }
  };

  const getGroupInvitesLabel = () => {
    switch (groupInvites) {
      case 'everyone':
        return 'Everyone';
      case 'contacts':
        return 'My Contacts';
      case 'nobody':
        return 'Nobody';
      default:
        return 'Everyone';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors?.primaryColor}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors?.primaryColor} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors?.primaryColor}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Privacy Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🔒</Text>
            <Text style={styles.sectionTitle}>Privacy</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Control who can see your information
          </Text>

          {/* Read Receipts */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Read Receipts</Text>
              <Text style={styles.settingSubtext}>
                Let others know when you've read their messages
              </Text>
            </View>
            <Switch
              value={readReceipts}
              onValueChange={handleReadReceiptsToggle}
              trackColor={{false: '#374151', true: colors?.primaryColor}}
              thumbColor={readReceipts ? colors?.white : '#9ca3af'}
            />
          </View>

          {/* Last Seen */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Last Seen</Text>
              <Text style={styles.settingSubtext}>
                Show when you were last active
              </Text>
            </View>
            <Switch
              value={lastSeen}
              onValueChange={handleLastSeenToggle}
              trackColor={{false: '#374151', true: colors?.primaryColor}}
              thumbColor={lastSeen ? colors?.white : '#9ca3af'}
            />
          </View>

          {/* Profile Photo */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Profile Photo</Text>
              <Text style={styles.settingSubtext}>
                Everyone can see your profile photo
              </Text>
            </View>
            <Switch
              value={profilePhoto}
              onValueChange={handleProfilePhotoToggle}
              trackColor={{false: '#374151', true: colors?.primaryColor}}
              thumbColor={profilePhoto ? colors?.white : '#9ca3af'}
            />
          </View>

          {/* Group Invites */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleGroupInvitesChange}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Groups</Text>
              <Text style={styles.settingSubtext}>
                Who can add you to groups
              </Text>
            </View>
            <View style={styles.optionValue}>
              <Text style={styles.optionValueText}>
                {getGroupInvitesLabel()}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Blocked Users */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleBlockedUsers}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Blocked Users</Text>
              <Text style={styles.settingSubtext}>
                {blockedUsers.length === 0
                  ? 'No blocked users'
                  : `${blockedUsers.length} user${
                      blockedUsers.length !== 1 ? 's' : ''
                    } blocked`}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🛡️</Text>
            <Text style={styles.sectionTitle}>Security</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Protect your account and data
          </Text>

          {/* Screen Lock */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Screen Lock</Text>
              <Text style={styles.settingSubtext}>
                Require password to open app
              </Text>
            </View>
            <Switch
              value={screenLock}
              onValueChange={handleScreenLockToggle}
              trackColor={{false: '#374151', true: colors?.primaryColor}}
              thumbColor={screenLock ? colors?.white : '#9ca3af'}
            />
          </View>

          {/* Screen Lock Timer */}
          {screenLock && (
            <TouchableOpacity
              style={[styles.settingItem, styles.indentedItem]}
              onPress={handleScreenLockTimerChange}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Lock Timer</Text>
                <Text style={styles.settingSubtext}>
                  When to activate screen lock
                </Text>
              </View>
              <View style={styles.optionValue}>
                <Text style={styles.optionValueText}>{getTimerLabel()}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Two-Factor Authentication */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
              <Text style={styles.settingSubtext}>
                Add extra security layer (Coming Soon)
              </Text>
            </View>
            <Switch
              value={twoFactorAuth}
              onValueChange={handleTwoFactorAuthToggle}
              trackColor={{false: '#374151', true: colors?.primaryColor}}
              thumbColor={twoFactorAuth ? colors?.white : '#9ca3af'}
              disabled={true}
            />
          </View>

          {/* Account Security */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleAccountSecurity}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Account Security</Text>
              <Text style={styles.settingSubtext}>
                Review your security status
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📊</Text>
            <Text style={styles.sectionTitle}>Data & Storage</Text>
          </View>

          {/* Data Usage */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleDataUsage}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Data Usage</Text>
              <Text style={styles.settingSubtext}>Manage data and storage</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Your privacy settings help control who can see your information and
            how you interact with others in the app.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Saving Indicator */}
      {saving && (
        <View style={styles.savingIndicator}>
          <ActivityIndicator size="small" color={colors?.white} />
          <Text style={styles.savingText}>Saving...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#94a3b8',
    fontFamily: fonts?.PoppinsRegular,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: fonts?.PoppinsRegular,
    marginBottom: 15,
    marginLeft: 32,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  indentedItem: {
    marginLeft: 20,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
    marginBottom: 4,
  },
  settingSubtext: {
    fontSize: 13,
    color: '#94a3b8',
    fontFamily: fonts?.PoppinsRegular,
  },
  optionValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionValueText: {
    fontSize: 14,
    color: colors?.primaryColor,
    fontFamily: fonts?.PoppinsMedium,
    marginRight: 8,
  },
  chevron: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: 'bold',
  },
  infoSection: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 30,
    padding: 15,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#94a3b8',
    fontFamily: fonts?.PoppinsRegular,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
  savingIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors?.primaryColor,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  savingText: {
    marginLeft: 10,
    fontSize: 14,
    color: colors?.white,
    fontFamily: fonts?.PoppinsSemiBold,
  },
});

export default PrivacySecurityScreen;
