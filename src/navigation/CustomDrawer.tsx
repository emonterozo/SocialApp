import React, {useContext} from 'react';
import {SafeAreaView, StyleSheet, ImageBackground, View} from 'react-native';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {Button, Divider, Text} from 'react-native-paper';

import GlobalContext from '../config/context';
import {removeUserData} from '../utils/utils';

const CustomDrawer = (props: any) => {
  const {authenticatedUser, setAuthenticatedUser} = useContext(GlobalContext);
  const {state, navigation} = props;

  const renderDrawer = () => {
    return state.routes.map((route: any, index: any) => {
      return (
        <DrawerItem
          key={index}
          label={route.name}
          onPress={() => navigation.navigate(route.name)}
          activeTintColor="blue"
        />
      );
    });
  };

  const logout = () => {
    removeUserData();
    setAuthenticatedUser({});
  };
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{uri: 'https://picsum.photos/700'}}
        style={styles.banner}>
        <View style={styles.subheader}>
          <Text style={styles.subheadertText}>
            {`${authenticatedUser.first_name} ${authenticatedUser.last_name}`}
          </Text>
        </View>
      </ImageBackground>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawer}>
        {renderDrawer()}
        <Divider style={styles.divider} />
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            icon="logout"
            style={styles.button}
            onPress={logout}>
            Logout
          </Button>
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subContainer: {
    padding: 5,
    marginTop: 2,
    marginHorizontal: 5,
  },
  banner: {
    resizeMode: 'cover',
    width: '100%',
    height: 200,
  },
  subheader: {
    backgroundColor: 'red',
    padding: 16,
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 0,
  },
  subheadertText: {
    color: '#ffffff',
  },
  divider: {
    borderWidth: 0.3,
    margin: 5,
    borderColor: 'gray',
  },
  drawer: {
    flex: 1,
    paddingTop: 0,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  button: {
    marginBottom: 50,
    marginHorizontal: 10,
  },
});

export default CustomDrawer;
