import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
  Text,
  Avatar,
  Button,
  Card,
  Paragraph,
  Caption,
  Title,
  TouchableRipple,
} from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import moment from "moment";
import { isEmpty } from "lodash";

import { NewsPaperRegular } from "../../../assets/svg";
import GlobalContext from "../../../config/context";
import { Header } from "../../../component";
import { REACTION } from "../../../config/icon";
import { REACTION_CODE } from "../../../utils/constant";

interface IFeed {
  navigation: any;
}

interface IreactionData {
  reactions_count?: number;
  reaction_code_count: Object;
  reactions: any[];
}

const Feed = ({ navigation }: IFeed) => {
  const { authenticatedUser } = useContext(GlobalContext);
  const [feed, setFeed] = useState<any[]>([]);
  const [isReactionsVisible, setIsReactionsVisible] = useState<boolean[]>([]);

  useEffect(() => {
    if (feed.length > 0) {
      const status: boolean[] = feed.map(() => false);
      setIsReactionsVisible(status);
    }
  }, [feed]);

  useEffect(() => {
    const subscriber = firestore()
      .collection("feed")
      .orderBy("timestamp", "desc")
      .onSnapshot(async (documentSnapshot) => {
        let feedData: any[] = [];

        documentSnapshot.forEach((doc) => {
          feedData.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        let feedDataHolder: any[] = [];
        await Promise.all(
          feedData.map(async (item) => {
            let reactedBy: any = [];

            // will get information of the reactor's
            if (item.data.reactions.length > 0) {
              await Promise.all(
                item.data.reactions.map(async (item) => {
                  const userData = await firestore()
                    .collection("users")
                    .doc(item.uid)
                    .get();

                  reactedBy.push({
                    ...userData.data(),
                    ...item,
                  });
                })
              );
            }

            // will get information of the user who created the feed
            let userData = await firestore()
              .collection("users")
              .doc(item.data.uid)
              .get();
            feedDataHolder.push({
              ...item,
              reactedBy: reactedBy,
              user: userData.data(),
            });
          })
        );

        setFeed(feedDataHolder);
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, []);

  // will render reactions icon - top 2 highest
  const renderReactions = (item: any) => {
    const { data } = item;
    if (data.reactions_count > 0) {
      const highest = Object.entries(data.reaction_code_count)
        .sort(({ 1: a }, { 1: b }) => b - a)
        .slice(0, 2)
        .map((item: any) => {
          if (item[1] > 0) {
            return item[0];
          }
        });
      return (
        <>
          {highest[0] && (
            <Avatar.Image
              style={{ backgroundColor: "transparent" }}
              source={REACTION[parseInt(highest[0])]}
              size={26}
            />
          )}
          {highest[1] && (
            <Avatar.Image
              style={{ backgroundColor: "transparent" }}
              source={REACTION[parseInt(highest[1])]}
              size={26}
            />
          )}
        </>
      );
    }
  };

  // will render reactor's name
  const renderReactors = (item: any) => {
    const { data, reactedBy } = item;

    if (data.reactions_count > 0) {
      if (data.reactions_count > 2) {
        return (
          <Caption style={styles.reactors}>{`${reactedBy[0].first_name}, ${
            reactedBy[1].first_name
          } and ${
            data.reactions_count - 2
          } more reacted to this post`}</Caption>
        );
      } else if (data.reactions_count < 2) {
        return (
          <Caption
            style={styles.reactors}
          >{`${reactedBy[0].first_name} ${reactedBy[0].last_name} reacted to this post`}</Caption>
        );
      } else {
        return (
          <Caption
            style={styles.reactors}
          >{`${reactedBy[0].first_name} ${reactedBy[0].last_name}, ${reactedBy[1].first_name} ${reactedBy[1].last_name} reacted to this post`}</Caption>
        );
      }
    }
  };

  // will render image of the feed
  const renderImage = (item: any) => {
    return <Card.Cover source={{ uri: item.photo_url }} />;
  };

  // will toggle reaction
  const toggleReaction = (code: number, item: any, index: number) => {
    const { id, data } = item;

    // will hide reactions selection
    const items = [...isReactionsVisible];
    items[index] = false;
    setIsReactionsVisible(items);

    const filter = data.reactions.filter(
      (item: any) => item.uid === authenticatedUser.uid
    );

    let reactionData: IreactionData = {
      reactions_count: 0,
      reaction_code_count: {},
      reactions: [],
    };

    // user already reacted to the feed
    if (filter.length > 0) {
      // same reaction code
      if (filter[0].reaction_code == code) {
        // will remove the reaction
        reactionData = {
          reactions_count: data.reactions_count - 1,
          reaction_code_count: {
            ...data.reaction_code_count,
            [code]: data.reaction_code_count[code] - 1,
          },
          reactions: data.reactions.filter(
            (item: any) => item.uid !== authenticatedUser.uid
          ),
        };
      } else {
        // will update reaction_code_count
        data.reaction_code_count[parseInt(filter[0].reaction_code)] =
          data.reaction_code_count[parseInt(filter[0].reaction_code)] - 1;
        data.reaction_code_count[code] = data.reaction_code_count[code] + 1;

        // will update reaction_code
        const objIndex = data.reactions.findIndex(
          (obj: any) => obj.uid == authenticatedUser.uid
        );
        data.reactions[objIndex].reaction_code = code;

        reactionData = {
          reaction_code_count: data.reaction_code_count,
          reactions: data.reactions,
        };
      }
    } else {
      // will add new reaction
      reactionData = {
        reactions_count: data.reactions_count + 1,
        reaction_code_count: {
          ...data.reaction_code_count,
          [code]: data.reaction_code_count[code] + 1,
        },
        reactions: [
          ...data.reactions,
          {
            reaction_code: code,
            uid: authenticatedUser.uid,
          },
        ],
      };
    }

    firestore()
      .collection("feed")
      .doc(id)
      .update(reactionData)
      .then(() => {
        console.log("success");
      });
  };

  // will toggle reaction
  const handlePressLike = (item: any, index: number) => {
    const { id, data } = item;

    const items = [...isReactionsVisible];
    items[index] = false;
    setIsReactionsVisible(items);

    const filter = data.reactions.filter(
      (item: any) => item.uid === authenticatedUser.uid
    );

    let reactionData: IreactionData = {
      reactions_count: 0,
      reaction_code_count: {},
      reactions: [],
    };

    if (filter.length > 0) {
      reactionData = {
        reactions_count: data.reactions_count - 1,
        reaction_code_count: {
          ...data.reaction_code_count,
          [filter[0].reaction_code]:
            data.reaction_code_count[filter[0].reaction_code] - 1,
        },
        reactions: data.reactions.filter(
          (item: any) => item.uid !== authenticatedUser.uid
        ),
      };
    } else {
      reactionData = {
        reactions_count: data.reactions_count + 1,
        reaction_code_count: {
          ...data.reaction_code_count,
          [1]: data.reaction_code_count[1] + 1,
        },
        reactions: [
          ...data.reactions,
          {
            reaction_code: 1,
            uid: authenticatedUser.uid,
          },
        ],
      };
    }

    firestore()
      .collection("feed")
      .doc(id)
      .update(reactionData)
      .then(() => {
        console.log("success");
      });
  };

  // will render like button data
  const renderLikeButton = (item: any, value: string) => {
    const { data } = item;

    // has reactions
    if (data.reactions.length > 0) {
      const filter = data.reactions.filter(
        (item: any) => item.uid === authenticatedUser.uid
      );
      if (value === "icon") {
        if (filter.length > 0) {
          // will display reaction icon
          return REACTION_CODE.icon[filter[0].reaction_code];
        } else {
          // will display default icon
          return "thumb-up-outline";
        }
      } else {
        if (filter.length > 0) {
          // will display reaction label
          return REACTION_CODE.label[filter[0].reaction_code];
        } else {
          // will display default label
          return "Like";
        }
      }
    } else {
      // will render default icon and label
      if (value === "icon") {
        return "thumb-up-outline";
      } else {
        return "Like";
      }
    }
  };

  // will render feed details
  const renderCard = ({ item, index }: any) => {
    const { id, data, user } = item;
    const interval = new Date(data.timestamp.seconds * 1000);

    return (
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.cardHeader}>
            <Avatar.Image source={{ uri: user.profile_image_url }} size={40} />
            <View style={styles.info}>
              <Text>{`${user.first_name} ${user.last_name}`}</Text>
              <Text>{moment(interval).fromNow()}</Text>
            </View>
          </View>
          <Paragraph style={styles.paragraph}>{data.description}</Paragraph>
        </Card.Content>
        {!isEmpty(data.photo_url) && renderImage(data)}
        <View style={styles.bottom}>
          {data.comments_count > 0 && (
            <Caption
              style={styles.commentCount}
            >{`${data.comments_count} comments`}</Caption>
          )}
          <TouchableRipple
            onPress={() =>
              navigation.navigate("Reactors", { reactedBy: item.reactedBy })
            }
          >
            <View style={styles.reactionOption}>
              {renderReactions(item)}
              {renderReactors(item)}
            </View>
          </TouchableRipple>
          {isReactionsVisible[index] && (
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
          )}
        </View>
        <Card.Actions style={styles.action}>
          <Button
            icon={renderLikeButton(item, "icon")}
            onPress={() => handlePressLike(item, index)}
            onLongPress={() => {
              const items = [...isReactionsVisible];
              items[index] = !isReactionsVisible[index];
              setIsReactionsVisible(items);
            }}
          >
            {renderLikeButton(item, "label")}
          </Button>
          <Button
            icon="comment-outline"
            onPress={() =>
              navigation.navigate("Comment", {
                collectionId: id,
                post_by: data.uid,
              })
            }
          >
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
        <Avatar.Image
          source={{ uri: authenticatedUser.profile_image_url }}
          size={40}
        />
        <Button
          mode="outlined"
          uppercase={false}
          style={styles.postButton}
          onPress={() => navigation.navigate("Post")}
        >
          What's on your mind?
        </Button>
      </View>
      <FlatList
        contentContainerStyle={feed.length <= 0 && styles.empty}
        data={feed}
        renderItem={renderCard}
        ListEmptyComponent={
          <View style={{ alignItems: "center" }}>
            <NewsPaperRegular height={50} width={50} color="#777777" />
            <Title>No post available.</Title>
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
  header: {
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  postButton: {
    marginHorizontal: 5,
    flex: 1,
    borderRadius: 25,
    borderColor: "gray",
  },
  card: {
    margin: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
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
    borderBottomColor: "gray",
    marginHorizontal: 10,
    marginTop: 5,
    justifyContent: "center",
  },
  action: {
    flex: 1,
    justifyContent: "space-around",
  },
  reactors: {
    marginLeft: 5,
    flex: 1,
    lineHeight: 13,
  },
  reactionContent: {
    width: "100%",
    position: "absolute",
    backgroundColor: "gray",
    justifyContent: "center",
    borderRadius: 25,
  },
  reactionContainer: {
    flex: 1,
    justifyContent: "space-around",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  reaction: {
    backgroundColor: "transparent",
    marginHorizontal: 3,
  },
  empty: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  reactionOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  commentCount: {
    alignSelf: "flex-end",
  },
});

export default Feed;
