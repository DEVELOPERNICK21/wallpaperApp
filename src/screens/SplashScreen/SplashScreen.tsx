import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Animated,
  ImageBackground,
  StatusBar,
  Image,
  Text,
} from 'react-native';
import {height, width} from '../../assets/string.tsx';
import {colors} from '../../assets/color.js';
import images from '../../assets/images/index.js';
import fonts from '../../assets/fonts/index.js';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/reducers/index.ts';

const SplashScreen: React.FC = () => {
  // Create a reference for the animation value
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Define the animation
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1000, // Duration of the animation
      useNativeDriver: true, // Use native driver for performance
    }).start();
  }, [scaleAnim]);

  return (
    <View style={[styles.mainContainer]}>
      <Animated.View style={{transform: [{scale: scaleAnim}]}}>
        <Image source={images.AppLogo} style={styles.appLogoStyle} />
      </Animated.View>
      <Animated.View
        style={[{transform: [{scale: scaleAnim}]}, styles?.bottomLogoView]}>
        <Text style={styles?.textStyle}>Wallpaper</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  splashContainner: {
    ...StyleSheet.absoluteFillObject, // This makes the background cover the whole screen
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors?.black,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors?.primaryColor,
  },
  imageStyle: {
    height: height / 1.2,
    width: width,
    resizeMode: 'cover',
    borderRadius: 10,
    zIndex: -10,
    position: 'absolute',
  },
  textStyle: {
    fontFamily: fonts?.PoppinsSemiBold,
    fontSize: 25,
  },
  appLogoStyle: {
    height: height / 5,
    width: height / 5,
    borderRadius: width,
  },
  bottomLogoView: {
    height: height / 5,
    // width: height / 5,
    position: 'absolute',
    bottom: height / 50,
  },
  bottomLogoStyle: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },
});

export default SplashScreen;
