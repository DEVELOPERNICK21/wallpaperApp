import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {colors} from '../../assets/color';

interface InputPopupProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (inputValue: string) => void;
}

const InputPopup: React.FC<InputPopupProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleConfirm = () => {
    onConfirm(inputValue);
    setInputValue(''); // Clear input after confirmation
    onClose();
  };

  const handleCancel = () => {
    setInputValue(''); // Clear input if cancelled
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Passcode"
            placeholderTextColor={colors?.greyColor}
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType="web-search"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.okayButton} onPress={handleConfirm}>
              <Text style={styles.buttonText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: colors?.black,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#d9534f',
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  okayButton: {
    flex: 1,
    backgroundColor: '#5cb85c',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InputPopup;
