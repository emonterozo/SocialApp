import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Avatar, IconButton, Text } from "react-native-paper";
import { collection, query, getDocs, where } from "firebase/firestore";

import { auth, db } from "../../../config/firebase";
import { Header } from "../../../component";

const People = ({ navigation }) => {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("email", "!=", auth?.currentUser?.email)
    );
    getDocs(q).then((querySnapshot) => {
      let peopleHolder = [];
      querySnapshot.forEach((doc) => {
        peopleHolder.push({
          ...doc.data(),
          id: doc.id,
        });
      });

      setPeople(peopleHolder);
    });
  }, []);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <Avatar.Image source={{ uri: item.profile_image_url }} />
        <View style={styles.name}>
          <Text>{`${item.first_name} ${item.last_name}`}</Text>
        </View>
        <IconButton
          icon="message"
          size={30}
          onPress={() => navigation.navigate("Chat", { toUser: item.id })}
        />
      </View>
    );
  };

  return (
    <View>
      <Header title="Find People" onMenuPress={() => navigation.openDrawer()} />
      <FlatList
        contentContainerStyle={people.length <= 0 && styles.empty}
        data={people}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empty: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    flex: 1,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.4,
  },
  name: {
    flex: 2,
    marginHorizontal: 20,
  },
});

export default People;
