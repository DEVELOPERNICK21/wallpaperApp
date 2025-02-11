import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Platform,
  Text,
  Pressable,
} from 'react-native';
import {
  Excel_Icon,
  HamBurger_Icon,
  Notification_Icon,
  Nowifi_Icon,
  Refresh_Icon,
  Wifi_Icon,
} from '../../assets/icons';
import {height, SECRET_KEY, width} from '../../assets/string.tsx';
import {colors} from '../../assets/color';
import fonts from '../../assets/fonts/index.js';
import images from '../../assets/images/index.js';
import {Image} from 'react-native';
import CustomSmallButton from '../Buttons/CustomSmallButton.tsx';
import MyStatusBar from '../StatusBar.jsx';
import {getAuth} from '@react-native-firebase/auth';

const HomeHeader: React.FC = () => {
  const [greet, setgreet] = useState<String>();
  const auth = getAuth();

  useEffect(() => {
    Greet();
  }, []);

  const Greet = () => {
    let myDate = new Date();
    let hrs = myDate.getHours();

    if (hrs < 12) {
      setgreet('Good Morning!');
    } else if (hrs >= 12 && hrs <= 16) {
      setgreet('Good Afternoon!');
    } else if (hrs >= 17 && hrs <= 24) {
      setgreet('Good Evening!');
    }
  };

  let loginButtonData = {
    buttonTitle: 'Check Out',
  };

  const handleSignout = async () => {
    try {
      await auth.signOut();
      // Navigate to login screen
    } catch (error) {
      // Handle error
    }
  };

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.headerContainner}>
        <View style={styles?.upperArea}>
          <HamBurger_Icon height={width / 14} width={width / 14} />
          <Pressable onPress={() => handleSignout()}>
            <Notification_Icon height={width / 14} width={width / 14} />
          </Pressable>
        </View>
        <View style={styles?.upperArea}>
          <View>
            <Text style={styles.textMainHeading}>Mobile Develoeper</Text>
            <Text style={styles?.greetHeading}>Jhon Doe</Text>
          </View>
          <Image source={images.AppLogo} style={styles.userProfile} />
        </View>
      </View>
      <View style={styles?.cardView}>
        <View style={styles?.firstArea}>
          <Text style={styles.loginText}>Login Hours</Text>
          <Text style={styles.timeText}>
            <Text style={styles.purpleText}>06:34</Text> / 09:00h
          </Text>
        </View>
        <View style={styles?.secondArea}>
          <View>
            <Text style={[styles.timeText, {color: colors?.primaryColor}]}>
              Check In
            </Text>
            <Text style={[styles.hourText, , {color: colors?.primaryColor}]}>
              09:00
            </Text>
          </View>
          <View style={styles?.verticalLine} />
          <View>
            <Text style={styles.timeText}>Check Out</Text>
            <Text style={styles.hourText}>09:00</Text>
          </View>
          <CustomSmallButton
            buttonData={loginButtonData}
            style={{width: '35%'}}
          />
        </View>
        <View style={styles.dashedLine} />;
        <View style={styles?.thirdArea}>
          <Text style={styles.timeText}>Tomorrow Shift: General Shift</Text>
          <Text style={styles.timeText}>09:30 to 19:30</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    width: '100%',
    height: height / 3,
    shadowColor: colors.black,
    // backgroundColor: 'pink',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    alignItems: 'center',
  },
  headerContainner: {
    width: '100%',
    height: height / 4,
    // justifyContent: 'space-around',
    backgroundColor: colors?.primaryColor,
    paddingHorizontal: width / 20,
    // paddingHorizontal: width / 20,
  },
  upperArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: 'red',
    height: '30%',
  },
  firstArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: 'red',
    height: '30%',
  },
  secondArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: 'red',
    height: '50%',
  },
  dashedLine: {
    borderWidth: 0.8,
    borderColor: colors.greyText, // Color of the dashed line
    borderStyle: 'dashed',
    width: '100%', // Adjust the width as needed
    height: 1, // Thickness of the line
    // marginVertical: 10, // Spacing around the line
  },
  thirdArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: 'red',
    height: '20%',
  },

  textMainHeading: {
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
    paddingHorizontal: 5,
    color: colors?.white,
  },
  greetHeading: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fonts.PoppinsSemiBold,
    paddingHorizontal: 5,
  },
  userProfile: {
    height: width / 9,
    width: width / 9,
    borderRadius: width,
    borderWidth: 1,
    borderColor: colors?.white,
  },
  cardView: {
    backgroundColor: colors?.white,
    height: '50%',
    width: '90%',
    // marginHorizontal: width / 20,
    position: 'absolute',
    borderRadius: 10,
    paddingVertical: width / 45,
    paddingHorizontal: width / 35,
    bottom: '5%',
    shadowColor: colors?.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: Platform.OS === 'android' ? 0.9 : 0.1,
    shadowRadius: 5,
    elevation: 50,
  },
  loginText: {
    color: colors.black,
    fontSize: 16,
    fontFamily: fonts.PoppinsSemiBold,
  },
  timeText: {
    color: colors.greyText,
    fontSize: 14,
    fontFamily: fonts.PoppinsRegular,
  },
  hourText: {
    color: colors.black,
    fontSize: 14,
    fontFamily: fonts.PoppinsSemiBold,
    paddingVertical: 5,
  },
  purpleText: {
    color: colors.primaryColor,
    fontSize: 16,
    fontFamily: fonts.PoppinsSemiBold,
    // paddingHorizontal: 5,
  },
  verticalLine: {
    backgroundColor: colors.greyText,
    width: '0.2%',
    height: '60%',
  },
});

export default HomeHeader;
