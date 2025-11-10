import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const NOTIFICATION_SETTINGS_KEY = '@wallpaper_app:notification_settings';

interface NotificationSettings {
  enabled: boolean;
  newMessages: boolean;
  groupUpdates: boolean;
  mentions: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showPreview: boolean;
  quietHours: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  newMessages: true,
  groupUpdates: true,
  mentions: true,
  soundEnabled: true,
  vibrationEnabled: true,
  showPreview: true,
  quietHours: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

const NotificationSettingsScreen = () => {
  const navigation = useNavigation();
  const [settings, setSettings] =
    useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(
        NOTIFICATION_SETTINGS_KEY,
        JSON.stringify(newSettings),
      );

      // Save to Firestore
      const currentUser = auth().currentUser;
      if (currentUser) {
        await firestore().collection('Users').doc(currentUser.uid).set(
          {
            notificationSettings: newSettings,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          {merge: true},
        );
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    const newSettings = {...settings, [key]: value};
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const requestNotificationPermission = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        updateSetting('enabled', true);
        Alert.alert('Success', 'Notifications have been enabled');
      } else {
        Alert.alert(
          'Permission Denied',
          'Please enable notifications in your device settings',
        );
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      Alert.alert('Error', 'Failed to request notification permission');
    }
  };

  const handleMasterToggle = (value: boolean) => {
    if (value) {
      requestNotificationPermission();
    } else {
      updateSetting('enabled', false);
    }
  };

  const SettingRow = ({
    title,
    subtitle,
    value,
    onValueChange,
    disabled = false,
  }: {
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <View style={[styles.settingRow, disabled && styles.settingRowDisabled]}>
      <View style={styles.settingTextContainer}>
        <Text style={[styles.settingTitle, disabled && styles.textDisabled]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.settingSubtitle, disabled && styles.textDisabled]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{false: '#334155', true: '#6366f1'}}
        thumbColor={value ? '#ffffff' : '#94a3b8'}
        ios_backgroundColor="#334155"
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Master Switch */}
          <View style={styles.masterSection}>
            <View style={styles.masterIcon}>
              <Text style={styles.masterIconText}>🔔</Text>
            </View>
            <View style={styles.masterTextContainer}>
              <Text style={styles.masterTitle}>Enable Notifications</Text>
              <Text style={styles.masterSubtitle}>
                Receive alerts about new messages and updates
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={handleMasterToggle}
              trackColor={{false: '#334155', true: '#6366f1'}}
              thumbColor={settings.enabled ? '#ffffff' : '#94a3b8'}
              ios_backgroundColor="#334155"
            />
          </View>

          {/* Notification Types */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Types</Text>

            <SettingRow
              title="New Messages"
              subtitle="Get notified about new messages"
              value={settings.newMessages}
              onValueChange={value => updateSetting('newMessages', value)}
              disabled={!settings.enabled}
            />

            <SettingRow
              title="Group Updates"
              subtitle="Group name changes, new members"
              value={settings.groupUpdates}
              onValueChange={value => updateSetting('groupUpdates', value)}
              disabled={!settings.enabled}
            />

            <SettingRow
              title="Mentions"
              subtitle="When someone mentions you"
              value={settings.mentions}
              onValueChange={value => updateSetting('mentions', value)}
              disabled={!settings.enabled}
            />
          </View>

          {/* Alert Style */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alert Style</Text>

            <SettingRow
              title="Sound"
              subtitle="Play notification sound"
              value={settings.soundEnabled}
              onValueChange={value => updateSetting('soundEnabled', value)}
              disabled={!settings.enabled}
            />

            <SettingRow
              title="Vibration"
              subtitle="Vibrate on new notifications"
              value={settings.vibrationEnabled}
              onValueChange={value => updateSetting('vibrationEnabled', value)}
              disabled={!settings.enabled}
            />

            <SettingRow
              title="Show Preview"
              subtitle="Display message content in notifications"
              value={settings.showPreview}
              onValueChange={value => updateSetting('showPreview', value)}
              disabled={!settings.enabled}
            />
          </View>

          {/* Quiet Hours */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quiet Hours</Text>

            <SettingRow
              title="Enable Quiet Hours"
              subtitle="Mute notifications during set hours"
              value={settings.quietHours}
              onValueChange={value => updateSetting('quietHours', value)}
              disabled={!settings.enabled}
            />

            {settings.quietHours && settings.enabled && (
              <View style={styles.quietHoursContainer}>
                <View style={styles.quietHoursRow}>
                  <Text style={styles.quietHoursLabel}>Start Time</Text>
                  <TouchableOpacity style={styles.timeButton}>
                    <Text style={styles.timeText}>
                      {settings.quietHoursStart}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.quietHoursRow}>
                  <Text style={styles.quietHoursLabel}>End Time</Text>
                  <TouchableOpacity style={styles.timeButton}>
                    <Text style={styles.timeText}>
                      {settings.quietHoursEnd}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              You can manage app permissions in your device settings. Some
              features may require additional permissions.
            </Text>
          </View>

          {/* Test Notification Button */}
          <TouchableOpacity
            style={[
              styles.testButton,
              !settings.enabled && styles.testButtonDisabled,
            ]}
            disabled={!settings.enabled}
            onPress={() => {
              Alert.alert(
                'Test Notification',
                'This would send a test notification',
              );
            }}>
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#f8fafc',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  masterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  masterIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  masterIconText: {
    fontSize: 24,
  },
  masterTextContainer: {
    flex: 1,
  },
  masterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
  },
  masterSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 18,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingRowDisabled: {
    opacity: 0.5,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 3,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  textDisabled: {
    color: '#64748b',
  },
  quietHoursContainer: {
    backgroundColor: '#1a1f2e',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  quietHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quietHoursLabel: {
    fontSize: 15,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  timeButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  timeText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    marginBottom: 20,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  testButtonDisabled: {
    opacity: 0.5,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NotificationSettingsScreen;
