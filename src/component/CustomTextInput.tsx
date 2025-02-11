import React from 'react';
import { Pressable, Text, View, StyleSheet, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { colors } from '../assets/color';
import { height, width } from '../assets/string.tsx';
import fonts from '../assets/fonts';

interface CustomTextInputProps extends TextInputProps {
  inputData: {
    title: string;
    FirstIcon?: React.ComponentType<{ height: number, width: number }>;
    SecondIcon?: React.ComponentType<{ height: number, width: number }>;
    palceHolderText: string;
    inputValue?: string;
    changedText: (text: string) => void;
    isPassword?: boolean;
    actionSecond?: () => void;
  };
  style?: ViewStyle;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({ inputData, style, ...rest }) => {
  return (
    <View style={[styles.inputWrapper, style]}>
      {inputData?.title && (
        <Text style={styles.text}>{inputData.title}</Text>
      )}
      <View style={styles.TextInputStyles}>
        {inputData.FirstIcon && (
          <inputData.FirstIcon height={width / 20} width={width / 20} />
        )}
        <TextInput
          style={inputData.inputValue ? styles.Input : styles.placeholderStyle}
          placeholder={inputData.palceHolderText}
          onChangeText={inputData.changedText}
          autoCorrect={false}
          secureTextEntry={!!inputData.isPassword}
          placeholderTextColor={colors?.palceHolderColor}
          autoCapitalize="none"
          {...rest}
        />
        {inputData.SecondIcon ? (
          <Pressable onPress={inputData.actionSecond} style={styles.actionSecondStyle}>
            <inputData.SecondIcon height={width / 20} width={width / 20} />
          </Pressable>
        ) : (
          <View />
        )}
      </View>
    </View>
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
  inputWrapper: {
    width: '100%',
    marginVertical: 5,
  },
  text: {
    fontSize: 14,
    color: colors.textColor,
    fontFamily: fonts.PoppinsRegular,
    lineHeight: 21,
    marginVertical: width / 50,
  },
  TextInputStyles: {
    height: height / 16,
    flexDirection: 'row',
    fontSize: 16,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#000',
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    // marginBottom: 15,
    // marginVertical: 10,
    shadowColor: 'rgba(0, 110, 233, 0.02)',
    elevation: 8,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 20,
    shadowOpacity: 0.25,
  },
  Input: {
    width: '85%',
    fontFamily: fonts.PoppinsMedium,
    fontSize: 14,
    height: '100%',
    padding: 0,
    color: colors.black,
  },
  placeholderStyle: {
    width: '85%',
    fontSize: 14,
    justifyContent: 'center',
    alignItems: 'center',
    color: colors.black,
    borderRadius: 10,
  },
  actionSecondStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '10%',
  },
});
