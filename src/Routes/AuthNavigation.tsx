import React, {useEffect, useState} from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import {Easing, Platform} from 'react-native';
import ScreenConstants from './ScreenConstants';
import {
  ForgotPass,
  LoginScreen,
  OnBoarding,
  ResetPass,
  SignUpScreen,
  SuccessfullyReset,
  VerifyOtp,
} from '../screens';
import {colors} from '../assets/color';
import MyStatusBar from '../component/StatusBar';

const Stack = createStackNavigator();

const AuthNavigation = () => {
  const config = {
    animation: 'timing',
    config: {
      duration: 400,
      easing: Easing.linear,
    },
  };

  const closeConfig = {
    animation: 'timing',
    config: {
      duration: 200,
      easing: Easing.linear,
    },
  };

  return (
    <>
      <MyStatusBar
        backgroundColor={colors?.primaryColor}
        barStyle="light-content"
      />
      <Stack.Navigator
        screenOptions={{
          headerTitleAlign: Platform.OS === 'android' ? 'left' : 'center',
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          transitionSpec: {
            open: config,
            close: closeConfig,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          headerStyle: {
            backgroundColor: colors?.screenBackColor,
          },
        }}>
        <Stack.Screen
          name={ScreenConstants?.ON_BOARDING_SCREEN}
          component={OnBoarding}
        />
        <Stack.Screen
          name={ScreenConstants?.SIGN_IN_SCREEN}
          component={SignUpScreen}
        />
        <Stack.Screen
          name={ScreenConstants?.LOGIN_SCREEN}
          component={LoginScreen}
        />
        <Stack.Screen
          name={ScreenConstants?.FORGOT_PASSWORD}
          component={ForgotPass}
        />
        <Stack.Screen
          name={ScreenConstants?.OTP_SCREEN}
          component={VerifyOtp}
        />
        <Stack.Screen
          name={ScreenConstants?.RESET_PASSWORD_SCREEN}
          component={ResetPass}
        />
        <Stack.Screen
          name={ScreenConstants?.SUCCESSFULLY_RESET_SCREEN}
          component={SuccessfullyReset}
        />
      </Stack.Navigator>
    </>
  );
};

export default AuthNavigation;
