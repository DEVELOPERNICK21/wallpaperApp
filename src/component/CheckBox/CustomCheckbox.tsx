import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { width } from '../../assets/string.tsx';
import { colors } from '../../assets/color';

interface CustomCheckboxProps {
  label: string;
  onChange: (isChecked: boolean) => void;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label, onChange }) => {
  const [checked, setChecked] = useState<boolean>(false);

  const toggleCheckbox = () => {
    setChecked(!checked);
    onChange(!checked);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={toggleCheckbox}>
      <View style={[styles.checkbox, checked && styles.checkedCheckbox]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: width/20,
    height: width/20,
    borderWidth: 2,
    borderColor: colors?.checkBox, // Primary color for the border
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderRadius:width /100,
  },
  checkedCheckbox: {
    backgroundColor:  colors?.checkBox, // Primary color for the background when checked
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
  },
});

export default CustomCheckbox;
