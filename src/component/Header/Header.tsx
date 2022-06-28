import React from "react";
import { Appbar } from "react-native-paper";

interface IHeader {
  title: string;
  onMenuPress: any;
  isBack?: boolean;
}

const Header = ({ title, onMenuPress, isBack }: IHeader) => {
  return (
    <Appbar.Header>
      <Appbar.Action
        icon={isBack ? "arrow-left" : "menu"}
        onPress={onMenuPress}
      />
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
};

export default Header;
