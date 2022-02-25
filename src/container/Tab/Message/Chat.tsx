import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useContext,
} from "react";
import { TouchableRipple, Text } from "react-native-paper";
import { GiftedChat } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  setDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

import GlobalContext from "../../../config/context";
import { auth, db } from "../../../config/firebase";
import { Header } from "../../../component";

const Chat = ({ route }) => {
  const { authenticatedUser } = useContext(GlobalContext);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(
    route.params?.conversationId
  );
  const [toUser, setToUser] = useState(route.params?.toUser);

  useLayoutEffect(() => {
    console.log(toUser);
    const collectionRef = collection(db, `messages/${conversationId}/chats`);
    const q = query(collectionRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      let messagesData: any[] = [];

      querySnapshot.forEach((doc) => {
        messagesData.push(doc.data());
      });

      let messagesDataHolder: any[] = [];
      await Promise.all(
        messagesData.map(async (item, i) => {
          let user = await getDoc(item.userRef);
          messagesDataHolder.push({
            _id: i,
            createdAt: item.timestamp.toDate(),
            text: item.message,
            user: {
              _id: user.data().email,
              name: user.data().email,
              avatar: user.data().profile_image_url,
            },
          });
        })
      );

      const data = messagesDataHolder.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setMessages(data);
    });

    return unsubscribe;
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
        addDoc(collection(db, `messages/${conversationId}/chats`), {
          userRef: doc(db, `/users/${auth?.currentUser?.uid}`),
          message: text,
          timestamp: createdAt,
        }).then(() => {
          updateDoc(doc(db, "messages", conversationId), {
            timestamp: createdAt,
            last_message: text,
          });
        });
      } else {
        if (toUser) {
          console.log("new message");
          addDoc(collection(db, "messages"), {
            from: doc(db, `/users/${auth?.currentUser?.uid}`),
            to: doc(db, `/users/${toUser}`),
            timestamp: createdAt,
            last_message: text,
            conversation_between: [auth?.currentUser?.uid, toUser],
          }).then((dofRef) => {
            setConversationId(dofRef.id);
            setToUser(undefined);
            addDoc(collection(db, `messages/${dofRef.id}/chats`), {
              userRef: doc(db, `/users/${auth?.currentUser?.uid}`),
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
    <GiftedChat
      messages={messages}
      showAvatarForEveryMessage={true}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: auth?.currentUser?.email,
        avatar: authenticatedUser.profile_image_url,
      }}
    />
  );
};

export default Chat;
