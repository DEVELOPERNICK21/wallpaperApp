import React from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import {Easing, SafeAreaView} from 'react-native';
import ScreenConstants from './ScreenConstants';
import {colors} from '../assets/color';
import fonts from '../assets/fonts';
import {Wallpaper, DynamicIslandSettingsScreen, PetScreen, SubscriptionScreen} from '../screens';

const Stack = createStackNavigator();

const WallpaperStack = () => {
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
    <SafeAreaView style={{flex: 1}}>
      <Stack.Navigator
        screenOptions={{
          color: colors?.primaryColor,
          gestureEnabled: false,
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
          name={ScreenConstants?.WALLPAPER_SCREEN}
          component={Wallpaper}
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
          name={ScreenConstants?.SUBSCRIPTION_SCREEN}
          component={SubscriptionScreen}
          options={{headerShown: false, title: ''}}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
};
export default WallpaperStack;
