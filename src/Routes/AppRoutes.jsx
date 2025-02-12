import React from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import {Easing, SafeAreaView} from 'react-native';
import ScreenConstants from './ScreenConstants';
import {colors} from '../assets/color';
import fonts from '../assets/fonts';
import {
  ChatScreen,
  CreateGroupChat,
  HomeScreen,
  NewChatRoom,
  PasswordScreen,
  ScannerScreen,
} from '../screens';
import MyStatusBar from '../component/StatusBar';
import UserBottomTab from './UserBottomTabNavigator';

const Stack = createStackNavigator();

const AppRoutes = () => {
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
    <Stack.Navigator
      screenOptions={{
        color: colors?.primaryColor,
        // gestureEnabled: false,
        gestureDirection: 'horizontal',
        transitionSpec: {
          open: config,
          close: closeConfig,
        },
        headerStyle: {
          backgroundColor: colors?.primaryColor,
        },
        headerTitleAlign: 'center',
        headerTintColor: 'white',
        headerTitleStyle: {fontFamily: fonts?.PoppinsSemiBold},
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      <Stack.Screen
        name={ScreenConstants?.HOME_USER_SCREEN}
        component={HomeScreen}
        options={{headerShown: false, title: ''}}
      />

      <Stack.Screen
        name={ScreenConstants?.CHAT_SCREEN}
        component={ChatScreen}
        options={{headerShown: false, title: ''}}
      />
      <Stack.Screen
        name={ScreenConstants?.NEW_CHAT_ROOM_SCREEN}
        component={NewChatRoom}
        options={{headerShown: false, title: ''}}
      />
      <Stack.Screen
        name={ScreenConstants?.CREATE_GROUP_CHAT}
        component={CreateGroupChat}
        options={{headerShown: false, title: ''}}
      />
    </Stack.Navigator>
  );
};
export default AppRoutes;
