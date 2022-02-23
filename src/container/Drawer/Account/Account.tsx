import React, { useState, useContext } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Avatar, Button, Portal } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import ImagePicker from "react-native-image-crop-picker";
import { isEqual } from "lodash";
import { updateEmail } from "firebase/auth";
import { updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { auth, db, storage } from "../../../config/firebase";
import GlobalContext from "../../../config/context";
import { Header, CTextInput, UploadDialog } from "../../../component";
import { theme } from "../../../styles/theme";
import { setUserData } from "../../../utils/utils";

interface IAccount {
  navigation: any;
}

const validationSchema = Yup.object({
  firstName: Yup.string()
    .trim()
    .min(2, "Invalid First Name!")
    .required("First Name is required!"),
  lastName: Yup.string()
    .trim()
    .min(2, "Invalid Last Name!")
    .required("Last Name is required!"),
  email: Yup.string().email("Invalid email!").required("Email is required!"),
});

const Account = ({ navigation }: IAccount) => {
  const { authenticatedUser, setAuthenticatedUser } = useContext(GlobalContext);
  const userData = {
    firstName: authenticatedUser.first_name,
    lastName: authenticatedUser.last_name,
    email: authenticatedUser.email,
  };
  const [isFirstNameFocused, setIsFirstNameFocused] = useState(false);
  const [isLastNameFocused, setIsLastNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isUploadDialogVisible, setIsUploadDialogVisible] = useState(false);
  const [imageSource, setImageSource] = useState<string | null>(null);

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

  // will store image
  const storeImage = async (imageSource: any) => {
    const img = await fetch(imageSource);
    const bytes = await img.blob();

    // will store image
    const storageRef = ref(storage, `profile-${authenticatedUser.uid}`);
    return uploadBytes(storageRef, bytes).then(() => {
      // will get URL of the stored image
      return getDownloadURL(storageRef).then((URL) => {
        return URL;
      });
    });
  };

  const submit = async (values: any, formikActions: any) => {
    const userRef = doc(db, "users", authenticatedUser.uid);
    let profileImageURL = authenticatedUser.profile_image_url;

    if (isEqual(userData, values)) {
      if (imageSource) {
        profileImageURL = await storeImage(imageSource);

        updateDoc(userRef, {
          profile_image_url: profileImageURL,
        }).then(() => {
          setAuthenticatedUser({
            ...authenticatedUser,
            profile_image_url: profileImageURL,
          });

          setUserData({
            ...authenticatedUser,
            profile_image_url: profileImageURL,
          });
          navigation.navigate("Home");
          formikActions.setSubmitting(false);
        });
      }
    } else {
      if (imageSource) {
        profileImageURL = await storeImage(imageSource);
      }

      // update email
      updateEmail(auth.currentUser, values.email)
        .then(() => {
          updateDoc(userRef, {
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
            profile_image_url: profileImageURL,
          }).then(() => {
            setAuthenticatedUser({
              ...authenticatedUser,
              first_name: values.firstName,
              last_name: values.lastName,
              email: values.email,
              profile_image_url: profileImageURL,
            });

            setUserData({
              ...authenticatedUser,
              first_name: values.firstName,
              last_name: values.lastName,
              email: values.email,
              profile_image_url: profileImageURL,
            });
            navigation.navigate("Home");
            formikActions.setSubmitting(false);
          });
        })
        .catch((error) => {
          console.log("error", error);
        });
    }
  };
  return (
    <View style={styles.container}>
      <Header title="Account" onMenuPress={() => navigation.openDrawer()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Avatar.Image
          style={styles.avatar}
          size={100}
          source={{
            uri: imageSource
              ? imageSource
              : authenticatedUser.profile_image_url,
          }}
        />
        <View style={styles.buttonContainer}>
          <Button
            style={styles.optionButton}
            mode="outlined"
            uppercase={false}
            onPress={() => setIsUploadDialogVisible(true)}
          >
            Upload Photo
          </Button>
          <Button style={styles.optionButton} mode="outlined" uppercase={false}>
            Change Password
          </Button>
        </View>
        <Formik
          initialValues={userData}
          validationSchema={validationSchema}
          onSubmit={submit}
        >
          {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
            const { firstName, lastName, email } = values;
            return (
              <View>
                <CTextInput
                  label="First Name"
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={handleChange("firstName")}
                  error={errors.firstName}
                  isFocused={isFirstNameFocused}
                  onFocus={() => setIsFirstNameFocused(true)}
                  onBlur={() => setIsFirstNameFocused(false)}
                />
                <CTextInput
                  label="Last Name"
                  placeholder="Last Name"
                  value={lastName}
                  onChangeText={handleChange("lastName")}
                  error={errors.lastName}
                  isFocused={isLastNameFocused}
                  onFocus={() => setIsLastNameFocused(true)}
                  onBlur={() => setIsLastNameFocused(false)}
                />
                <CTextInput
                  label="Email"
                  placeholder="Email"
                  value={email}
                  onChangeText={handleChange("email")}
                  error={errors.email}
                  isFocused={isEmailFocused}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
                <Button
                  mode="contained"
                  style={styles.button}
                  onPress={handleSubmit}
                  loading={isSubmitting}
                >
                  Update Profile
                </Button>
              </View>
            );
          }}
        </Formik>
      </ScrollView>
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
  content: {
    padding: 10,
  },
  avatar: {
    alignSelf: "center",
    marginVertical: 10,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
  },
  optionButton: {
    borderRadius: 25,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 5,
  },
  button: {
    marginTop: 30,
    borderRadius: 25,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    marginHorizontal: 20,
  },
});

export default Account;
