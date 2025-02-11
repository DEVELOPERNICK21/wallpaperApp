import React from 'react';
import {
  Text,
  Pressable,
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
import LinearGradient from 'react-native-linear-gradient';
import fonts from '../assets/fonts/index.js';

// Define the props interface
interface CustomButtonProps {
  buttonData: {
    buttonTitle: string;
    FirstIcon?: React.ComponentType<{height: number; width: number}>;
    SecondIcon?: React.ComponentType<{height: number; width: number}>;
    onPress?: (event: GestureResponderEvent) => void;
  };
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  buttonData,
  style,
  textStyle,
  ...rest
}) => {
  // const theme = useSelector((state: RootState) => state.theme);

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

export default CustomButton;

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 10,
    width: '100%',
    height: height / 16,
    backgroundColor: colors.primaryColor,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: width / 40,
    flexDirection: 'row',
    shadowColor: colors?.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: Platform.OS === 'android' ? 0.9 : 0.33,
    shadowRadius: 20,
    elevation: 50,
  },
  gredientColor: {
    width: '100%',
    height: '100%',
    borderRadius: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: fonts.PoppinsBlack,
    textAlign: 'center',
    fontSize: 18,
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
