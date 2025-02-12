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
  Lock3D_Icon,
  PassEye_Icon,
  UserVector_Icon,
} from '../../assets/icons/index.jsx';
import CommonThinInput from '../../component/Input/CommonThinInput.tsx';
import CustomMainTextInput from '../../component/CustomMainTextInput.tsx';
import CustomTextInput from '../../component/CustomTextInput.tsx';
import CustomButton from '../../component/CustomButton.tsx';
import {useNavigation} from '@react-navigation/native';
import ScreenConstants from '../../Routes/ScreenConstants.tsx';
import {ShowErrorMessage} from '../../component/FlashMessage/FlashMessage.tsx';
import {getAuth} from '@react-native-firebase/auth';
import {storeUserDetails} from '../../reduxrf/actions/user.ts';

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

  const handleLogin = async () => {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(
        email,
        password,
      );
      const user = userCredential.user;

      // Dispatch user details to Redux store
      dispatch(storeUserDetails(user));

      // Navigate to the next screen
    } catch (error) {
      ShowErrorMessage(error.message);
      // Alert.alert("Login Error", error.message);
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
