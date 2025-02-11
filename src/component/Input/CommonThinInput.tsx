import React from 'react';
import { Pressable, Text, View, StyleSheet, TextInput, TextInputProps, Platform } from 'react-native';
import { height, width } from '../../assets/string.tsx';
import { colors } from '../../assets/color';
import fonts from '../../assets/fonts';

// Define the types for the `inputData` prop
interface InputData {
  title: string;
  FirstIcon?: React.ComponentType<{ height: number; width: number }>;
  SecondIcon?: React.ComponentType<{ height: number; width: number }>;
  inputValue?: boolean;
  palceHolderText?: string;
  changedText?: (text: string) => void;
  isPassword?: boolean;
  actionSecond?: () => void;
}

// Define the props for `CommonThinInput`
interface CommonThinInputProps extends TextInputProps {
  inputData: InputData;
}

const CommonThinInput: React.FC<CommonThinInputProps> = ({ inputData, ...rest }) => {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.text}>{inputData.title}</Text>
      <View style={styles.TextInputStyles}>
        {inputData.FirstIcon && (
          <inputData.FirstIcon height={width / 20} width={width / 20} />
        )}
        <TextInput
          style={inputData.inputValue ? styles.Input : styles.placeholderStyle}
          placeholder={inputData.palceHolderText}
          onChangeText={inputData.changedText}
          placeholderTextColor={colors?.palceHolderColor}
          autoCorrect={false}
          secureTextEntry={!!inputData.isPassword}
          autoCapitalize="none"
          {...rest}
        />
        {inputData.SecondIcon ? (
          <Pressable onPress={inputData.actionSecond}>
            <inputData.SecondIcon height={width / 20} width={width / 20} />
          </Pressable>
        ) : (
          <View />
        )}
      </View>
    </View>
  );
};

export default CommonThinInput;

const styles = StyleSheet.create({
  inputWrapper: {
    width: '100%',
    // backgroundColor: 'red'
  },
  text: {
    fontSize: 14,
    color: colors.black,
    fontFamily: fonts.PoppinsSemiBold,
    lineHeight: 21,
    marginVertical: width / 100,
  },
  TextInputStyles: {
    height: height / 25,
    flexDirection: 'row',
    // backgroundColor: colors.greyColorInput,
    fontSize: 8,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#000',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: colors?.inputBorder,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: Platform.OS === 'android' ? 0.53 : 0.2,
    shadowRadius: 13.97,
    elevation: 21,
  },
  Input: {
    width: '85%',
    fontFamily: fonts.PoppinsMedium,
    fontSize: 8,
    height: '100%',
    padding: 0,
    color: colors.black,
  },
  placeholderStyle: {
    width: '85%',
    fontSize: 12,
    fontFamily: fonts?.PoppinsRegular,
    justifyContent: 'center',
    alignItems: 'center',
    color: colors.black,
    // backgroundColor: 'red',
  },
});
