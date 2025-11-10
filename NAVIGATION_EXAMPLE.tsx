// EXAMPLE: How to add new Profile/Settings screens to your navigation

import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

// Import existing screens
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import ChatScreen from '../screens/ChatScreen/ChatScreen';
// ... other existing imports

// Import NEW Profile/Settings screens
import EnhancedProfileScreen from '../screens/ProfileScreen/EnhancedProfileScreen';
import EditProfileScreen from '../screens/ProfileScreen/EditProfileScreen';
import ChangePasswordScreen from '../screens/PasswordScreen/ChangePasswordScreen';
import NotificationSettingsScreen from '../screens/SettingsScreen/NotificationSettingsScreen';

const Stack = createStackNavigator();

// Example Stack Navigator
export function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Use custom headers
        cardStyle: {backgroundColor: '#0f172a'},
        animationEnabled: true,
      }}>
      {/* Main Profile Screen */}
      <Stack.Screen name="Profile" component={EnhancedProfileScreen} />

      {/* Edit Profile */}
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          animationEnabled: true,
          presentation: 'card',
        }}
      />

      {/* Change Password */}
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          animationEnabled: true,
          presentation: 'card',
        }}
      />

      {/* Notification Settings */}
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{
          animationEnabled: true,
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
}

// If using Tab Navigator, add Profile tab:
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>🏠</Text>,
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack} // Use the stack
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// Alternative: Add to existing stack
export function AppStack() {
  return (
    <Stack.Navigator>
      {/* Existing screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />

      {/* Add new profile screens */}
      <Stack.Screen
        name="Profile"
        component={EnhancedProfileScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

// Update ScreenConstants.tsx (optional but recommended)
export const ScreenConstants = {
  // Existing
  HOME: 'Home',
  CHAT: 'Chat',
  WALLPAPER: 'Wallpaper',

  // NEW Profile/Settings screens
  PROFILE: 'Profile',
  EDIT_PROFILE: 'EditProfile',
  CHANGE_PASSWORD: 'ChangePassword',
  NOTIFICATION_SETTINGS: 'NotificationSettings',
};

// Usage in components:
// navigation.navigate('Profile');
// navigation.navigate('EditProfile');
// navigation.navigate('ChangePassword');
// navigation.navigate('NotificationSettings');

/*
 * TYPESCRIPT TYPES (if using TypeScript navigation)
 */

export type RootStackParamList = {
  Home: undefined;
  Chat: {chatId: string; groupName: string};
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  // ... other screens
};

// Use in components:
// import {NavigationProp} from '@react-navigation/native';
// type Props = {
//   navigation: NavigationProp<RootStackParamList>;
// };
