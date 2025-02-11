import React from 'react';
import { Pressable, Text, View, StyleSheet, TextInput } from 'react-native';
import { height, width } from '../../assets/string.tsx';
import { colors } from '../../assets/color';
import fonts from '../../assets/fonts';




const FormInput = ({ inputData, ...rest }) => {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.text}>{inputData.title}</Text>
      <View style={styles.TextInputStyles}>
      {inputData.SecondIcon ? 
        <inputData.FirstIcon height={width / 20} width={width / 20} />
        :
        null
      }
        <TextInput
          style={inputData.inputValue ? styles.Input : styles.placeholderStyle}
          placeholder={inputData.palceHolderText}
          onChangeText={inputData.changedText}
          autoCorrect={false}
          secureTextEntry={!!inputData.isPassword}
          autoCapitalize="none"
          {...rest}
        />
        {inputData.SecondIcon ? (
          <Pressable onPress={inputData.actionSecond}>
            <inputData.SecondIcon height={width / 20} width={width / 20} />
          </Pressable>)
		  :
		  <View/>
        }
      </View>
    </View>
  );
};

export default FormInput;

const styles = StyleSheet.create({
  inputWrapper: {
    width: '100%',
    backgroundColor: 'red'
  },
  text: {
    fontSize: 14,
    color: colors.black,
    fontFamily: fonts.PoppinsRegular,
    lineHeight: 21,
    marginVertical: width / 50,
  },
  TextInputStyles: {
    height: height / 22,
    flexDirection: 'row',
    backgroundColor: colors.greyColorInput,
    fontSize: 16,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#000',
    borderRadius: 5,
    marginBottom: 20,
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
  },
});
