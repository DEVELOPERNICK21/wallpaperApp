import React, {useState} from 'react';
import {StyleSheet, View, Platform, ScrollView, Text} from 'react-native';

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

const ForgotPass: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [isPass, setIsPass] = useState<boolean>(false);
  const theme = useSelector((state: RootState) => state.theme);
  const navigation = useNavigation();

  let userId = {
    title: 'Email',
    palceHolderText: 'Enter your mail',
    changedText: (text: string) => {
      setEmail(text);
    },
    // FirstIcon: UserVector_Icon,
  };

  let loginButtonData = {
    buttonTitle: 'SEND RESET LINK',
    onPress: () => {
      navigation?.navigate(ScreenConstants?.OTP_SCREEN);
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
          <UserPass_Icon height={height / 2.5} width={width / 1.5} />
          <Text style={styles?.titleStyle}>Forgot Your Password?</Text>
          <Text style={styles?.subTitleStyle}>
            Enter the email address or phone number associated with your
            account, and we’ll send you a link or code to reset your password.
          </Text>
          <CustomTextInput inputData={userId} />
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
export default ForgotPass;
