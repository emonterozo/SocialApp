import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Subheading, Appbar, Avatar, Caption } from "react-native-paper";

import { REACTION } from "../../../config/icon";

const Reactors = ({ navigation, route }) => {
  const { reactedBy } = route.params;
  const [reactions, setReactions] = useState([]);
  const [filteredReaction, setFilteredReactions] = useState([]);
  const [selection, setSelection] = useState(0);

  useEffect(() => {
    if (reactedBy.length > 0) {
      const res = {};
      reactedBy.map((obj) => {
        const key = obj.reaction_code;
        if (!res[key]) {
          res[key] = { reactionCode: obj.reaction_code, count: 0 };
        }
        res[key].count += 1;
      });
      setReactions(Object.values(res));
    }
  }, [reactedBy]);

  useEffect(() => {
    if (selection !== 0) {
      let data = [];
      reactedBy.map((item) => {
        if (item.reaction_code === selection) {
          data.push(item);
        }
      });
      setFilteredReactions(data);
    } else {
      setFilteredReactions(reactedBy);
    }
  }, [selection]);

  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.card}>
        <View>
          <Avatar.Image source={{ uri: item.profile_image_url }} />
          <Avatar.Image
            style={styles.reaction}
            size={30}
            source={REACTION[item.reaction_code]}
          />
        </View>
        <Subheading style={styles.name}>
          {`${item.first_name} ${item.last_name}`}
        </Subheading>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="People who reacted" />
      </Appbar.Header>
      <View style={styles.header}>
        {reactions.length > 1 && (
          <View style={styles.content}>
            <Avatar.Image
              style={styles.icon}
              size={30}
              source={require("../../../assets/all.png")}
              onTouchEnd={() => setSelection(0)}
            />
            <Caption>{reactedBy.length}</Caption>
          </View>
        )}

        {reactions.map((item, i) => (
          <View key={i} style={styles.content}>
            <Avatar.Image
              style={styles.icon}
              size={30}
              source={REACTION[item.reactionCode]}
              onTouchEnd={() => setSelection(item.reactionCode)}
            />
            <Caption>{item.count}</Caption>
          </View>
        ))}
      </View>
      <FlatList
        data={filteredReaction}
        extraData={reactions}
        keyExtractor={(item, index) => item.uid}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 0.5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
  },
  icon: {
    marginHorizontal: 10,
    backgroundColor: "transparent",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  reaction: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  name: {
    fontWeight: "bold",
    marginHorizontal: 10,
  },
});

export default Reactors;
