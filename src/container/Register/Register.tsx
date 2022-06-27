import React, { useState, useContext } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import messaging from "@react-native-firebase/messaging";

import GlobalContext from "../../config/context";
import { CTextInput } from "../../component";
import { theme } from "../../styles/theme";
import { ScrollView } from "react-native-gesture-handler";
import { setUserData } from "../../utils/utils";
import { DEFAULT_USER_PROFILE_IMAGE } from "../../utils/constant";

interface IRegister {
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
  password: Yup.string()
    .trim()
    .min(8, "Password is too short!")
    .required("Password is required!"),
  confirmPassword: Yup.string()
    .equals([Yup.ref("password"), null], "Password does not match!")
    .required("Confirm Password is required!"),
});

const Register = ({ navigation }: IRegister) => {
  const { setAuthenticatedUser } = useContext(GlobalContext);
  const userData = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  };
  const [isFirstNameFocused, setIsFirstNameFocused] = useState(false);
  const [isLastNameFocused, setIsLastNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);
  const [isPasswordSecured, setIsPasswordSecured] = useState(true);
  const [isConfirmPasswordSecured, setIsConfirmPasswordSecured] =
    useState(true);

  const register = async (values: any, formikActions: any) => {
    const token = await messaging().getToken();
    auth()
      .createUserWithEmailAndPassword(values.email, values.password)
      .then((response) => {
        firestore()
          .collection("users")
          .doc(response.user.uid)
          .set({
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
            profile_image_url: DEFAULT_USER_PROFILE_IMAGE,
            fcm_token: token,
          })
          .then(() => {
            const userInfo = {
              first_name: values.firstName,
              last_name: values.lastName,
              email: values.email,
              profile_image_url: DEFAULT_USER_PROFILE_IMAGE,
              uid: response.user.uid,
            };
            setAuthenticatedUser(userInfo);
            setUserData(userInfo);
            formikActions.resetForm();
            formikActions.setSubmitting(false);
          });
      })
      .catch((error) => {
        formikActions.setSubmitting(false);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Formik
          initialValues={userData}
          validationSchema={validationSchema}
          onSubmit={register}
        >
          {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
            const { firstName, lastName, email, password, confirmPassword } =
              values;
            return (
              <View style={styles.scrollView}>
                <ScrollView>
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
                  <CTextInput
                    label="Password"
                    placeholder="Password"
                    value={password}
                    onChangeText={handleChange("password")}
                    error={errors.password}
                    isFocused={isPasswordFocused}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    isSecureText={isPasswordSecured}
                    right={
                      <TextInput.Icon
                        name={isPasswordSecured ? "eye-off" : "eye"}
                        color={theme.colors.gray}
                        onPress={() => setIsPasswordSecured(!isPasswordSecured)}
                      />
                    }
                  />
                  <CTextInput
                    label="Confirm Password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={handleChange("confirmPassword")}
                    error={errors.confirmPassword}
                    isFocused={isConfirmPasswordFocused}
                    onFocus={() => setIsConfirmPasswordFocused(true)}
                    onBlur={() => setIsConfirmPasswordFocused(false)}
                    isSecureText={isConfirmPasswordSecured}
                    right={
                      <TextInput.Icon
                        name={isConfirmPasswordSecured ? "eye-off" : "eye"}
                        color={theme.colors.gray}
                        onPress={() =>
                          setIsConfirmPasswordSecured(!isConfirmPasswordSecured)
                        }
                      />
                    }
                  />
                  <Button
                    icon="account-plus-outline"
                    mode="contained"
                    style={styles.button}
                    onPress={handleSubmit}
                    loading={isSubmitting}
                  >
                    Register
                  </Button>
                  <View style={styles.bottom}>
                    <Text>Already have account?</Text>
                    <Button
                      mode="text"
                      uppercase={false}
                      onPress={() => navigation.navigate("Login")}
                    >
                      Login
                    </Button>
                  </View>
                </ScrollView>
              </View>
            );
          }}
        </Formik>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
  },
  scrollView: {
    justifyContent: "center",
  },
  top: {
    flex: 1,
    justifyContent: "center",
  },
  button: {
    marginTop: 30,
  },
  bottom: {
    marginTop: 50,
    alignItems: "center",
  },
});

export default Register;
