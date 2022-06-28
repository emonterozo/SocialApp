import React, {
  useState,
  useLayoutEffect,
  useCallback,
  useContext,
} from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { xor, isEqual } from "lodash";

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import GlobalContext from "../../../config/context";
import { Header } from "../../../component";

const Chat = ({ route, navigation }) => {
  const { authenticatedUser } = useContext(GlobalContext);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(
    route.params?.conversationId
  );
  const [toUser, setToUser] = useState(route.params?.toUser);

  useLayoutEffect(() => {
    if (conversationId) {
      const subscriber = firestore()
        .collection(`messages/${conversationId}/chats`)
        .orderBy("timestamp", "desc")
        .onSnapshot(async (documentSnapshot) => {
          let messagesData: any[] = [];

          documentSnapshot.forEach((doc) => {
            messagesData.push(doc.data());
          });

          let messagesDataHolder: any[] = [];
          await Promise.all(
            messagesData.map(async (item, i) => {
              const userData = await firestore()
                .collection("users")
                .doc(item.user)
                .get();
              messagesDataHolder.push({
                _id: i,
                createdAt: item.timestamp.toDate(),
                text: item.message,
                user: {
                  _id: userData.data().email,
                  name: `${userData.data().first_name} ${
                    userData.data().last_name
                  }`,
                  avatar: userData.data().profile_image_url,
                },
              });
            })
          );

          const data = messagesDataHolder.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });

          setMessages(data);
        });

      // Stop listening for updates when no longer required
      return () => subscriber();
    } else {
      firestore()
        .collection("messages")
        .get()
        .then((querySnapshot) => {
          let messagesData = [];
          querySnapshot.forEach((doc) => {
            if (
              isEqual(
                doc.data().conversation_between.sort(),
                [toUser, auth().currentUser?.uid].sort()
              )
            ) {
              messagesData.push({
                ...doc.data(),
                id: doc.id,
              });
            }
          });

          //console.log("messagesDatadsdsadas", messagesData);
          if (messagesData.length > 0) {
            setConversationId(messagesData[0].id);
          }
        });
    }
  });

  const onSend = useCallback(
    (messages = []) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );
      const { _id, createdAt, text, user } = messages[0];
      console.log("conversationIdtobe", conversationId);
      if (conversationId) {
        console.log("reply to  message");
        firestore()
          .collection(`messages/${conversationId}/chats`)
          .add({
            user: auth().currentUser?.uid,
            message: text,
            timestamp: createdAt,
          })
          .then(() => {
            firestore().collection("messages").doc(conversationId).update({
              timestamp: createdAt,
              last_message: text,
            });
          });
      } else {
        if (toUser) {
          console.log("new message");
          firestore()
            .collection("messages")
            .add({
              from: auth().currentUser?.uid,
              to: toUser,
              timestamp: createdAt,
              last_message: text,
              conversation_between: [auth().currentUser?.uid, toUser],
            })
            .then((dofRef) => {
              setConversationId(dofRef.id);
              setToUser(undefined);
              firestore().collection(`messages/${dofRef.id}/chats`).add({
                user: auth().currentUser?.uid,
                message: text,
                timestamp: createdAt,
              });
            });
        }
      }
    },
    [conversationId, toUser]
  );

  return (
    <>
      <Header title="Message" onMenuPress={() => navigation.openDrawer()} />
      <GiftedChat
        messages={messages}
        showAvatarForEveryMessage={true}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: auth().currentUser?.email,
          avatar: authenticatedUser.profile_image_url,
        }}
      />
    </>
  );
};

export default Chat;
