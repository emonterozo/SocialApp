import React from 'react';
import {View, Text} from 'react-native';

import {Header} from '../../../component';

interface IMessage {
  navigation: any;
}

const Message = ({navigation}: IMessage) => {
  return (
    <View>
      <Header title="Message" onMenuPress={() => navigation.openDrawer()} />
      <Text>Message</Text>
    </View>
  );
};

export default Message;
