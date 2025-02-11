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
} from 'react-native';
import { height } from '../../assets/string.tsx';
import { colors } from '../../assets/color';
import fonts from '../../assets/fonts';

// Define the props interface
interface CustomThinButtonProps {
  buttonTitle: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  loading?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  textStyle?: StyleProp<TextStyle>;
}

const CustomThinButton: React.FC<CustomThinButtonProps> = ({
  buttonTitle,
  style,
  disabled = false,
  loading = false,
  onPress = () => {},
  textStyle,
  ...rest
}) => {
  return (
    <Pressable
      style={[
        styles.buttonContainer,
        { opacity: disabled || loading ? 0.75 : 1 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} size="large" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>
          {buttonTitle}
        </Text>
      )}
    </Pressable>
  );
};

export default CustomThinButton;

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 10,
    width: '100%',
    height: height / 20,
    backgroundColor: colors.primaryColor,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  buttonText: {
    fontFamily: fonts.PoppinsMedium,
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
    color: colors.white,
  },
});
