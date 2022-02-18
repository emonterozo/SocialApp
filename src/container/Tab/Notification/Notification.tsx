import React from 'react';
import {View, Text} from 'react-native';

import {Header} from '../../../component';

interface INotification {
  navigation: any;
}

const Notification = ({navigation}: INotification) => {
  return (
    <View>
      <Header
        title="Notification"
        onMenuPress={() => navigation.openDrawer()}
      />
      <Text>Notification</Text>
    </View>
  );
};

export default Notification;
