import React, {useState} from 'react';
import {
  StyleSheet,
  Platform,
  ScrollView,
  Text,
  Pressable,
  KeyboardAvoidingView,
} from 'react-native';
import {height, width} from '../../assets/string.tsx';
import {colors} from '../../assets/color';
import fonts from '../../assets/fonts';
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
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from '@react-native-firebase/auth'; // Import Firebase Auth
import {
  collection,
  doc,
  getFirestore,
  setDoc,
} from '@react-native-firebase/firestore'; // Import Firestore

import {storeUserDetails} from '../../reduxrf/actions/user.ts';
import {showMessage} from 'react-native-flash-message';
import {ShowSuccessMessage} from '../../component/FlashMessage/FlashMessage.tsx';
import {setLogOut} from '../../redux/actions/users.js';
import {removeUserData} from '../../utils/asynstorage.js';

const SignUpScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setname] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPass, setIsPass] = useState<boolean>(false);
  const theme = useSelector((state: RootState) => state.theme);

  // console.log(theme?.darkMode, 'THEME');
  const navigation = useNavigation();
  const auth = getAuth();
  const firestore = getFirestore();

  const dispatch = useDispatch();

  const handleSignup = async () => {
    console.log('start');
    if (!name || !email || !password) {
      return {success: false, error: 'Please enter all details'};
    }

    try {
      setLoading(true); // Show loading spinner

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, {displayName: name});

      // Save user data in Firestore
      const usersCollection = collection(firestore, 'Users');
      const userDoc = doc(usersCollection, user.uid);
      await setDoc(userDoc, {name, email});

      // ✅ Sign out user after successful registration
      await auth().signOut();
      try {
        dispatch(setLogOut());
        await removeUserData();
        navigation.reset({
          index: 0,
          routes: [{name: ScreenConstants.LOGIN_SCREEN}],
        });
      } catch (error) {
        console.error('Error signing out: ', error);
      }

      setLoading(false); // Hide spinner
      ShowSuccessMessage('Account created! Please log in.');

      // ✅ Reset navigation stack to LOGIN_SCREEN
      navigation.reset({
        index: 0,
        routes: [{name: ScreenConstants.LOGIN_SCREEN}],
      });

      return {success: true};
    } catch (error) {
      console.error('Signup Error:', error);
      setLoading(false);

      let errorMessage = 'Something went wrong. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'That email address is already in use!';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'That email address is invalid!';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The password is too weak.';
      }

      return {success: false, error: errorMessage};
    }
  };

  let nameData = {
    title: 'Name',
    palceHolderText: 'Enter your name',
    changedText: (text: string) => {
      setname(text);
    },
    // FirstIcon: UserVector_Icon,
  };
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
  let loginButtonData = {
    buttonTitle: 'SIGN UP',
    onPress: () => handleSignup(),
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
          <CustomTextInput inputData={nameData} />

          <CustomTextInput inputData={userId} keyboardType="email-address" />
          <CustomTextInput inputData={passField} />
          <Pressable
            style={styles?.forgotStyle}
            onPress={() => {
              navigation?.navigate(ScreenConstants?.FORGOT_PASSWORD);
            }}>
            <Text style={styles?.forgotStyleText}>Forgot Password?</Text>
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
  greenText: {
    color: colors.primaryColor,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: fonts.PoppinsMedium,
  },
  textInput: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SignUpScreen;
