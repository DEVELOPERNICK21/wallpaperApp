import React from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  TextInput,
  TextInputProps,
  ViewStyle,
  Platform,
} from 'react-native';
import { colors } from '../assets/color';
import { height, width } from '../assets/string.tsx';
import fonts from '../assets/fonts';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/reducers/index.ts';

interface CustomGlassTextInputProps extends TextInputProps {
  inputData: {
    title: string;
    FirstIcon?: React.ComponentType<{ height: number; width: number }>;
    SecondIcon?: React.ComponentType<{ height: number; width: number }>;
    palceHolderText: string;
    inputValue?: string;
    keyboardType?: string;
    changedText: (text: string) => void;
    isPassword?: boolean;
    actionSecond?: () => void;
  };
  style?: ViewStyle;
}

const CustomGlassTextInput: React.FC<CustomGlassTextInputProps> = ({
  inputData,
  style,
  ...rest
}) => {
  const theme = useSelector((state: RootState) => state.theme);

  return (
    <View style={[styles.inputWrapper, style]}>
      {inputData?.title && <Text style={[styles.text, { color: theme.colors.text }]}>{inputData.title}</Text>}
      <View style={styles.TextInputStyles}>
        {inputData.FirstIcon && (
          <inputData.FirstIcon height={width / 15} width={width / 12} />
        )}
        <TextInput
          style={inputData.inputValue ? styles.Input : [styles.placeholderStyle, { color: theme.colors.text }]}
          placeholder={inputData.palceHolderText}
          onChangeText={inputData.changedText}
          autoCorrect={false}
          secureTextEntry={!!inputData.isPassword}
          placeholderTextColor={colors?.palceHolderColor}
          autoCapitalize="none"
          keyboardType={inputData?.keyboardType}
          {...rest}
        />
        {inputData.SecondIcon ? (
          <Pressable
            onPress={inputData.actionSecond}
            style={styles.actionSecondStyle}>
            <inputData.SecondIcon height={width / 20} width={width / 20} />
          </Pressable>
        ) : (
          <View />
        )}
      </View>
    </View>
  );
};

export default CustomGlassTextInput;

const styles = StyleSheet.create({
  inputWrapper: {
    width: '100%',
    marginVertical: 5,
  },
  text: {
    fontSize: 14,
    color: colors.black,
    fontFamily: fonts.PoppinsRegular,
    lineHeight: 21,
    marginVertical: width / 50,
  },
  TextInputStyles: {
    height: height / 16,
    flexDirection: 'row',
    fontSize: 16,
    paddingHorizontal: 10,
    // justifyContent: 'space-between',
    alignItems: 'center',
    color: colors?.black,
    borderRadius: 15,
    backgroundColor: Platform?.OS === 'ios' ? 'rgba(255, 255, 255, 0.5)' : colors?.greyColorMostLight, // Transparent background
    // backgroundColor: colors?.greyColorLight,
    borderWidth: 1,
    borderColor: colors?.lightBorderGlass, // Light border for glass effect
    // justifyContent: 'center',
    shadowColor: colors?.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: Platform.OS === 'android' ? 0.90 : 0.33,
    shadowRadius: 20,
    elevation: 50,
  },
  Input: {
    width: '80%',
    fontFamily: fonts.PoppinsMedium,
    fontSize: 14,
    height: '100%',
    padding: 0,
    color: colors.black,
  },
  placeholderStyle: {
    width: '80%',
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
