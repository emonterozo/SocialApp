import React, {useEffect, useState, useContext} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {
  Text,
  TextInput,
  Appbar,
  Portal,
  Avatar,
  Paragraph,
  Caption,
} from 'react-native-paper';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  doc,
} from 'firebase/firestore';
import moment from 'moment';
import {isEmpty} from 'lodash';

import {db} from '../../../config/firebase';
import GlobalContext from '../../../config/context';

interface IComment {
  navigation: any;
  route: any;
}

const Comment = ({navigation, route}: IComment) => {
  const {authenticatedUser} = useContext(GlobalContext);
  const {collectionId} = route.params;
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');

  const setComment = () => {
    const date = moment(new Date()).format('YYYY-MM-DD-HH:mm:ss');
    setDoc(
      doc(
        db,
        `feed/${collectionId}/comments`,
        `comment-${authenticatedUser.uid}-${date}`,
      ),
      {
        comment: text,
        name: authenticatedUser.displayName,
        profile_image_url: authenticatedUser.photoURL,
        timestamp: new Date(),
        user_id: authenticatedUser.uid,
      },
    ).then(() => setText(''));
  };

  useEffect(() => {
    const qry = query(
      collection(db, `feed/${collectionId}/comments`),
      orderBy('timestamp', 'asc'),
    );
    onSnapshot(qry, querySnapshot => {
      let commentsData: any[] = [];
      querySnapshot.forEach(docu => {
        commentsData.push(docu.data());
      });
      setComments(commentsData);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderComment = ({item}: any) => {
    const interval = new Date(item.timestamp.seconds * 1000);
    return (
      <View>
        <View style={styles.comment}>
          <Avatar.Image size={30} source={{uri: item.profile_image_url}} />
          <View style={styles.messageContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <Paragraph>{item.comment}</Paragraph>
          </View>
        </View>
        <Caption style={styles.time}>{moment(interval).fromNow()}</Caption>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Portal>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Comments" />
        </Appbar.Header>
      </Portal>
      <View style={styles.top}>
        <View style={styles.topContent}>
          <FlatList data={comments} renderItem={renderComment} />
        </View>
      </View>
      <View style={styles.bottom}>
        <TextInput
          mode="outlined"
          placeholder="Write a comment"
          value={text}
          onChangeText={val => setText(val)}
          onSubmitEditing={() => console.log('sub')}
          right={
            !isEmpty(text) && (
              <TextInput.Icon name="send" onPress={setComment} />
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
    height: '90%',
  },
  topContent: {
    marginTop: 60,
    marginHorizontal: 5,
  },
  bottom: {
    height: '10%',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  comment: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  messageContainer: {
    flex: 1,
    borderRadius: 15,
    borderColor: 'blue',
    borderWidth: 1,
    padding: 10,
    marginLeft: 5,
  },
  name: {
    fontWeight: 'bold',
  },
  time: {
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    fontWeight: 'bold',
  },
});

export default Comment;
