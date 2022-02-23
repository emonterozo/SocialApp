import React, { useState } from "react";
import { Provider } from "react-native-paper";

import { theme } from "./src/styles/theme";
import GlobalContext from "./src/config/context";

import { LogBox } from "react-native";
LogBox.ignoreLogs(["Warning: ..."]);
LogBox.ignoreAllLogs();

import Navigation from "./src/navigation/Navigation";
const App = () => {
  const [authenticatedUser, setAuthenticatedUser] = useState({});

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
