import React, {useState, useEffect, useContext} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {Text, Avatar, Button, Card, Paragraph} from 'react-native-paper';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import moment from 'moment';
import {isEmpty} from 'lodash';

import GlobalContext from '../../../config/context';
import {db} from '../../../config/firebase';

import {Header} from '../../../component';

interface IFeed {
  navigation: any;
}


const Feed = ({navigation}: IFeed) => {
  const {authenticatedUser} = useContext(GlobalContext);
  const [feed, setFeed] = useState<any[]>([]);
  const [reactions, setReactions] = useState<any[] | null>([]);

  useEffect(() => {
    const qry = query(collection(db, 'feed'), orderBy('timestamp', 'desc'));
    onSnapshot(qry, querySnapshot => {
      let feedData: any[] = [];
      querySnapshot.forEach(doc => {
        feedData.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setFeed(feedData);
    });
  }, []);

  const renderComments = async (item: any) => {
    const feedCol = collection(db, `feed/${item.id}/reactions`);
    const qry = query(feedCol);
    const gc = await getDocs(qry);
    const d = gc.docs.map(docu => docu.data());
    console.log('ddd', d);
    return (
      <Avatar.Image
        style={{backgroundColor: 'transparent'}}
        source={require('../../../assets/reactions/like.png')}
        size={26}
      />
    );
  };

  const renderImage = (item: any) => {
    return <Card.Cover source={{uri: item.photo_url}} />;
  };

  const renderCard = ({item}: any) => {
    const {id, data} = item;
    const interval = new Date(data.timestamp.seconds * 1000);

    return (
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.cardHeader}>
            <Avatar.Image source={{uri: data.profile_image_url}} size={40} />
            <View style={styles.info}>
              <Text>{data.name}</Text>
              <Text>{moment(interval).fromNow()}</Text>
            </View>
          </View>
          <Paragraph style={styles.paragraph}>{data.description}</Paragraph>
        </Card.Content>
        {!isEmpty(data.photo_url) && renderImage(data)}
        <View style={styles.bottom}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {renderComments(item)}
            {/*<Avatar.Image
              style={{backgroundColor: 'transparent'}}
              source={require('../../../assets/reactions/like.png')}
              size={26}
            />
            <Avatar.Image
              style={{backgroundColor: 'transparent'}}
              source={require('../../../assets/reactions/heart.png')}
              size={26}
            />
            <Avatar.Image
              style={{backgroundColor: 'transparent'}}
              source={require('../../../assets/reactions/laugh.png')}
              size={26}
            />
            <Avatar.Image
              style={{backgroundColor: 'transparent'}}
              source={require('../../../assets/reactions/sad.png')}
              size={26}
            />
            <Avatar.Image
              style={{backgroundColor: 'transparent'}}
              source={require('../../../assets/reactions/angry.png')}
              size={26}
            />*/}
          </View>
        </View>
        <Card.Actions style={styles.action}>
          <Button icon="thumb-up-outline">Like</Button>
          <Button
            icon="comment-outline"
            onPress={() => navigation.navigate('Comment', {collectionId: id})}>
            Comment
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Feed" onMenuPress={() => navigation.openDrawer()} />
      <View style={styles.header}>
        <Avatar.Image source={{uri: authenticatedUser.photoURL}} size={40} />
        <Button
          mode="outlined"
          uppercase={false}
          style={styles.postButton}
          onPress={() => navigation.navigate('Post')}>
          What's on your mind?
        </Button>
      </View>
      <FlatList data={feed} renderItem={renderCard} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  postButton: {
    marginHorizontal: 5,
    flex: 1,
    borderRadius: 25,
    borderColor: 'gray',
  },
  card: {
    margin: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    paddingHorizontal: 10,
  },
  paragraph: {
    marginVertical: 10,
  },
  bottom: {
    paddingVertical: 5,
    borderBottomWidth: 0.2,
    borderBottomColor: 'gray',
    marginHorizontal: 10,
    marginTop: 5,
    justifyContent: 'center',
  },
  action: {
    justifyContent: 'space-around',
  },
});

export default Feed;
