import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeUserData = async (user) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user data', error);
  }
};

export const getUserData = async () => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error retrieving user data', error);
  }
};

export const removeUserData = async () => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (error) {
    console.error('Error removing user data', error);
  }
};
