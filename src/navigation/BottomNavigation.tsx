import React from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { Feed, Message, Notification } from "../container/Tab/index";

const Tab = createMaterialBottomTabNavigator();

interface IIcons {
  Feed: String;
  Message: String;
  Notification: String;
}

const BottomNavigation = () => {
  return (
    <Tab.Navigator
      barStyle={styles.bottomTab}
      activeColor="blue"
      inactiveColor="gray"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          const icons: IIcons = {
            Feed: "newspaper-variant-outline",
            Message: "message",
            Notification: "bell",
          };
          return (
            <MaterialCommunityIcons
              name={icons[route.name]}
              color={color}
              size={20}
            />
          );
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Feed" component={Feed} />
      <Tab.Screen name="Message" component={Message} />
      {/*<Tab.Screen name="Notification" component={Notification} />*/}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  bottomTab: {
    backgroundColor: "white",
    height: 60,
  },
});

export default BottomNavigation;
