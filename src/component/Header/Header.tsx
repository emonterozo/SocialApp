import React from 'react';
import {Appbar} from 'react-native-paper';

interface IHeader {
  title: String;
  onMenuPress: any;
}

const Header = ({title, onMenuPress}: IHeader) => {
  return (
    <Appbar.Header>
      <Appbar.Action icon="menu" onPress={onMenuPress} />
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
};

export default Header;
