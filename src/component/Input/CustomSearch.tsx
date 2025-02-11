import React from 'react';
import { Pressable, Text, View, StyleSheet, TextInput, TextInputProps, ViewStyle, Platform } from 'react-native';
import { colors } from '../../assets/color';
import { height, width } from '../../assets/string.tsx';
import fonts from '../../assets/fonts';

interface CustomSearchProps extends TextInputProps {
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

const CustomSearch: React.FC<CustomSearchProps> = ({ inputData, style, ...rest }) => {
  return (
    <View style={[styles.inputWrapper, style]}>
      {inputData?.title && (
        <Text style={styles.text}>{inputData.title}</Text>
      )}
      <View style={styles.TextInputStyles}>
        {inputData.FirstIcon && (
          <inputData.FirstIcon height={width / 15} width={width / 15} />
        )}
        <TextInput
          style={inputData.inputValue ? styles.Input : styles.placeholderStyle}
          placeholder={inputData.palceHolderText}
          onChangeText={inputData.changedText}
          autoCorrect={false}
          value={inputData.inputValue}
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

export default CustomSearch;

const styles = StyleSheet.create({
  inputWrapper: {
    width: '100%',
    marginVertical: 15,

  },
  text: {
    fontSize: 14,
    color: colors.textColor,
    fontFamily: fonts.PoppinsRegular,
    lineHeight: 21,
    marginVertical: width / 50,
  },
  TextInputStyles: {
    height: height / 20,
    flexDirection: 'row',
    fontSize: 16,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#000',
    borderColor: colors.inputBorder,
    backgroundColor: colors?.white,
    borderWidth: 1,
    borderRadius: 15,
    // marginBottom: 15,
    // marginVertical: 10,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: Platform.OS === 'android' ? 0.05 : 0.2,
    shadowRadius: 13.97,
    elevation: 21,

  },
  Input: {
    width: '80%',
    fontFamily: fonts.PoppinsMedium,
    fontSize: 14,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    padding: 0,
    color: colors.black,
    paddingHorizontal: 10,

  },
  placeholderStyle: {
    width: '80%',
    fontSize: 14,
    justifyContent: 'center',
    alignItems: 'center',
    color: colors.black,
    borderRadius: 10,
    // paddingHorizontal: 10,

  },
  actionSecondStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '10%',
    paddingHorizontal: 10,

  },
});
