import AsyncStorage from '@react-native-async-storage/async-storage';

// Will save user data into async storage
export const setUserData = async (data: any) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem('USER', jsonValue);
  } catch (error) {
    return error;
  }
};

// Will get user data from async storage
export const getUserData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('USER');
    return jsonValue !== null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    return error;
  }
};

//  Will remove user data from async storage
export const removeUserData = async () => {
  try {
    return await AsyncStorage.removeItem('USER');
  } catch (error) {
    return error;
  }
};
