import React from 'react';
import { Appbar } from 'react-native-paper';

interface IHeader {
  title: string;
  onMenuPress: any;
}

function Header({ title, onMenuPress }: IHeader) {
  return (
    <Appbar.Header>
      <Appbar.Action icon="menu" onPress={onMenuPress} />
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}

export default Header;
