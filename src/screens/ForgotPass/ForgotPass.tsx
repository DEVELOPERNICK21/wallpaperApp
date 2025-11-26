import React, {useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  Linking,
} from 'react-native';

import {height, width} from '../../assets/string.tsx';
import {colors} from '../../assets/color';
import fonts from '../../assets/fonts';

import {KeyboardAvoidingView} from 'react-native';
import Spinner from '../../component/Spinner/Spinner.js';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/reducers';
import {UserPass_Icon} from '../../assets/icons/index.jsx';
import CustomTextInput from '../../component/CustomTextInput.tsx';
import CustomButton from '../../component/CustomButton.tsx';
import {useNavigation} from '@react-navigation/native';
import ScreenConstants from '../../Routes/ScreenConstants.tsx';
import auth from '@react-native-firebase/auth';
import {
  PASSWORD_RESET_CONFIG,
  FIREBASE_ERROR_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../../config/constants';
import {
  ShowErrorMessage,
  ShowInfoMessage,
  ShowSuccessMessage,
} from '../../component/FlashMessage/FlashMessage';

const ForgotPass: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const [lastRequestedEmail, setLastRequestedEmail] = useState<string>('');
  const theme = useSelector((state: RootState) => state.theme);
  const navigation = useNavigation();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const startCooldown = useCallback(() => {
    setCooldown(PASSWORD_RESET_CONFIG.COOLDOWN_SECONDS || 60);
  }, []);

  useEffect(() => {
    if (!cooldown) {
      return;
    }

    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  const buildActionCodeSettings = useCallback((targetEmail: string) => {
    if (!PASSWORD_RESET_CONFIG.CONTINUE_URL) {
      return undefined;
    }

    const continueUrl = PASSWORD_RESET_CONFIG.CONTINUE_URL.includes('?')
      ? `${PASSWORD_RESET_CONFIG.CONTINUE_URL}&email=${encodeURIComponent(
          targetEmail,
        )}`
      : `${PASSWORD_RESET_CONFIG.CONTINUE_URL}?email=${encodeURIComponent(
          targetEmail,
        )}`;

    return {
      url: continueUrl,
      handleCodeInApp: PASSWORD_RESET_CONFIG.HANDLE_CODE_IN_APP,
      android: {
        packageName: PASSWORD_RESET_CONFIG.ANDROID_PACKAGE_NAME,
        installApp: true,
        minimumVersion: '1',
      },
      iOS: {
        bundleId: PASSWORD_RESET_CONFIG.IOS_BUNDLE_ID,
      },
    };
  }, []);

  const getFirebaseErrorMessage = useCallback((code?: string) => {
    if (!code) {
      return ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;
    }
    return (
      (FIREBASE_ERROR_CODES as Record<string, string>)[code] ||
      ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR
    );
  }, []);

  const sendResetLink = useCallback(
    async (targetEmail: string) => {
      try {
        setLoading(true);
        const normalizedEmail = targetEmail.trim().toLowerCase();
        const actionCodeSettings = buildActionCodeSettings(normalizedEmail);
        if (actionCodeSettings) {
          await auth().sendPasswordResetEmail(
            normalizedEmail,
            actionCodeSettings,
          );
        } else {
          await auth().sendPasswordResetEmail(normalizedEmail);
        }
        setLoading(false);
        setEmailSent(true);
        setLastRequestedEmail(normalizedEmail);
        startCooldown();
        ShowSuccessMessage(SUCCESS_MESSAGES.AUTH.PASSWORD_RESET);
      } catch (error: any) {
        console.error('Password reset error:', error);
        setLoading(false);
        const errorMessage = getFirebaseErrorMessage(error?.code);
        ShowErrorMessage(errorMessage);
      }
    },
    [buildActionCodeSettings, getFirebaseErrorMessage, startCooldown],
  );

  const handleSendResetEmail = useCallback(async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      ShowErrorMessage('Please enter your email address.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      ShowErrorMessage(ERROR_MESSAGES.AUTH.INVALID_EMAIL);
      return;
    }

    await sendResetLink(trimmedEmail);
  }, [email, sendResetLink]);

  const handleResendLink = useCallback(async () => {
    if (cooldown > 0 || loading) {
      return;
    }

    const targetEmail = (lastRequestedEmail || email).trim().toLowerCase();
    if (!targetEmail) {
      ShowErrorMessage('Enter your email above before requesting a link.');
      return;
    }

    if (!validateEmail(targetEmail)) {
      ShowErrorMessage(ERROR_MESSAGES.AUTH.INVALID_EMAIL);
      return;
    }

    await sendResetLink(targetEmail);
  }, [cooldown, email, lastRequestedEmail, loading, sendResetLink]);

  const handleOpenMailbox = useCallback(async () => {
    try {
      const mailUrl = 'mailto:';
      const canOpen = await Linking.canOpenURL(mailUrl);
      if (canOpen) {
        await Linking.openURL(mailUrl);
      } else {
        ShowInfoMessage('Open your preferred email app to find the reset link.');
      }
    } catch {
      ShowInfoMessage('Open your preferred email app to find the reset link.');
    }
  }, []);

  const canResend = cooldown === 0 && !loading;

  let userId = {
    title: 'Email',
    palceHolderText: 'Enter your email',
    changedText: (text: string) => {
      setEmail(text);
    },
    value: email,
  };

  let loginButtonData = {
    buttonTitle: loading ? 'SENDING...' : 'SEND RESET LINK',
    onPress: handleSendResetEmail,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior based on platform
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 50} // Adjust offset for iOS
      style={[styles.loginWrapper, {backgroundColor: theme.colors.background}]}>
      {loading ? (
        <Spinner style={styles?.spinnerArea} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <UserPass_Icon height={height / 2.5} width={width / 1.5} />
          <Text style={styles?.titleStyle}>Forgot Your Password?</Text>
          <Text style={styles?.subTitleStyle}>
            Enter the email address or phone number associated with your
            account, and we’ll send you a link or code to reset your password.
          </Text>
          <CustomTextInput inputData={userId} />

          {emailSent && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                ✓ We sent a reset link to{' '}
                <Text style={styles.successEmail}>
                  {lastRequestedEmail || email}
                </Text>
              </Text>
              <View style={styles.successActions}>
                <TouchableOpacity
                  style={styles.outlineButton}
                  onPress={handleOpenMailbox}
                  activeOpacity={0.8}>
                  <Text style={styles.outlineButtonText}>Open mail app</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.resendButton,
                    (!canResend || loading) && styles.resendButtonDisabled,
                  ]}
                  disabled={!canResend}
                  onPress={handleResendLink}
                  activeOpacity={0.8}>
                  <Text style={styles.resendButtonText}>
                    {canResend
                      ? 'Resend link'
                      : `Resend in ${cooldown}s`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <CustomButton
            buttonData={loginButtonData}
            style={[styles?.buttonStyle, loading && styles.buttonDisabled]}
          />

          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backToLoginText}>← Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              💡 Didn't receive the email? Check spam/junk folders, add
              notifications@firebaseapp.com to your safe senders list, or tap
              "Resend link" above once the timer ends.
            </Text>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loginWrapper: {
    flex: 1,
  },
  spinnerArea: {
    flex: 1,
  },
  scrollContainer: {
    // flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width / 15,
  },
  titleStyle: {
    color: colors.black,
    fontSize: 32,
    fontFamily: fonts.PoppinsSemiBold,
    marginTop: 10,
    textAlign: 'center',
  },
  subTitleStyle: {
    color: colors.greyText,
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    textAlign: 'center',
    paddingVertical: width / 50,
  },
  forgotStyle: {
    width: '100%',
    marginVertical: 10,
  },
  forgotStyleText: {
    color: colors.primaryColor,
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    textAlign: 'right',
  },

  lineTwo: {
    backgroundColor: colors.inputBorder,
    height: height / 800,
    width: '35%',
  },
  textAndPick: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countryPick: {
    width: '15%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: height / 16,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
  },
  buttonStyle: {
    marginVertical: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  successContainer: {
    backgroundColor: '#d1fae5',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  successText: {
    color: '#047857',
    fontSize: 14,
    fontFamily: fonts.PoppinsMedium,
    textAlign: 'center',
  },
  successEmail: {
    fontWeight: '700',
  },
  successActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#047857',
    fontSize: 13,
    fontFamily: fonts.PoppinsMedium,
  },
  resendButton: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#d1fae5',
    fontSize: 13,
    fontFamily: fonts.PoppinsMedium,
  },
  backToLoginButton: {
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 10,
  },
  backToLoginText: {
    color: colors.primaryColor,
    fontSize: 16,
    fontFamily: fonts.PoppinsMedium,
  },
  infoContainer: {
    backgroundColor: '#fef3c7',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  infoText: {
    color: '#92400e',
    fontSize: 13,
    fontFamily: fonts.PoppinsRegular,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ForgotPass;
