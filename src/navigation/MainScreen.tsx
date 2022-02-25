import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

const HomeStack = createStackNavigator();
import BottomNavigation from "./BottomNavigation";
import { Post, Comment, Reactors, Chat, People } from "../container/Tab";

const MainScreen = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Main"
        component={BottomNavigation}
        options={() => ({
          headerShown: false,
        })}
      />
      <HomeStack.Screen
        name="Post"
        component={Post}
        options={() => ({
          headerShown: false,
        })}
      />
      <HomeStack.Screen
        name="Comment"
        component={Comment}
        options={() => ({
          headerShown: false,
        })}
      />
      <HomeStack.Screen
        name="Reactors"
        component={Reactors}
        options={() => ({
          headerShown: false,
        })}
      />
      <HomeStack.Screen
        name="Chat"
        component={Chat}
        options={() => ({
          headerShown: false,
          unmountOnBlur: true,
        })}
      />
      <HomeStack.Screen
        name="People"
        component={People}
        options={() => ({
          headerShown: false,
        })}
      />
    </HomeStack.Navigator>
  );
};

export default MainScreen;
