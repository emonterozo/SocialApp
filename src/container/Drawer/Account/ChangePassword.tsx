import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import auth from "@react-native-firebase/auth";

import { Header, CTextInput } from "../../../component";
import { theme } from "../../../styles/theme";

const validationSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required!"),
  newPassword: Yup.string()
    .required("New password is required!")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
      "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
    ),
  confirmPassword: Yup.string()
    .required("Current password is required!")
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match"),
});

const ChangePassword = ({ setIsChangePasswordVisible }) => {
  const userData = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  const [isCurrentPasswordFocused, setIsCurrentPasswordFocused] =
    useState(false);
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);

  const [isPasswordSecure, setIsPasswordSecure] = useState({
    currentPassword: true,
    newPassword: true,
    confirmPassword: true,
  });

  const reauthenticate = (currentPassword) => {
    const user = auth().currentUser;
    const cred = auth.EmailAuthProvider.credential(
      user?.email,
      currentPassword
    );
    return user.reauthenticateWithCredential(cred);
  };

  const submit = async (values: any, formikActions: any) => {
    reauthenticate(values.currentPassword)
      .then(() => {
        const user = auth().currentUser;
        user
          ?.updatePassword(values.newPassword)
          .then(() => {
            console.log("response");
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => {
        console.log(err);
      });
    formikActions.setSubmitting(false);
    formikActions.resetForm();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Change Password"
        isBack
        onMenuPress={() => setIsChangePasswordVisible(false)}
      />
      <Formik
        initialValues={userData}
        validationSchema={validationSchema}
        onSubmit={submit}
      >
        {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
          const { currentPassword, newPassword, confirmPassword } = values;
          return (
            <View style={{ padding: 10 }}>
              <CTextInput
                label="Current Password"
                placeholder="Current Password"
                value={currentPassword}
                onChangeText={handleChange("currentPassword")}
                error={errors.currentPassword}
                isFocused={isCurrentPasswordFocused}
                onFocus={() => setIsCurrentPasswordFocused(true)}
                onBlur={() => setIsCurrentPasswordFocused(false)}
                isSecureText={isPasswordSecure.currentPassword}
                right={
                  <TextInput.Icon
                    name={isPasswordSecure.currentPassword ? "eye-off" : "eye"}
                    onPress={() =>
                      setIsPasswordSecure({
                        ...isPasswordSecure,
                        currentPassword: !isPasswordSecure.currentPassword,
                      })
                    }
                  />
                }
              />
              <CTextInput
                label="New Password"
                placeholder="New Password"
                value={newPassword}
                onChangeText={handleChange("newPassword")}
                error={errors.newPassword}
                isFocused={isNewPasswordFocused}
                onFocus={() => setIsNewPasswordFocused(true)}
                onBlur={() => setIsNewPasswordFocused(false)}
                isSecureText={isPasswordSecure.newPassword}
                right={
                  <TextInput.Icon
                    name={isPasswordSecure.newPassword ? "eye-off" : "eye"}
                    onPress={() =>
                      setIsPasswordSecure({
                        ...isPasswordSecure,
                        newPassword: !isPasswordSecure.newPassword,
                      })
                    }
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
                isSecureText={isPasswordSecure.confirmPassword}
                right={
                  <TextInput.Icon
                    name={isPasswordSecure.confirmPassword ? "eye-off" : "eye"}
                    onPress={() =>
                      setIsPasswordSecure({
                        ...isPasswordSecure,
                        confirmPassword: !isPasswordSecure.confirmPassword,
                      })
                    }
                  />
                }
              />
              <Button
                mode="contained"
                style={styles.button}
                onPress={handleSubmit}
                loading={isSubmitting}
              >
                Change Password
              </Button>
            </View>
          );
        }}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  button: {
    marginTop: 30,
    borderRadius: 25,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    marginHorizontal: 20,
  },
});

export default ChangePassword;
