import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const STORAGE_KEYS = {
  FIRST_PASSWORD: '@wallpaper_app:first_password',
  SECOND_PASSWORD: '@wallpaper_app:second_password',
};

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const [saving, setSaving] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    chatPassword: '',
    wallpaperPassword: '',
    confirmChatPassword: '',
    confirmWallpaperPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    chat: false,
    wallpaper: false,
    confirmChat: false,
    confirmWallpaper: false,
  });

  const [errors, setErrors] = useState<any>({});

  const validatePasswords = () => {
    const newErrors: any = {};

    // Validate current password (for security)
    if (!passwords.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    // Validate chat password
    if (passwords.chatPassword) {
      if (passwords.chatPassword.length < 6) {
        newErrors.chatPassword = 'Password must be at least 6 characters';
      }
      if (passwords.chatPassword !== passwords.confirmChatPassword) {
        newErrors.confirmChatPassword = 'Passwords do not match';
      }
    }

    // Validate wallpaper password
    if (passwords.wallpaperPassword) {
      if (passwords.wallpaperPassword.length < 6) {
        newErrors.wallpaperPassword = 'Password must be at least 6 characters';
      }
      if (passwords.wallpaperPassword !== passwords.confirmWallpaperPassword) {
        newErrors.confirmWallpaperPassword = 'Passwords do not match';
      }
    }

    // At least one password must be provided
    if (!passwords.chatPassword && !passwords.wallpaperPassword) {
      Alert.alert('Error', 'Please enter at least one new password');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const verifyCurrentPassword = async () => {
    try {
      // Get stored passwords
      const storedChatPw = await AsyncStorage.getItem(
        STORAGE_KEYS.FIRST_PASSWORD,
      );
      const storedWallpaperPw = await AsyncStorage.getItem(
        STORAGE_KEYS.SECOND_PASSWORD,
      );

      // Check if current password matches either stored password
      return (
        passwords.currentPassword === storedChatPw ||
        passwords.currentPassword === storedWallpaperPw ||
        passwords.currentPassword === '331122' || // Default password
        passwords.currentPassword === '123456' // Default password
      );
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  };

  const handleSave = async () => {
    if (!validatePasswords()) {
      return;
    }

    // Verify current password
    const isPasswordValid = await verifyCurrentPassword();
    if (!isPasswordValid) {
      Alert.alert('Error', 'Current password is incorrect');
      return;
    }

    setSaving(true);

    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      // Save to AsyncStorage
      if (passwords.chatPassword) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.FIRST_PASSWORD,
          passwords.chatPassword,
        );
      }

      if (passwords.wallpaperPassword) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.SECOND_PASSWORD,
          passwords.wallpaperPassword,
        );
      }

      // Save to Firestore (encrypted or hashed in production)
      await firestore().collection('Users').doc(currentUser.uid).set(
        {
          passwordsUpdatedAt: firestore.FieldValue.serverTimestamp(),
          // In production, store hashed passwords
        },
        {merge: true},
      );

      Alert.alert('Success', 'Passwords updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error updating passwords:', error);
      Alert.alert('Error', 'Failed to update passwords. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({...prev, [field]: !prev[field]}));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <Text style={styles.infoIcon}>🔐</Text>
              <Text style={styles.infoText}>
                Set separate passwords for Chat and Wallpaper sections
              </Text>
            </View>

            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Current Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    errors.currentPassword && styles.inputError,
                  ]}
                  value={passwords.currentPassword}
                  onChangeText={text =>
                    setPasswords(prev => ({...prev, currentPassword: text}))
                  }
                  placeholder="Enter current password"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPasswords.current}
                  keyboardType="number-pad"
                  maxLength={10}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => togglePasswordVisibility('current')}>
                  <Text style={styles.eyeIcon}>
                    {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.currentPassword && (
                <Text style={styles.errorText}>{errors.currentPassword}</Text>
              )}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Chat Password Section */}
            <Text style={styles.sectionTitle}>💬 Chat Password</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Chat Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    errors.chatPassword && styles.inputError,
                  ]}
                  value={passwords.chatPassword}
                  onChangeText={text =>
                    setPasswords(prev => ({...prev, chatPassword: text}))
                  }
                  placeholder="Enter new chat password"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPasswords.chat}
                  keyboardType="number-pad"
                  maxLength={10}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => togglePasswordVisibility('chat')}>
                  <Text style={styles.eyeIcon}>
                    {showPasswords.chat ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.chatPassword && (
                <Text style={styles.errorText}>{errors.chatPassword}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Chat Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    errors.confirmChatPassword && styles.inputError,
                  ]}
                  value={passwords.confirmChatPassword}
                  onChangeText={text =>
                    setPasswords(prev => ({...prev, confirmChatPassword: text}))
                  }
                  placeholder="Confirm chat password"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPasswords.confirmChat}
                  keyboardType="number-pad"
                  maxLength={10}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => togglePasswordVisibility('confirmChat')}>
                  <Text style={styles.eyeIcon}>
                    {showPasswords.confirmChat ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.confirmChatPassword && (
                <Text style={styles.errorText}>
                  {errors.confirmChatPassword}
                </Text>
              )}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Wallpaper Password Section */}
            <Text style={styles.sectionTitle}>🖼️ Wallpaper Password</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Wallpaper Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    errors.wallpaperPassword && styles.inputError,
                  ]}
                  value={passwords.wallpaperPassword}
                  onChangeText={text =>
                    setPasswords(prev => ({...prev, wallpaperPassword: text}))
                  }
                  placeholder="Enter new wallpaper password"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPasswords.wallpaper}
                  keyboardType="number-pad"
                  maxLength={10}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => togglePasswordVisibility('wallpaper')}>
                  <Text style={styles.eyeIcon}>
                    {showPasswords.wallpaper ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.wallpaperPassword && (
                <Text style={styles.errorText}>{errors.wallpaperPassword}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Wallpaper Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    errors.confirmWallpaperPassword && styles.inputError,
                  ]}
                  value={passwords.confirmWallpaperPassword}
                  onChangeText={text =>
                    setPasswords(prev => ({
                      ...prev,
                      confirmWallpaperPassword: text,
                    }))
                  }
                  placeholder="Confirm wallpaper password"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPasswords.confirmWallpaper}
                  keyboardType="number-pad"
                  maxLength={10}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => togglePasswordVisibility('confirmWallpaper')}>
                  <Text style={styles.eyeIcon}>
                    {showPasswords.confirmWallpaper ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.confirmWallpaperPassword && (
                <Text style={styles.errorText}>
                  {errors.confirmWallpaperPassword}
                </Text>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}>
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Update Passwords</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  keyboardView: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#6366f1',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  passwordContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 16,
    color: '#f8fafc',
    letterSpacing: 4,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 24,
  },
  saveButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;
