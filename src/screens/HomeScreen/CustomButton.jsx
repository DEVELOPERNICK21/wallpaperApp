/* eslint-disable prettier/prettier */
import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {height} from '../../assets/string';
import {colors} from '../../assets/color';
import fonts from '../../assets/fonts';

const CustomButton = ({
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
        {opacity: disabled || loading ? 0.75 : 1},
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={colors.white} size={'large'} />
      ) : (
        <Text style={[styles.buttonText, textStyle]} {...rest}>
          {buttonTitle}
        </Text>
      )}
    </Pressable>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 10,
    width: '100%',
    height: height / 16,
    backgroundColor: colors?.primaryColor,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  buttonText: {
    fontFamily: fonts?.primaryColor,
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
    color: colors.white,
  },
});
