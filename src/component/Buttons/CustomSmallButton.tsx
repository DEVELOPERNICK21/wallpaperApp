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
import {height, width} from '../../assets/string.tsx';
import {colors} from '../../assets/color';
import fonts from '../../assets/fonts';

// Define the props interface
interface CustomSmallButtonProps {
  buttonData: {
    buttonTitle: string;
    FirstIcon?: React.ComponentType<{height: number; width: number}>;
    SecondIcon?: React.ComponentType<{height: number; width: number}>;
    onPress?: (event: GestureResponderEvent) => void;
  };
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const CustomSmallButton: React.FC<CustomSmallButtonProps> = ({
  buttonData,
  style,
  textStyle,
  ...rest
}) => {
  return (
    <Pressable
      style={[styles.buttonContainer, style]}
      onPress={buttonData?.onPress}
      {...rest}>
      <View style={[styles.gredientColor]}>
        <Text style={[styles.buttonText, textStyle]}>
          {buttonData?.buttonTitle}
        </Text>
      </View>
    </Pressable>
  );
};

export default CustomSmallButton;

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 10,
    width: '100%',
    height: height / 26,
    backgroundColor: colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: width / 60,
    flexDirection: 'row',
  },
  gredientColor: {
    width: '100%',
    height: '100%',
    borderRadius: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: fonts.PoppinsMedium,
    textAlign: 'center',
    fontSize: 15,
    color: colors.white,
  },
  iconFirst: {
    position: 'absolute',
    left: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '10%',
  },
});
