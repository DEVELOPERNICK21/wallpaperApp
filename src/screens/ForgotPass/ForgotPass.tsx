import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  ScrollView,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';

import {height, width} from '../../assets/string.tsx';
import {colors} from '../../assets/color';
import fonts from '../../assets/fonts';

import {KeyboardAvoidingView} from 'react-native';
import Spinner from '../../component/Spinner/Spinner.js';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/reducers';
import {EnterLogin_Icon, UserPass_Icon} from '../../assets/icons/index.jsx';
import CommonThinInput from '../../component/Input/CommonThinInput.tsx';
import CustomMainTextInput from '../../component/CustomMainTextInput.tsx';
import CustomTextInput from '../../component/CustomTextInput.tsx';
import CustomButton from '../../component/CustomButton.tsx';
import {useNavigation} from '@react-navigation/native';
import ScreenConstants from '../../Routes/ScreenConstants.tsx';
import auth from '@react-native-firebase/auth';

const ForgotPass: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const theme = useSelector((state: RootState) => state.theme);
  const navigation = useNavigation();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendResetEmail = async () => {
    if (!email || !email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      await auth().sendPasswordResetEmail(email.trim());
      setLoading(false);
      setEmailSent(true);
      Alert.alert(
        'Success',
        'Password reset email sent! Please check your inbox.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
      );
    } catch (error: any) {
      setLoading(false);
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to send reset email. Please try again.';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }

      Alert.alert('Error', errorMessage);
    }
  };

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
                ✓ Check your email for reset instructions
              </Text>
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
              💡 Didn't receive the email? Check your spam folder or try again.
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
