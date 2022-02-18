import React, {useContext, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {isEmpty} from 'lodash';

import GlobalContext from '../config/context';
import {Account} from '../container/Drawer';
import Login from '../container/Login/Login';
import Register from '../container/Register/Register';
import MainScreen from './MainScreen';
import CustomDrawer from './CustomDrawer';
import {getUserData} from '../utils/utils';

import {createStackNavigator} from '@react-navigation/stack';
const AuthStack = createStackNavigator();

const AuthScreen = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <AuthStack.Screen
        name="Login"
        component={Login}
        options={{
          headerShown: false,
        }}
      />
      <AuthStack.Screen
        name="Register"
        component={Register}
        options={{
          headerShown: false,
        }}
      />
    </AuthStack.Navigator>
  );
};

import {createDrawerNavigator} from '@react-navigation/drawer';
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      backBehavior="initialRoute"
      drawerContent={props => <CustomDrawer {...props} />}>
      <Drawer.Screen
        name="Home"
        component={MainScreen}
        options={{headerShown: false}}
      />
      <Drawer.Screen
        name="Account"
        component={Account}
        options={{headerShown: false}}
      />
    </Drawer.Navigator>
  );
};

const Navigation = () => {
  const {authenticatedUser, setAuthenticatedUser} = useContext(GlobalContext);

  // will get user details from async storage
  useEffect(() => {
    getUserData().then(user => {
      if (!isEmpty(user)) {
        setAuthenticatedUser(user);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NavigationContainer>
      {isEmpty(authenticatedUser) ? <AuthScreen /> : <DrawerNavigator />}
    </NavigationContainer>
  );
};

export default Navigation;
