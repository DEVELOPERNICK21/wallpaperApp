import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  SafeAreaView,
  Alert,
  Vibration,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_FIRST_PASSWORD = '331122';
const DEFAULT_SECOND_PASSWORD = '123456';

const STORAGE_KEYS = {
  FIRST_PASSWORD: '@wallpaper_app:first_password',
  SECOND_PASSWORD: '@wallpaper_app:second_password',
};

const PasswordScreen = ({
  onUnlock,
  isLockScreen = false,
  unlockMode,
}: {
  onUnlock: (type?: string | null) => void;
  isLockScreen?: boolean;
  /** When 'chatOnly', only first password unlocks to chat; second password or cancel closes */
  unlockMode?: 'chatOnly';
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const inputScale = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

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
      Animated.spring(inputScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, inputScale]);

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const buttonPressAnimation = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadStoredPasswords = async () => {
    try {
      const firstPw = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_PASSWORD);
      const secondPw = await AsyncStorage.getItem(STORAGE_KEYS.SECOND_PASSWORD);

      return {
        firstPassword: firstPw || DEFAULT_FIRST_PASSWORD,
        secondPassword: secondPw || DEFAULT_SECOND_PASSWORD,
      };
    } catch (error) {
      console.error('Error loading passwords:', error);
      return {
        firstPassword: DEFAULT_FIRST_PASSWORD,
        secondPassword: DEFAULT_SECOND_PASSWORD,
      };
    }
  };

  const handleUnlock = async () => {
    if (password.length === 0) {
      Alert.alert('Required', 'Please enter your PIN');
      return;
    }

    setIsLoading(true);
    buttonPressAnimation();

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Load stored passwords
    const {firstPassword, secondPassword} = await loadStoredPasswords();

    if (isLockScreen) {
      // Lock screen mode: Any correct password unlocks
      if (password === firstPassword || password === secondPassword) {
        onUnlock(); // Just unlock, don't navigate
      } else {
        setAttempts(prev => prev + 1);
        shakeAnimation();
        Vibration.vibrate(500);

        if (attempts >= 2) {
          Alert.alert(
            'Too Many Attempts',
            'Please try again later.',
            [{text: 'OK', onPress: () => setPassword('')}],
          );
          setAttempts(0);
        } else {
          Alert.alert(
            'Incorrect PIN',
            `${3 - attempts} attempts remaining.`,
            [{text: 'OK', onPress: () => setPassword('')}],
          );
        }
      }
    } else {
      // Initial login / premium unlock: Navigate based on password
      if (password === firstPassword) {
        onUnlock('chat'); // Navigate to Chat Stack
      } else if (password === secondPassword) {
        // Navigate to wallpaper (in chatOnly mode, handler will just close and stay on wallpaper)
        onUnlock('wallpaper');
      } else {
        setAttempts(prev => prev + 1);
        shakeAnimation();
        Vibration.vibrate(500);

        if (attempts >= 2) {
          Alert.alert(
            'Too Many Attempts',
            'Please try again later.',
            [{text: 'OK', onPress: () => setPassword('')}],
          );
          setAttempts(0);
        } else {
          Alert.alert(
            'Incorrect PIN',
            `${3 - attempts} attempts remaining.`,
            [{text: 'OK', onPress: () => setPassword('')}],
          );
        }
      }
    }

    setIsLoading(false);
  };

  const getAttemptsColor = () => {
    if (attempts === 0) return '#22c55e';
    if (attempts === 1) return '#f97316';
    return '#ef4444';
  };

  const getAttemptsText = () => {
    if (attempts === 0) return 'Enter PIN to continue';
    if (attempts === 1) return '2 attempts remaining';
    return '1 attempt remaining';
  };

  const handleKeyPress = ({nativeEvent}: {nativeEvent: any}) => {
    if (nativeEvent.key === 'Enter') {
      handleUnlock();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{translateY: slideAnim}],
              },
            ]}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.iconContainer}>
                <Text style={styles.lockIcon}>✨</Text>
              </View>

              <Text style={styles.title}>Unlock Premium Wallpapers</Text>
              <Text style={styles.subtitle}>
                Enter your PIN to access premium wallpaper collection
              </Text>
            </View>

            {/* Password Input Section */}
            <Animated.View
              style={[
                styles.inputSection,
                {
                  transform: [{scale: inputScale}, {translateX: shakeAnim}],
                },
              ]}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  keyboardType="number-pad"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter PIN"
                  placeholderTextColor="#94a3b8"
                  maxLength={6}
                  onKeyPress={handleKeyPress}
                  autoFocus
                />

                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeIcon}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Password Dots */}
              <View style={styles.passwordDots}>
                {[...Array(6)].map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index < password.length && styles.dotFilled,
                    ]}
                  />
                ))}
              </View>

              {/* Attempts Counter */}
              <View style={styles.attemptsContainer}>
                <Text
                  style={[styles.attemptsText, {color: getAttemptsColor()}]}>
                  {getAttemptsText()}
                </Text>
              </View>
            </Animated.View>

            {/* Action Buttons */}
            <View style={styles.buttonSection}>
              <Animated.View style={{transform: [{scale: buttonScale}]}}>
                <TouchableOpacity
                  style={[
                    styles.unlockButton,
                    (isLoading || password.length === 0) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={handleUnlock}
                  disabled={isLoading || password.length === 0}
                  activeOpacity={0.8}>
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <View style={styles.spinner} />
                      <Text style={styles.loadingText}>Verifying...</Text>
                    </View>
                  ) : (
                    <Text style={styles.unlockButtonText}>Unlock Access</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setPassword('')}
                disabled={password.length === 0}>
                <Text
                  style={[
                    styles.clearButtonText,
                    password.length === 0 && styles.clearButtonDisabled,
                  ]}>
                  Clear
                </Text>
              </TouchableOpacity>

              {unlockMode === 'chatOnly' && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => onUnlock('wallpaper')}>
                  <Text style={styles.cancelButtonText}>Not now</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Premium access is protected. Multiple failed attempts may
                temporarily limit access.
              </Text>
            </View>
          </Animated.View>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputSection: {
    width: '100%',
    marginBottom: 40,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 60,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#f8fafc',
    textAlign: 'center',
    letterSpacing: 8,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  eyeIcon: {
    fontSize: 20,
  },
  passwordDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#334155',
    marginHorizontal: 5,
  },
  dotFilled: {
    backgroundColor: '#6366f1',
  },
  attemptsContainer: {
    alignItems: 'center',
  },
  attemptsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  unlockButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#475569',
    opacity: 0.6,
  },
  unlockButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderTopColor: 'transparent',
    marginRight: 10,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  clearButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButtonDisabled: {
    color: '#64748b',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PasswordScreen;
