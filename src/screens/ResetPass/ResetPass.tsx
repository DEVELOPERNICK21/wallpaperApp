import React, {useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  ScrollView,
  Text,
  Animated,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {KeyboardAvoidingView} from 'react-native';

import {height, width} from '../../assets/string.tsx';
import {colors} from '../../assets/color';
import fonts from '../../assets/fonts';

import Spinner from '../../component/Spinner/Spinner.js';
import {useSelector} from 'react-redux';
import {RootState} from '../../reduxrf/reducers';
import {
  HideEyePass_Icon,
  NewPassVector_Icon,
  PassEye_Icon,
} from '../../assets/icons/index.jsx';
import CustomTextInput from '../../component/CustomTextInput.tsx';
import CustomButton from '../../component/CustomButton.tsx';
import {useNavigation} from '@react-navigation/native';
import ScreenConstants from '../../Routes/ScreenConstants.tsx';

const ResetPass: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isPass, setIsPass] = useState<boolean>(false);
  const [isConfirmPass, setIsConfirmPass] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [showStrengthBar, setShowStrengthBar] = useState<boolean>(false);

  const theme = useSelector((state: RootState) => state.theme);
  const navigation = useNavigation<any>();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;
  const strengthBarAnim = useRef(new Animated.Value(0)).current;

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
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, iconScale]);

  // Password strength checker
  const checkPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength += 1;
    if (/[a-z]/.test(pass)) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const strength = checkPasswordStrength(text);
    setPasswordStrength(strength);
    setShowStrengthBar(text.length > 0);

    Animated.timing(strengthBarAnim, {
      toValue: strength / 5,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return '#ef4444';
    if (passwordStrength <= 2) return '#f97316';
    if (passwordStrength <= 3) return '#eab308';
    if (passwordStrength <= 4) return '#22c55e';
    return '#10b981';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Very Weak';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  const isFormValid = () => {
    return password.length >= 8 && password === confirmPassword;
  };

  let passField = {
    title: 'New Password',
    palceHolderText: 'Enter new password',
    changedText: handlePasswordChange,
    SecondIcon: isPass ? HideEyePass_Icon : PassEye_Icon,
    isPassword: isPass,
    actionSecond: () => {
      setIsPass(!isPass);
    },
  };

  let confirmPassField = {
    title: 'Confirm Password',
    palceHolderText: 'Re-enter new password',
    changedText: (text: string) => {
      setConfirmPassword(text);
    },
    SecondIcon: isConfirmPass ? HideEyePass_Icon : PassEye_Icon,
    isPassword: isConfirmPass,
    actionSecond: () => {
      setIsConfirmPass(!isConfirmPass);
    },
  };

  let loginButtonData = {
    buttonTitle: 'SAVE NEW PASSWORD',
    onPress: () => {
      if (isFormValid()) {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          setLoading(false);
          navigation?.navigate(ScreenConstants?.SUCCESSFULLY_RESET_SCREEN);
        }, 1500);
      }
    },
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 50}
        style={styles.keyboardView}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Spinner style={styles.spinnerArea} />
            <Text style={styles.loadingText}>Updating your password...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <Animated.View
              style={[
                styles.headerSection,
                {
                  opacity: fadeAnim,
                  transform: [{translateY: slideAnim}],
                },
              ]}>
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [{scale: iconScale}],
                  },
                ]}>
                <NewPassVector_Icon height={height / 3} width={width / 1.8} />
              </Animated.View>

              <Text style={styles.titleStyle}>Reset Your Password</Text>
              <Text style={styles.subTitleStyle}>
                Create a strong password to secure your account
              </Text>
            </Animated.View>

            {/* Form Section */}
            <Animated.View
              style={[
                styles.formSection,
                {
                  opacity: fadeAnim,
                  transform: [{translateY: slideAnim}],
                },
              ]}>
              <CustomTextInput inputData={passField} />

              {/* Password Strength Indicator */}
              {showStrengthBar && (
                <Animated.View style={styles.strengthContainer}>
                  <View style={styles.strengthHeader}>
                    <Text style={styles.strengthLabel}>Password Strength</Text>
                    <Text
                      style={[
                        styles.strengthText,
                        {color: getStrengthColor()},
                      ]}>
                      {getStrengthText()}
                    </Text>
                  </View>
                  <View style={styles.strengthBarContainer}>
                    <Animated.View
                      style={[
                        styles.strengthBar,
                        {
                          width: strengthBarAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          }),
                          backgroundColor: getStrengthColor(),
                        },
                      ]}
                    />
                  </View>
                </Animated.View>
              )}

              <CustomTextInput inputData={confirmPassField} />

              {/* Password Match Indicator */}
              {confirmPassword.length > 0 && (
                <View style={styles.matchContainer}>
                  <Text
                    style={[
                      styles.matchText,
                      {
                        color:
                          password === confirmPassword ? '#22c55e' : '#ef4444',
                      },
                    ]}>
                    {password === confirmPassword
                      ? '✓ Passwords match'
                      : '✗ Passwords do not match'}
                  </Text>
                </View>
              )}

              {/* Requirements List */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>
                  Password Requirements:
                </Text>
                <View style={styles.requirementItem}>
                  <Text
                    style={[
                      styles.requirementText,
                      password.length >= 8 && styles.requirementMet,
                    ]}>
                    • At least 8 characters
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Text
                    style={[
                      styles.requirementText,
                      /[a-z]/.test(password) && styles.requirementMet,
                    ]}>
                    • Contains lowercase letter
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Text
                    style={[
                      styles.requirementText,
                      /[A-Z]/.test(password) && styles.requirementMet,
                    ]}>
                    • Contains uppercase letter
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Text
                    style={[
                      styles.requirementText,
                      /[0-9]/.test(password) && styles.requirementMet,
                    ]}>
                    • Contains number
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Text
                    style={[
                      styles.requirementText,
                      /[^A-Za-z0-9]/.test(password) && styles.requirementMet,
                    ]}>
                    • Contains special character
                  </Text>
                </View>
              </View>

              <CustomButton
                buttonData={loginButtonData}
                style={[
                  styles.buttonStyle,
                  !isFormValid() && styles.buttonDisabled,
                ]}
              />

              {/* Back to Login */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>← Back to Login</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerArea: {
    flex: 1,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
    color: colors.greyText,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: width / 15,
    paddingTop: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  titleStyle: {
    color: colors.black,
    fontSize: 32,
    fontFamily: fonts.PoppinsSemiBold,
    textAlign: 'center',
    marginBottom: 10,
  },
  subTitleStyle: {
    color: colors.greyText,
    fontSize: 16,
    fontFamily: fonts.PoppinsRegular,
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    flex: 1,
  },
  strengthContainer: {
    marginTop: 15,
    marginBottom: 20,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    color: colors.greyText,
  },
  strengthText: {
    fontSize: 14,
    fontFamily: fonts.PoppinsSemiBold,
  },
  strengthBarContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 3,
  },
  matchContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  matchText: {
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    textAlign: 'center',
  },
  requirementsContainer: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  requirementsTitle: {
    fontSize: 16,
    fontFamily: fonts.PoppinsSemiBold,
    color: colors.black,
    marginBottom: 12,
  },
  requirementItem: {
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    color: colors.greyText,
  },
  requirementMet: {
    color: '#22c55e',
    fontFamily: fonts.PoppinsMedium,
  },
  buttonStyle: {
    marginVertical: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: colors.primaryColor,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  backButtonText: {
    color: colors.primaryColor,
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
  },
});

export default ResetPass;
