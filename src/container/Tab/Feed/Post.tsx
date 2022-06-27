import React, { useState, useContext } from "react";
import { View, StyleSheet, Image } from "react-native";
import { TextInput, Appbar, Button, Portal } from "react-native-paper";
import ImagePicker from "react-native-image-crop-picker";
import moment from "moment";

import storage from "@react-native-firebase/storage";
import firestore from "@react-native-firebase/firestore";

import { ImageRegular } from "../../../assets/svg";
import GlobalContext from "../../../config/context";
import { UploadDialog } from "../../../component";

interface IPost {
  navigation: any;
}

const Post = ({ navigation }: IPost) => {
  const { authenticatedUser } = useContext(GlobalContext);
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isUploadDialogVisible, setIsUploadDialogVisible] = useState(false);

  // will open camera
  const handleOpenCamera = () => {
    ImagePicker.openCamera({
      cropping: true,
      mediaType: "photo",
    })
      .then((image) => {
        setIsUploadDialogVisible(false);
        setImageSource(image.path);
      })
      .catch(() => {
        return false;
      });
  };

  // will open gallery
  const handleOpenGallery = () => {
    ImagePicker.openPicker({
      cropping: true,
      mediaType: "photo",
    })
      .then((image: any) => {
        setIsUploadDialogVisible(false);
        setImageSource(image.path);
      })
      .catch(() => {
        return false;
      });
  };

  const post = async () => {
    const date = moment(new Date()).format("YYYY-MM-DD-HH:mm:ss");
    // has imageSource
    if (imageSource) {
      // will store image
      const storageRef = storage().ref(
        `post1-${authenticatedUser.uid}-${date}`
      );
      const task = storageRef.putFile(imageSource);

      task.on("state_changed", (taskSnapshot) => {
        console.log(
          `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`
        );
      });

      task.then(async () => {
        const url = await storage()
          .ref(`post1-${authenticatedUser.uid}-${date}`)
          .getDownloadURL();

        // will add add new feed
        firestore()
          .collection("feed")
          .doc(`post-${authenticatedUser.uid}-${date}`)
          .set({
            description: description,
            photo_url: url,
            timestamp: new Date(),
            uid: authenticatedUser.uid,
            comments_count: 0,
            reactions_count: 0,
            reaction_code_count: {
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
              6: 0,
            },
            reactions: [],
            //userRef: doc(db, `/users/${authenticatedUser.uid}`),
          })
          .then(() => {
            navigation.navigate("Feed");
          });
      });

      try {
        await task;
      } catch (e) {
        console.error(e);
      }
    } else {
      firestore()
        .collection("feed")
        .doc(`post-${authenticatedUser.uid}-${date}`)
        .set({
          description: description,
          photo_url: "",
          timestamp: new Date(),
          uid: authenticatedUser.uid,
          comments_count: 0,
          reactions_count: 0,
          reaction_code_count: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
          },
          reactions: [],
          //userRef: doc(db, `/users/${authenticatedUser.uid}`),
        })
        .then(() => {
          navigation.navigate("Feed");
        });
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Create a Post" />
        <Appbar.Action icon="upload-outline" onPress={post} />
      </Appbar.Header>
      <View style={styles.container}>
        <TextInput
          style={styles.textInput}
          mode="outlined"
          value={description}
          onChangeText={(text: string) => setDescription(text)}
          multiline={true}
          numberOfLines={100}
        />
      </View>
      <View style={styles.imageContainer}>
        <Button
          style={styles.button}
          mode="contained"
          onPress={() => setIsUploadDialogVisible(true)}
        >
          Add Photo
        </Button>
        <View style={styles.imageContent}>
          {imageSource ? (
            <Image style={styles.image} source={{ uri: imageSource }} />
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ImageRegular height={150} width={150} color="#777777" />
            </View>
          )}
        </View>
      </View>
      <Portal>
        {isUploadDialogVisible && (
          <UploadDialog
            handleHideDialog={() => setIsUploadDialogVisible(false)}
            handleOpenCamera={handleOpenCamera}
            handleOpenGallery={handleOpenGallery}
          />
        )}
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textInput: {
    marginHorizontal: 5,
    marginVertical: 5,
  },
  imageContainer: {
    flex: 2,
  },
  button: {
    marginHorizontal: 5,
  },
  imageContent: {
    flex: 1,
    marginHorizontal: 5,
  },
  image: {
    height: "100%",
    width: "100%",
    resizeMode: "contain",
  },
});

export default Post;
