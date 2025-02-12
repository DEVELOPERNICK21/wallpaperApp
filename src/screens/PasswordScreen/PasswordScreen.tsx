import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const FIRST_PASSWORD = '331122';
const SECOND_PASSWORD = '123456';

const PasswordScreen = ({onUnlock}) => {
  const [password, setPassword] = useState('');

  const handleUnlock = () => {
    if (password === FIRST_PASSWORD) {
      onUnlock('chat'); // Navigate to Chat Stack
    } else if (password === SECOND_PASSWORD) {
      onUnlock('wallpaper'); // Navigate to Wallpaper Stack
    } else {
      alert('Incorrect Password');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Enter password"
        placeholderTextColor="#999"
      />
      <TouchableOpacity style={styles.button} onPress={handleUnlock}>
        <Text style={styles.buttonText}>Unlock</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  title: {fontSize: 24, fontWeight: 'bold', marginBottom: 20},
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 18,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {color: 'white', fontSize: 18, fontWeight: 'bold'},
});

export default PasswordScreen;
