import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, Avatar, Caption, Title } from "react-native-paper";
import moment from "moment";
import firestore from "@react-native-firebase/firestore";

import { CommentsRegular } from "../../../assets/svg";
import GlobalContext from "../../../config/context";

import { Header } from "../../../component";

interface INotification {
  navigation: any;
}

const Notification = ({ navigation }: INotification) => {
  const { authenticatedUser } = useContext(GlobalContext);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const subscriber = firestore()
      .collection("notifications")
      .onSnapshot(async (documentSnapshot) => {
        let notificationsData: any[] = [];

        documentSnapshot.forEach((doc) => {
          notificationsData.push(doc.data());
        });

        // will get information of the commentator
        let notifDataHolder: any[] = [];
        await Promise.all(
          notificationsData.map(async (item) => {
            let userData = await firestore()
              .collection("users")
              .doc(item.comment_from)
              .get();
            let feedData = await firestore()
              .collection("users")
              .doc(item.feed_id)
              .get();

            notifDataHolder.push({
              ...item,
              feedInfo: feedData.id,
              user: userData.data(),
            });
          })
        );
        setNotifications(notifDataHolder);
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // will render comment
  const renderNotification = ({ item }: any) => {
    const interval = new Date(item.timestamp.seconds * 1000);
    return (
      <View>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            padding: 5,
          }}
        >
          <View style={{ width: "90%" }}>
            <View style={styles.notification}>
              <Avatar.Image
                size={50}
                source={{ uri: item.user.profile_image_url }}
              />
              <Text style={styles.name}>
                {`${item.user.first_name} ${item.user.last_name}`}{" "}
                <Text>commented to your post.</Text>
              </Text>
            </View>
          </View>
          {!item.is_read && (
            <View
              style={{
                width: "10%",
                alignItems: "center",
              }}
            >
              <View style={styles.circle} />
            </View>
          )}
        </View>
        <Caption style={styles.time}>{moment(interval).fromNow()}</Caption>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Notification"
        onMenuPress={() => navigation.openDrawer()}
      />
      <FlatList
        contentContainerStyle={notifications.length <= 0 && styles.empty}
        data={notifications}
        renderItem={renderNotification}
        ListEmptyComponent={
          <View style={{ alignItems: "center" }}>
            <CommentsRegular height={100} width={100} color="#777777" />
            <Title>No comment yet</Title>
            <Caption>Be the first to comment.</Caption>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notification: {
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontWeight: "bold",
    marginLeft: 10,
  },
  time: {
    alignSelf: "flex-end",
    marginHorizontal: 10,
    fontWeight: "bold",
  },
  empty: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    width: 15,
    height: 15,
    borderRadius: 15 / 2,
    backgroundColor: "blue",
  },
});

export default Notification;
