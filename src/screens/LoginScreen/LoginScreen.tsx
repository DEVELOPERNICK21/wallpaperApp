import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  ScrollView,
  Text,
  Pressable,
  Alert,
} from 'react-native';

import {height, width} from '../../assets/string.tsx';
import {colors} from '../../assets/color';
import fonts from '../../assets/fonts';

import {KeyboardAvoidingView} from 'react-native';
import Spinner from '../../component/Spinner/Spinner.js';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/reducers';
import {
  EnterLogin_Icon,
  HideEyePass_Icon,
  PassEye_Icon,
} from '../../assets/icons/index.jsx';
import CustomTextInput from '../../component/CustomTextInput.tsx';
import CustomButton from '../../component/CustomButton.tsx';
import {useNavigation} from '@react-navigation/native';
import ScreenConstants from '../../Routes/ScreenConstants.tsx';
import {ShowErrorMessage} from '../../component/FlashMessage/FlashMessage.tsx';
import {getAuth} from '@react-native-firebase/auth';
import {storeUserDetails} from '../../reduxrf/actions/user.ts';

import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import SubscriptionService from '../../services/SubscriptionService';
import {ERROR_MESSAGES, FIREBASE_ERROR_CODES} from '../../config/constants.ts';

const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPass, setIsPass] = useState<boolean>(false);
  const theme = useSelector((state: RootState) => state.theme);

  const navigation = useNavigation();
  const auth = getAuth();
  const dispatch = useDispatch();

  let userId = {
    title: 'Email',
    palceHolderText: 'Enter your mail',
    changedText: (text: string) => {
      setEmail(text);
    },
    // FirstIcon: UserVector_Icon,
  };
  let passField = {
    title: 'Password',
    palceHolderText: 'Enter your password',
    changedText: (text: string) => {
      setPassword(text);
    },
    // FirstIcon: Lock3D_Icon,
    SecondIcon: isPass ? HideEyePass_Icon : PassEye_Icon,
    isPassword: isPass,
    actionSecond: () => {
      setIsPass(!isPass);
    },
  };

  const updateFCMToken = async userId => {
    try {
      console.log('Checking FCM Token...');

      // Only required for iOS devices
      if (Platform.OS === 'ios') {
        await messaging().registerDeviceForRemoteMessages();
      }

      // Get the FCM token
      const token = await messaging().getToken();

      if (token) {
        console.log('FCM Token:', token); // Log the token for debugging

        // Store the token in Firestore under the user's document
        await firestore()
          .collection('Users')
          .doc(userId)
          .set({fcmToken: token}, {merge: true}); // Merge ensures existing data isn't overwritten

        console.log('✅ FCM Token updated successfully');
      } else {
        console.warn('⚠️ No FCM token received');
      }
    } catch (error) {
      console.error('❌ Error updating FCM Token:', error);
    }
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      ShowErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await auth.signInWithEmailAndPassword(
        trimmedEmail,
        trimmedPassword,
      );
      const user = userCredential.user;

      // Store user details in Redux
      dispatch(storeUserDetails(user));

      // Check subscription status
      const subscriptionStatus =
        await SubscriptionService.checkSubscriptionStatus(user.uid);

      // Update FCM token in Firestore
      await updateFCMToken(user.uid);

      // Navigate into the app. Individual features will gate access based on subscription.
      navigation.navigate(ScreenConstants.HOME_SCREEN, {
        subscriptionActive: subscriptionStatus?.isActive ?? false,
      });
    } catch (error: any) {
      const friendlyMessage =
        (FIREBASE_ERROR_CODES as Record<string, string>)[error?.code] ||
        ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
      ShowErrorMessage(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  let loginButtonData = {
    buttonTitle: 'SIGN IN',
    onPress: () => handleLogin(),
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
          <EnterLogin_Icon height={height / 2.5} width={width / 1.5} />
          <Text style={styles?.titleStyle}>Welcome to Somewhere</Text>
          <Text style={styles?.subTitleStyle}>Streamline Your Conection</Text>
          <CustomTextInput inputData={userId} keyboardType="email-address" />
          <CustomTextInput inputData={passField} />
          <Pressable
            style={styles?.forgotStyle}
            onPress={() => {
              navigation?.navigate(ScreenConstants?.FORGOT_PASSWORD);
            }}>
            <Text style={styles?.forgotStyleText}>Forgot Password?</Text>
          </Pressable>
          <Pressable
            style={styles?.forgotStyle}
            onPress={() => {
              navigation?.navigate(ScreenConstants?.SIGN_IN_SCREEN);
            }}>
            <Text style={styles?.forgotStyleText}>Sign Up?</Text>
          </Pressable>
          <CustomButton buttonData={loginButtonData} />
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
    fontSize: 15,
    fontFamily: fonts.PoppinsMedium,
    textAlign: 'center',
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
  forgotArea: {
    width: '100%',
    textAlign: 'center',
    alignItems: 'flex-end',
  },

  textInput: {
    color: '#fff',
    fontSize: 16,
  },
});

export default LoginScreen;
