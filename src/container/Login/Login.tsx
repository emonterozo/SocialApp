import React, {useState, useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import {TextInput, Button, Text} from 'react-native-paper';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {isEmpty} from 'lodash';

import GlobalContext from '../../config/context';
import {auth, db} from '../../config/firebase';
import {CTextInput, Message} from '../../component';
import {theme} from '../../styles/theme';
import {setUserData} from '../../utils/utils';

interface ILogin {
  navigation: any;
}

const Login = ({navigation}: ILogin) => {
  const {setAuthenticatedUser} = useContext(GlobalContext);
  const [user, setUser] = useState({
    email: '',
    password: '',
  });
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isSecured, setIsSecured] = useState(true);
  const [error, setError] = useState('');

  const login = () => {
    signInWithEmailAndPassword(auth, user.email, user.password)
      .then(response => {
        setAuthenticatedUser(response.user);
        setUserData(response.user);
      })
      .catch(error => {
        setError('Invalid Credentials');
        console.log('error', error);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.message}>
          {!isEmpty(error) && (
            <Message
              icon="alert-circle-outline"
              iconColor="red"
              message={error}
              messageColor="red"
            />
          )}
        </View>
        <CTextInput
          label="Email"
          placeholder="Email"
          value={user.email}
          onChangeText={text =>
            setUser({
              ...user,
              email: text,
            })
          }
          isFocused={isEmailFocused}
          onFocus={() => setIsEmailFocused(true)}
          onBlur={() => setIsEmailFocused(false)}
        />
        <CTextInput
          label="Password"
          placeholder="Password"
          value={user.password}
          onChangeText={text =>
            setUser({
              ...user,
              password: text,
            })
          }
          isFocused={isPasswordFocused}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
          isSecureText={isSecured}
          right={
            <TextInput.Icon
              name={isSecured ? 'eye-off' : 'eye'}
              color={theme.colors.gray}
              onPress={() => setIsSecured(!isSecured)}
            />
          }
        />
        <Button
          icon="login"
          mode="contained"
          disabled={
            isEmpty(user.email) || isEmpty(user.password) ? true : false
          }
          style={styles.button}
          onPress={login}>
          Login
        </Button>
        <View style={styles.bottom}>
          <Text>Don't have account?</Text>
          <Button
            mode="text"
            uppercase={false}
            onPress={() => navigation.replace('Register')}>
            Register
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  top: {
    flex: 2,
    justifyContent: 'center',
  },
  button: {
    marginTop: 30,
  },
  bottom: {
    marginTop: 50,
    alignItems: 'center',
  },
  message: {
    marginVertical: 10,
  },
});

export default Login;
