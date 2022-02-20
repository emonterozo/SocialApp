import React, {useState, useEffect, useContext} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {Text, Avatar, Button, Card, Paragraph, Caption} from 'react-native-paper';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';
import moment from 'moment';
import {isEmpty} from 'lodash';

import GlobalContext from '../../../config/context';
import {db} from '../../../config/firebase';
import {Header} from '../../../component';
import {REACTION} from '../../../config/icon';
import {theme} from '../../../styles/theme';

interface IFeed {
  navigation: any;
}

interface IreactionData {
  reactions_count?: number,
  reaction_code_count: Object,
  reactions: any[]
}


const Feed = ({navigation}: IFeed) => {
  const {authenticatedUser} = useContext(GlobalContext);
  const [feed, setFeed] = useState<any[]>([]);
  const [isReactionsVisible, setIsReactionsVisible] = useState<boolean[]>([]);


  useEffect(() => {
    if (feed.length > 0) {
      const status: boolean[] = feed.map(() => false)
      setIsReactionsVisible(status);
    }
  }, [feed])
  

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

  const renderReactions = (item: any) => {
    const {data} = item;
    if (data.reactions_count > 0) {
      const highest = Object
        .entries(data.reaction_code_count)
        .sort(({ 1: a }, { 1: b }) => b - a)
        .slice(0, 2)
        .map((item: any) => {
          if (item[1] > 0) {
            return item[0]
          }
        });
      return (
        <>
          {
            highest[0] &&
            <Avatar.Image
              style={{backgroundColor: 'transparent'}}
              source={REACTION[parseInt(highest[0])]}
              size={26}
            />
          }
          {
            highest[1] &&
            <Avatar.Image
            style={{backgroundColor: 'transparent'}}
            source={REACTION[parseInt(highest[1])]}
            size={26}
          />
          }
        </>
      );
    }
  };

  const renderReactors = (item: any) => {
    const {data} = item;
  
    if (data.reactions_count > 0) {
      if (data.reactions_count > 2) {
        return (
          <Caption style={styles.reactors}>{`${data.reactions[0].name}, ${data.reactions[1].name} and ${data.reactions_count - 2} more reacted to this post`}</Caption>
        )
      } else if (data.reactions_count < 2) {
        return (
          <Caption style={styles.reactors}>{`${data.reactions[0].name} reacted to this post`}</Caption>
        )
      } else {
        return (
          <Caption style={styles.reactors}>{`${data.reactions[0].name}, ${data.reactions[1].name} reacted to this post`}</Caption>
        )
      }
    }
  };

  const renderImage = (item: any) => {
    return <Card.Cover source={{uri: item.photo_url}} />;
  };

  const toggleReaction = (code: number, item: any, index: number) => {
    const {id, data} = item

    const items = [...isReactionsVisible]
    items[index] = false;
    setIsReactionsVisible(items)

    const filter = data.reactions.filter((item: any) => item.user_id === authenticatedUser.uid)

    let reactionData: IreactionData = {
      reactions_count: 0,
      reaction_code_count: {},
      reactions: []
    }

    if (filter.length > 0) {
      if (filter[0].reaction_code == code) {
        console.log('unreact')
        reactionData = {
          reactions_count: data.reactions_count - 1,
          reaction_code_count: {
            ...data.reaction_code_count,
            [code]: data.reaction_code_count[code] - 1
          },
          reactions: data.reactions.filter((item: any) => item.user_id !== authenticatedUser.uid)
        }
      } else {
        // will update reaction_code_count
        data.reaction_code_count[parseInt(filter[0].reaction_code)] = data.reaction_code_count[parseInt(filter[0].reaction_code)] - 1;
        data.reaction_code_count[code] = data.reaction_code_count[code] + 1;

        // will update reaction_code
        const objIndex = data.reactions.findIndex(((obj: any) => obj.user_id == authenticatedUser.uid));
        data.reactions[objIndex].reaction_code = code
        
        reactionData = {
          reaction_code_count: data.reaction_code_count,
          reactions: data.reactions
        }
      }
    } else {
      reactionData = {
        reactions_count: data.reactions_count + 1,
        reaction_code_count: {
          ...data.reaction_code_count,
          [code]: data.reaction_code_count[code] + 1
        },
        reactions: [
          ...data.reactions,
          {
            name: authenticatedUser.displayName,
            profile_image_url: authenticatedUser.photoURL,
            reaction_code: code,
            user_id: authenticatedUser.uid,
          }
        ]
      }
    }

    const feedRef = doc(db, 'feed', id);
    updateDoc(feedRef, reactionData).then(() => console.log('success'));
  };

  const handlePressLike = (item: any, index: number) => {
    const {id, data} = item

    const items = [...isReactionsVisible]
    items[index] = false;
    setIsReactionsVisible(items)

    const filter = data.reactions.filter((item: any) => item.user_id === authenticatedUser.uid)

    let reactionData: IreactionData = {
      reactions_count: 0,
      reaction_code_count: {},
      reactions: []
    }

    if (filter.length > 0) {
      reactionData = {
        reactions_count: data.reactions_count - 1,
        reaction_code_count: {
          ...data.reaction_code_count,
          [filter[0].reaction_code]: data.reaction_code_count[filter[0].reaction_code] - 1
        },
        reactions: data.reactions.filter((item: any) => item.user_id !== authenticatedUser.uid)
      }
    } else {
      reactionData = {
        reactions_count: data.reactions_count + 1,
        reaction_code_count: {
          ...data.reaction_code_count,
          [1]: data.reaction_code_count[1] + 1
        },
        reactions: [
          ...data.reactions,
          {
            name: authenticatedUser.displayName,
            profile_image_url: authenticatedUser.photoURL,
            reaction_code: 1,
            user_id: authenticatedUser.uid,
          }
        ]
      }
    }

    const feedRef = doc(db, 'feed', id);
    updateDoc(feedRef, reactionData).then(() => console.log('success'));
  }

  const renderCard = ({item, index}: any) => {
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
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            {renderReactions(item)}
            {renderReactors(item)}
            {
              isReactionsVisible[index] &&
              <View style={styles.reactionContent}>
                <View style={styles.reactionContainer}>
                  <Avatar.Image
                    style={styles.reaction}
                    source={REACTION[1]}
                    size={30}
                    onTouchEnd={() => toggleReaction(1, item, index)}
                  />
                  <Avatar.Image
                    style={styles.reaction}
                    source={REACTION[2]}
                    size={30}
                    onTouchEnd={() => toggleReaction(2, item, index)}
                  />
                  <Avatar.Image
                    style={styles.reaction}
                    source={REACTION[3]}
                    size={30}
                    onTouchEnd={() => toggleReaction(3, item, index)}
                  />
                  <Avatar.Image
                    style={styles.reaction}
                    source={REACTION[4]}
                    size={30}
                    onTouchEnd={() => toggleReaction(4, item, index)}
                  />
                  <Avatar.Image
                    style={styles.reaction}
                    source={REACTION[5]}
                    size={30}
                    onTouchEnd={() => toggleReaction(5, item, index)}
                  />
                  <Avatar.Image
                    style={styles.reaction}
                    source={REACTION[6]}
                    size={30}
                    onTouchEnd={() => toggleReaction(6, item, index)}
                  />
                </View>
              </View>
            }
          </View>
        </View>
        <Card.Actions style={styles.action}>
          <Button icon="thumb-up-outline"
            onPress={() => handlePressLike(item, index)}
            onLongPress={() => {
              const items = [...isReactionsVisible]
              items[index] = !isReactionsVisible[index];
              setIsReactionsVisible(items)
            }}
          >Like</Button>
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
    flex: 1,
    justifyContent: 'space-around',
  },
  reactors: {
    marginLeft: 5,
    flex: 1,
    lineHeight: 13,
  },
  reactionContent: {
    width: '100%',
    position: 'absolute',
    backgroundColor: 'gray',
    justifyContent: 'center',
    borderRadius: 25,
  },
  reactionContainer: {
    flex: 1,
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  reaction: {
    backgroundColor: 'transparent',
    marginHorizontal: 3,
  }
});

export default Feed;
