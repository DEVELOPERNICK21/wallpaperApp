import React, {useState} from 'react';
import {StyleSheet, View, Platform, ScrollView, Text} from 'react-native';

import {height, width} from '../../assets/string.tsx';
import {colors} from '../../assets/color';
import fonts from '../../assets/fonts';

import {KeyboardAvoidingView} from 'react-native';
import Spinner from '../../component/Spinner/Spinner.js';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/reducers';
import {
  EnterLogin_Icon,
  HideEyePass_Icon,
  NewPassVector_Icon,
  PassEye_Icon,
  UserPass_Icon,
} from '../../assets/icons/index.jsx';
import CommonThinInput from '../../component/Input/CommonThinInput.tsx';
import CustomMainTextInput from '../../component/CustomMainTextInput.tsx';
import CustomTextInput from '../../component/CustomTextInput.tsx';
import CustomButton from '../../component/CustomButton.tsx';
import {useNavigation} from '@react-navigation/native';
import ScreenConstants from '../../Routes/ScreenConstants.tsx';

const ResetPass: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [password, setPassword] = useState<string>();
  const [isPass, setIsPass] = useState<boolean>(false);
  const theme = useSelector((state: RootState) => state.theme);

  const navigation = useNavigation();

  let passField = {
    title: 'New Password',
    palceHolderText: 'Enter new password',
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

  let confirmPassField = {
    title: 'Confirm Password',
    palceHolderText: 'Re-enter new password',
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
    buttonTitle: 'SAVE NEW PASSWORD',
    onPress: () => {
      navigation?.navigate(ScreenConstants?.SUCCESSFULLY_RESET_SCREEN);
    },
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
          <NewPassVector_Icon height={height / 2.5} width={width / 1.5} />
          <Text style={styles?.titleStyle}>Reset Your Password</Text>
          <Text style={styles?.subTitleStyle}>
            Create a new password to secure your account.
          </Text>
          <CustomTextInput inputData={passField} />
          <CustomTextInput inputData={confirmPassField} />

          <CustomButton
            buttonData={loginButtonData}
            style={styles?.buttonStyle}
          />
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
});

export default ResetPass;
