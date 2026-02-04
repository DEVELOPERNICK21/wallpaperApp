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
  EnhancedProfileScreen,
  EditProfileScreen,
  ChangePasswordScreen,
  NotificationSettingsScreen,
  DynamicIslandSettingsScreen,
  PetScreen,
  PrivacySecurityScreen,
  PrivacyPolicyScreen,
  SubscriptionScreen,
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

      {/* Profile & Settings Screens */}
      <Stack.Screen
        name={ScreenConstants?.PROFILE_SCREEN}
        component={EnhancedProfileScreen}
        options={{headerShown: false, title: ''}}
      />
      <Stack.Screen
        name={ScreenConstants?.EDIT_PROFILE_SCREEN}
        component={EditProfileScreen}
        options={{headerShown: false, title: ''}}
      />
      <Stack.Screen
        name={ScreenConstants?.CHANGE_PASSWORD_SCREEN}
        component={ChangePasswordScreen}
        options={{headerShown: false, title: ''}}
      />
      <Stack.Screen
        name={ScreenConstants?.NOTIFICATION_SETTINGS_SCREEN}
        component={NotificationSettingsScreen}
        options={{headerShown: false, title: ''}}
      />
      <Stack.Screen
        name={ScreenConstants?.DYNAMIC_ISLAND_SETTINGS_SCREEN}
        component={DynamicIslandSettingsScreen}
        options={{headerShown: false, title: ''}}
      />
      <Stack.Screen
        name={ScreenConstants?.PET_SCREEN}
        component={PetScreen}
        options={{headerShown: false, title: ''}}
      />
      <Stack.Screen
        name={ScreenConstants?.PRIVACY_SECURITY_SCREEN}
        component={PrivacySecurityScreen}
        options={{headerShown: false, title: ''}}
      />
      <Stack.Screen
        name={ScreenConstants?.PRIVACY_POLICY_SCREEN}
        component={PrivacyPolicyScreen}
        options={{headerShown: false, title: ''}}
      />
      <Stack.Screen
        name={ScreenConstants?.SUBSCRIPTION_SCREEN}
        component={SubscriptionScreen}
        options={{headerShown: false, title: ''}}
      />
    </Stack.Navigator>
  );
};
export default AppRoutes;
