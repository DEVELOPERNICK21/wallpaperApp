import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {OnBoardingData} from './OnBoardingData';
import {colors} from '../../assets/color';
import fonts from '../../assets/fonts';
import ScreenConstants from '../../Routes/ScreenConstants';
import {ArrowWhite_Icon} from '../../assets/icons';
import {height, width} from '../../assets/string.tsx';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/reducers/index.ts';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {storeAppLaunchState} from '../../redux/actions/appState.ts';

interface OnBoardingItem {
  id: number;
  Icon: React.ComponentType<{height: number; width: number}>;
  Heading: string;
  SubHeading: string;
}

const OnBoarding: React.FC = () => {
  const flatListRef = useRef<FlatList<OnBoardingItem>>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigation = useNavigation();
  const theme = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch();

  // Set the flag in AsyncStorage when the onboarding is complete
  const setOnboardingComplete = async () => {
    try {
      dispatch(storeAppLaunchState(false));
    } catch (error) {
      console.log('Checking the launch:', error);
    }
  };

  const ButtonData = {
    Title: OnBoardingData.length - 1 === currentSlide ? 'GET STARTED' : 'NEXT',
    onClick: () => {
      if (currentSlide === 3) {
        navigation.navigate(ScreenConstants.LOGIN_SCREEN as never);
        setOnboardingComplete();
      } else {
        handleNextPress();
      }
    },
  };

  const handleNextPress = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({index: currentSlide + 1});
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
      }, 300); // Adjust the delay if necessary
    }
  };

  const handleSkipPress = async () => {
    navigation.navigate(ScreenConstants.LOGIN_SCREEN as never);
    dispatch(storeAppLaunchState(false));
  };
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const currentIndex = event.nativeEvent.contentOffset.x / slideWidth;
    setCurrentSlide(Math.floor(currentIndex));
  };

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Define the animation
    // checkAllAsyncStorageValues();
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1000, // Duration of the animation
      useNativeDriver: true, // Use native driver for performance
    }).start();
  }, [scaleAnim]);

  // Pulse animation for the button/icon
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Define the pulse animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1, // Scale up
          duration: 2500, // Duration of the scaling up
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1, // Scale down to normal
          duration: 1500, // Duration of the scaling down
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  return (
    <View
      style={[
        styles.OnBoardingWrapper,
        {backgroundColor: theme.colors.background},
      ]}>
      <View style={styles.FlatListWrapper}>
        <FlatList
          horizontal
          ref={flatListRef}
          showsHorizontalScrollIndicator={false}
          data={OnBoardingData}
          pagingEnabled
          renderItem={({item}) => (
            <View style={styles.ContentWrapper}>
              {/* <FastImage
                  source={item.Icon}
                  resizeMode={FastImage.resizeMode.contain}
                  style={styles?.gifStyle}
                /> */}
              <Animated.View style={[{transform: [{scale: pulseAnim}]}]}>
                <item.Icon height={height / 2.5} width={width / 1.5} />
              </Animated.View>

              <View style={styles.TextWrap}>
                <Text style={styles.HeadingStyle}>{item.Heading}</Text>
                <Text
                  style={[styles.SubHeadingStyle, {color: theme.colors.text}]}>
                  {item.SubHeading}
                </Text>
              </View>
            </View>
          )}
          keyExtractor={item => item.id.toString()}
          onScroll={handleScroll}
        />
      </View>
      <View style={styles.PaginatorArea}>
        {currentSlide === 3 ? null : (
          <Pressable style={styles.crossStyle} onPress={handleSkipPress}>
            <Text style={[styles.skipText, {color: theme.colors.text}]}>
              Skip
            </Text>
          </Pressable>
        )}
        {OnBoardingData.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.InactiveDot,
              index === currentSlide && styles.ActiveDot,
            ]}
          />
        ))}

        {/* <FastImage
          style={{width: 200, height: 200}}
          source={require(images?.QRScanGif)}
          // resizeMode={FastImage.resizeMode.contain}
        /> */}

        <Pressable style={styles.FloatArrow} onPress={ButtonData.onClick}>
          <ArrowWhite_Icon height={width / 14} width={width / 14} />
        </Pressable>
      </View>
    </View>
  );
};
export default OnBoarding;

const styles = StyleSheet.create({
  OnBoardingWrapper: {
    backgroundColor: colors.white,
    height: height,
  },
  FlatListWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: height / 1.35,
  },
  ContentWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    textAlign: 'center',
    marginTop: width / 5,
  },
  // gifView: {
  //   height: height / 2.5,
  //   width: width / 2,
  //   // resizeMode: 'contain',
  // },
  // gifStyle: {
  //   height: height / 2.5,
  //   width: width / 2,
  //   // resizeMode: 'contain',
  // },
  TextWrap: {
    width: '90%',
    textAlign: 'center',
    // flex: 1,
  },
  HeadingStyle: {
    color: colors.primaryColor,
    fontFamily: fonts.PoppinsBold,
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 10,
  },
  SubHeadingStyle: {
    color: colors.black,
    fontFamily: fonts.PoppinsRegular,
    fontSize: 14,
    textAlign: 'center',
  },
  skipText: {
    color: colors.black,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 14,
    textAlign: 'center',
  },
  PaginatorArea: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    height: height - height / 1.2,
    width: width,
  },
  InactiveDot: {
    backgroundColor: colors.greyColor,
    height: width / 40,
    width: width / 40,
    borderRadius: 10,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ActiveDot: {
    backgroundColor: colors.primaryColor,
    height: width / 40,
    width: width / 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossStyle: {
    position: 'absolute',
    left: width / 20,
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vecttorView: {
    backgroundColor: colors?.white,
    borderRadius: height,
    height: height / 2.5,
    width: height / 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  FloatArrow: {
    backgroundColor: colors.primaryColor,
    position: 'absolute',
    height: width / 8,
    width: width / 8,
    right: width / 20,
    borderRadius: width,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
});
