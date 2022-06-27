import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_KEY } from "../config/config";
import { ASYNC_STORAGE_KEY_USER } from "./constant";

// Will save user data into async storage
export const setUserData = async (data: any) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(ASYNC_STORAGE_KEY_USER, jsonValue);
  } catch (error) {
    return error;
  }
};

// Will get user data from async storage
export const getUserData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(ASYNC_STORAGE_KEY_USER);
    return jsonValue !== null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    return error;
  }
};

//  Will remove user data from async storage
export const removeUserData = async () => {
  try {
    return await AsyncStorage.removeItem(ASYNC_STORAGE_KEY_USER);
  } catch (error) {
    return error;
  }
};

export const sendPushNotification = async (
  to: string,
  title: string,
  body: string
) => {
  const message = {
    to: to,
    notification: {
      title: title,
      body: body,
    },
  };

  let headers = new Headers({
    "Content-Type": "application/json",
    Authorization: "key=" + SERVER_KEY,
  });

  try {
    let response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers,
      body: JSON.stringify(message),
    });
    response = await response.json();
    console.log("response ", response);
  } catch (error) {
    console.log("error ", error);
  }
};
