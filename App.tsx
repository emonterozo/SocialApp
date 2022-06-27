import React, { useEffect, useState } from "react";
import { Provider } from "react-native-paper";
import messaging from "@react-native-firebase/messaging";

import { theme } from "./src/styles/theme";
import GlobalContext from "./src/config/context";

import { LogBox } from "react-native";
LogBox.ignoreLogs(["Warning: ..."]);
LogBox.ignoreAllLogs();

import Navigation from "./src/navigation/Navigation";
const App = () => {
  const [authenticatedUser, setAuthenticatedUser] = useState({});

  useEffect(() => {
    // will get message in foreground state
    messaging().onMessage(async (remoteMessage) => {
      console.log("A new FCM message arrived!", JSON.stringify(remoteMessage));
    });

    // when FCM open while the app is in background state
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log("onNotificationOpenedApp: ", JSON.stringify(remoteMessage));
    });

    // when FCM open while the app is in quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "Notification caused app to open from quit state:",
            JSON.stringify(remoteMessage)
          );
        }
      });
  }, []);

  const initialContext = {
    authenticatedUser,
    setAuthenticatedUser,
  };

  return (
    <GlobalContext.Provider value={initialContext}>
      <Provider theme={theme}>
        <Navigation />
      </Provider>
    </GlobalContext.Provider>
  );
};

export default App;
