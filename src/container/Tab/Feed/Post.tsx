import React, { useState, useContext } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Appbar, Button, Portal } from 'react-native-paper';
import ImagePicker from 'react-native-image-crop-picker';
import moment from 'moment';
import { setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { ImageRegular } from '../../../assets/svg';
import GlobalContext from '../../../config/context';
import { storage, db } from '../../../config/firebase';
import UploadDialog from './UploadDialog';

interface IPost {
  navigation: any;
}

function Post({ navigation }: IPost) {
  const { authenticatedUser } = useContext(GlobalContext);
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isUploadDialogVisible, setIsUploadDialogVisible] = useState(false);

  const handleOpenCamera = () => {
    ImagePicker.openCamera({
      cropping: true,
      mediaType: 'photo',
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
      mediaType: 'photo',
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
    const date = moment(new Date()).format('YYYY-MM-DD-HH:mm:ss');
    if (imageSource) {
      // convert to bytes
      const img = await fetch(imageSource);
      const bytes = await img.blob();

      const storageRef = ref(storage, `post-${authenticatedUser.uid}-${date}`);
      uploadBytes(storageRef, bytes).then(() => {
        getDownloadURL(storageRef).then((URL) => {
          setDoc(doc(db, 'feed', `post-${authenticatedUser.uid}-${date}`), {
            description,
            photo_url: URL,
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
            userRef: doc(db, `/users/${authenticatedUser.uid}`),
          }).then(() => navigation.navigate('Feed'));
        });
      });
    } else {
      setDoc(doc(db, 'feed', `post-${authenticatedUser.uid}-${date}`), {
        description,
        photo_url: '',
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
        userRef: doc(db, `/users/${authenticatedUser.uid}`),
      }).then(() => navigation.navigate('Feed'));
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
          multiline
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
}

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
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },
});

export default Post;
