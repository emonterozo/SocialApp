import React, { useEffect, useState, useContext } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
  Text,
  TextInput,
  Appbar,
  Avatar,
  Paragraph,
  Caption,
  Title,
} from "react-native-paper";
import moment from "moment";
import { isEmpty } from "lodash";
import firestore from "@react-native-firebase/firestore";

import { CommentsRegular } from "../../../assets/svg";
import GlobalContext from "../../../config/context";
import { sendPushNotification } from "../../../utils/utils";

interface IComment {
  navigation: any;
  route: any;
}

const Comment = ({ navigation, route }: IComment) => {
  const { authenticatedUser } = useContext(GlobalContext);
  const { collectionId, post_by } = route.params;
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");

  // will add new comment
  const addComment = () => {
    const date = moment(new Date()).format("YYYY-MM-DD-HH:mm:ss");
    // will add new comment
    firestore()
      .collection(`feed/${collectionId}/comments`)
      .doc(`comment-${authenticatedUser.uid}-${date}`)
      .set({
        comment: text,
        timestamp: new Date(),
        uid: authenticatedUser.uid,
        //userRef: doc(db, `/users/${authenticatedUser.uid}`),
      })
      .then(() => {
        // will increment comments_count
        firestore()
          .collection("feed")
          .doc(collectionId)
          .update({
            comments_count: firestore.FieldValue.increment(1),
          })
          .then(() => {
            setText("");
            if (authenticatedUser.uid !== post_by) {
              addNotification();
            }
          });
      });
  };

  const addNotification = () => {
    const date = moment(new Date()).format("YYYY-MM-DD-HH:mm:ss");
    firestore()
      .collection("notifications")
      .doc(`notif-${authenticatedUser.uid}-${date}`)
      .set({
        feed_id: collectionId,
        is_read: false,
        comment_from: authenticatedUser.uid,
        timestamp: new Date(),
        post_by: post_by,
      })
      .then(async () => {
        const user = await firestore().collection("users").doc(post_by).get();
        sendPushNotification(
          user.data()?.fcm_token,
          "Post Comment",
          `${authenticatedUser.first_name} ${authenticatedUser.last_name} commented to your post.`
        );
      });
  };

  // will get comment data realtime
  useEffect(() => {
    const subscriber = firestore()
      .collection(`feed/${collectionId}/comments`)
      .onSnapshot(async (documentSnapshot) => {
        let commentsData: any[] = [];

        documentSnapshot.forEach((doc) => {
          commentsData.push(doc.data());
        });

        // will get information of the commentator
        let feedDataHolder: any[] = [];
        await Promise.all(
          commentsData.map(async (item) => {
            const userData = await firestore()
              .collection("users")
              .doc(item.uid)
              .get();
            feedDataHolder.push({
              ...item,
              user: userData.data(),
            });
          })
        );

        setComments(feedDataHolder);
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // will render comment
  const renderComment = ({ item }: any) => {
    const interval = new Date(item.timestamp.seconds * 1000);
    return (
      <View>
        <View style={styles.comment}>
          <Avatar.Image
            size={30}
            source={{ uri: item.user.profile_image_url }}
          />
          <View style={styles.messageContainer}>
            <Text
              style={styles.name}
            >{`${item.user.first_name} ${item.user.last_name}`}</Text>
            <Paragraph>{item.comment}</Paragraph>
          </View>
        </View>
        <Caption style={styles.time}>{moment(interval).fromNow()}</Caption>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Comments" />
      </Appbar.Header>
      <View style={styles.top}>
        <View style={styles.topContent}>
          <FlatList
            contentContainerStyle={comments.length <= 0 && styles.empty}
            data={comments}
            renderItem={renderComment}
            ListEmptyComponent={
              <View style={{ alignItems: "center" }}>
                <CommentsRegular height={100} width={100} color="#777777" />
                <Title>No comment yet</Title>
                <Caption>Be the first to comment.</Caption>
              </View>
            }
          />
        </View>
      </View>
      <View style={styles.bottom}>
        <TextInput
          mode="outlined"
          placeholder="Write a comment"
          value={text}
          onChangeText={(val) => setText(val)}
          right={
            !isEmpty(text) && (
              <TextInput.Icon name="send" onPress={addComment} />
            )
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    flex: 1,
  },
  topContent: {
    marginHorizontal: 5,
  },
  bottom: {
    height: "10%",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  comment: {
    flexDirection: "row",
    marginVertical: 5,
  },
  messageContainer: {
    flex: 1,
    borderRadius: 15,
    borderColor: "blue",
    borderWidth: 1,
    padding: 10,
    marginLeft: 5,
  },
  name: {
    fontWeight: "bold",
  },
  time: {
    alignSelf: "flex-end",
    paddingHorizontal: 10,
    fontWeight: "bold",
  },
  empty: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Comment;
