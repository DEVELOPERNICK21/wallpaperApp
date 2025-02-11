import {View, Text, Easing, Animated, Platform} from 'react-native';
import React, {useRef, useEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StyleSheet} from 'react-native';
import {
  Home_Icon,
  Note_Icon,
  Setting_Icon,
  Profile_Icon,
  PlusVector_Icon,
  ActiveHome_Icon,
  NotificationStatus_Icon,
  ActiveNotificationStatus_Icon,
  ActiveSetting_Icon,
  ActiveProfile_Icon,
} from '../assets/icons';
import {colors} from '../assets/color';
import {height, width} from '../assets/string.tsx';
import fonts from '../assets/fonts';
import {
  AlertScreen,
  HomeScreen,
  PopUp,
  ProfileScreen,
  SettingsScreen,
} from '../screens';
import ScreenConstants from './ScreenConstants';
import MyStatusBar from '../component/StatusBar.jsx';

const UserBottomTab = () => {
  const Tab = createBottomTabNavigator();

  // Custom component for animating the icon
  const AnimatedIcon = ({
    focused,
    activeIcon: ActiveIcon,
    inactiveIcon: InactiveIcon,
    label,
  }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      if (focused) {
        // Animate the icon to a larger size
        Animated.spring(scaleValue, {
          toValue: 1.2,
          useNativeDriver: true,
        }).start();
      } else {
        // Animate the icon back to its original size
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    }, [focused]);

    return (
      <View style={styles.TotalWrap}>
        <Animated.View style={{transform: [{scale: scaleValue}]}}>
          {focused ? (
            <ActiveIcon width={height / 18} height={width / 18} />
          ) : (
            <InactiveIcon width={height / 18} height={width / 18} />
          )}
        </Animated.View>
        {/* <Text style={focused ? styles.ActiveText : styles.InActiveText}>
          {label}
        </Text> */}
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabel: () => null,
        headerShown: false,
        tabBarStyle: styles.tabStyle,
        tabBarItemStyle: styles.tabItemStyle,
      }}>
      <Tab.Screen
        name={ScreenConstants.HOME_USER_SCREEN}
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <AnimatedIcon
              focused={focused}
              activeIcon={ActiveHome_Icon}
              inactiveIcon={Home_Icon}
              // label="Home"
            />
          ),
        }}
      />
      <Tab.Screen
        name={ScreenConstants.ALERT_BOTTOM_SCREEN}
        component={AlertScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <AnimatedIcon
              focused={focused}
              activeIcon={ActiveNotificationStatus_Icon}
              inactiveIcon={NotificationStatus_Icon}
              // label="Alert"
            />
          ),
        }}
      />
      <Tab.Screen
        name={ScreenConstants.OTP_SCREEN}
        component={PopUp} // Replace with the component for this icon
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({focused}) => (
            <View style={styles.FloatingIconWrapper}>
              <AnimatedIcon
                focused={focused}
                activeIcon={PlusVector_Icon}
                inactiveIcon={PlusVector_Icon}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name={ScreenConstants.SETTINGS_BOTTOM_SCREEN}
        component={SettingsScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <AnimatedIcon
              focused={focused}
              activeIcon={ActiveSetting_Icon}
              inactiveIcon={Setting_Icon}
              // label="Setting"
            />
          ),
        }}
      />
      <Tab.Screen
        name={ScreenConstants.PROFILE_BOTTOM_SCREEN}
        component={ProfileScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <AnimatedIcon
              focused={focused}
              activeIcon={ActiveProfile_Icon}
              inactiveIcon={Profile_Icon}
              // label="Profile"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default UserBottomTab;

const styles = StyleSheet.create({
  tabStyle: {
    height: Platform?.OS === 'android' ? height / 14 : height / 10,
    backgroundColor: colors?.white,
    paddingHorizontal: 20,
    borderTopWidth: 0,
    color: colors?.white,
    shadowColor: colors?.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: Platform.OS === 'android' ? 0.9 : 0.2,
    shadowRadius: 20,
    elevation: 50,
  },
  tabItemStyle: {},
  TotalWrap: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    textAlign: 'center',
  },
  ActiveText: {
    width: '100%',
    textAlign: 'center',
    color: colors.white,
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 10,
    lineHeight: 15,
    paddingTop: 5,
  },
  InActiveText: {
    textAlign: 'center',
    color: colors.black,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 10,
    lineHeight: 15,
    paddingTop: 5,
  },
  FloatingIconWrapper: {
    width: width / 8,
    height: width / 8,
    borderRadius: width, // Makes it circular
    backgroundColor: colors.primaryColor,
    justifyContent: 'center', // Centers child elements vertically
    alignItems: 'center', // Centers child elements horizontally
    alignContent: 'center',
    // position: 'absolute',
    bottom: Platform.OS === 'android' ? '50%' : '50%',
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },

  FloatingIconContent: {
    flexDirection: 'column', // Stacks icon and label vertically
    alignItems: 'center', // Centers content horizontally
    justifyContent: 'center', // Centers content vertically
  },

  FloatingIconLabel: {
    marginTop: 5, // Adds space between the icon and the label
    fontSize: 12, // Adjust font size as needed
    color: colors.white,
    textAlign: 'center',
  },
});
