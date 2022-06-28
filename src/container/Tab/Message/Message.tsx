import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
  Avatar,
  Caption,
  Paragraph,
  Subheading,
  TouchableRipple,
  FAB,
  Title,
} from "react-native-paper";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import moment from "moment";

import { CommentsRegular } from "../../../assets/svg";
import { Header } from "../../../component";
import { theme } from "../../../styles/theme";

interface IMessage {
  navigation: any;
}

const Message = ({ navigation }: IMessage) => {
  const [conversation, setConversation] = useState([]);

  useEffect(() => {
    const subscriber = firestore()
      .collection("messages")
      .where("conversation_between", "array-contains", auth().currentUser?.uid)
      .onSnapshot(async (querySnapshot) => {
        let messagesData: any[] = [];

        querySnapshot.forEach((doc) => {
          messagesData.push({
            ...doc.data(),
            id: doc.id,
          });
        });

        // will get information of the commentator
        let messageDataHolder: any[] = [];
        await Promise.all(
          messagesData.map(async (item) => {
            const fromUser = await firestore()
              .collection("users")
              .doc(item.from)
              .get();

            const toUser = await firestore()
              .collection("users")
              .doc(item.to)
              .get();

            messageDataHolder.push({
              ...item,
              fromUser: fromUser.data(),
              toUser: toUser.data(),
            });
          })
        );

        setConversation(messageDataHolder);
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, []);

  const renderCard = ({ item }: any) => {
    const { fromUser, toUser, last_message, timestamp } = item;
    const interval = new Date(timestamp.seconds * 1000);

    const messageDetails =
      auth()?.currentUser?.email === fromUser.email ? toUser : fromUser;

    return (
      <TouchableRipple
        onPress={() => navigation.navigate("Chat", { conversationId: item.id })}
      >
        <View style={styles.card}>
          <Avatar.Image source={{ uri: messageDetails.profile_image_url }} />
          <View style={styles.message}>
            <Subheading
              style={styles.name}
            >{`${messageDetails.first_name} ${messageDetails.last_name}`}</Subheading>
            <Paragraph numberOfLines={1}>{last_message}</Paragraph>
          </View>
          <View style={styles.time}>
            <Caption>{moment(interval).fromNow()}</Caption>
          </View>
        </View>
      </TouchableRipple>
    );
  };
  return (
    <View style={styles.container}>
      <Header title="Message" onMenuPress={() => navigation.openDrawer()} />
      <FlatList
        contentContainerStyle={conversation.length <= 0 && styles.empty}
        data={conversation}
        renderItem={renderCard}
        ListEmptyComponent={
          <View style={{ alignItems: "center" }}>
            <CommentsRegular height={100} width={100} color="#777777" />
            <Title>No messages yet.</Title>
            <Caption>Looks like you haven't initiated a conversation</Caption>
          </View>
        }
      />
      <FAB
        style={styles.fab}
        icon="message"
        onPress={() => navigation.navigate("People")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 10,
  },
  name: {
    fontWeight: "bold",
  },
  message: {
    flex: 2,
    marginHorizontal: 20,
  },
  time: {
    flex: 1,
  },
  empty: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 25,
    bottom: 25,
    backgroundColor: theme.colors.primary,
  },
});

export default Message;
