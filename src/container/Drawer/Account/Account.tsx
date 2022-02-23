import React from "react";
import { View, Text } from "react-native";

import { Header } from "../../../component";

interface IAccount {
  navigation: any;
}

const Account = ({ navigation }: IAccount) => {
  return (
    <View>
      <Header title="Account" onMenuPress={() => navigation.openDrawer()} />
      <Text>Account</Text>
    </View>
  );
};

export default Account;
