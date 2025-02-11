import React from 'react';
import {
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  View,
  Platform,
} from 'react-native';
import {height, width} from '../assets/string.tsx';
import {colors} from '../assets/color';
import fonts from '../assets/fonts';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/reducers/index.ts';

// Define the props interface
interface MainScanButton {
  buttonData: {
    buttonTitle: string;
    FirstIcon?: React.ComponentType<{height: number; width: number}>;
    SecondIcon?: React.ComponentType<{height: number; width: number}>;
    onPress?: (event: GestureResponderEvent) => void;
  };
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const MainScanButton: React.FC<MainScanButton> = ({
  buttonData,
  style,
  textStyle,
  ...rest
}) => {
  const theme = useSelector((state: RootState) => state.theme);

  return (
    <Pressable
      style={[styles.buttonContainer, style]}
      onPress={buttonData?.onPress}
      {...rest}>
      <>
        {buttonData?.FirstIcon && (
          <View style={styles?.iconFirst}>
            <buttonData.FirstIcon height={height / 40} width={height / 40} />
          </View>
        )}
        <View style={styles?.FirstBracketView}>
          <View style={styles?.oneBracket} />
          <View style={styles?.twoBracket} />
        </View>
        <Text style={[styles.buttonText, textStyle]}>
          {buttonData?.buttonTitle}
        </Text>
        <View style={styles?.FirstBracketView}>
          <View style={styles?.thirdBracket} />
          <View style={styles?.fourthBracket} />
        </View>
      </>
    </Pressable>
  );
};

export default MainScanButton;

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 10,
    width: '100%',
    height: height / 12,
    backgroundColor: colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    // iOS Shadow Properties
    ...(Platform.OS === 'ios' && {
      shadowColor: colors?.black,
      shadowOffset: {width: 0, height: 10},
      shadowOpacity: 0.33,
      shadowRadius: 20,
    }),
    // Android Shadow using elevation
    elevation: Platform.OS === 'android' ? 5 : 0,
  },
  buttonText: {
    fontFamily: fonts.PoppinsSemiBold,
    textAlign: 'center',
    fontSize: 20,
    color: colors.white,
  },
  iconFirst: {
    position: 'absolute',
    left: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '10%',
  },
  FirstBracketView: {
    // backgroundColor: 'yellow',
    height: '65%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: width / 30,
  },
  oneBracket: {
    height: 15,
    width: 15,
    borderTopLeftRadius: 6,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors?.primaryColor,
  },
  twoBracket: {
    height: 15,
    width: 15,
    borderBottomLeftRadius: 6,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors?.primaryColor,
  },
  thirdBracket: {
    height: 15,
    width: 15,
    borderTopRightRadius: 6,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors?.primaryColorOne,
  },
  fourthBracket: {
    height: 15,
    width: 15,
    borderBottomRightRadius: 6,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors?.primaryColorOne,
  },
});
