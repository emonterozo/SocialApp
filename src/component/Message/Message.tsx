import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface IMessage {
  icon: string;
  iconColor: string;
  message: string;
  messageColor: string;
}

function Message({ icon, iconColor, message, messageColor }: IMessage) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} color={iconColor} size={18} />
      <Text style={styles.error} theme={{ colors: { text: messageColor } }}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  error: {
    marginLeft: 5,
  },
});

export default Message;
