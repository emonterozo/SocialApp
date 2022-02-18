import React from 'react';
import {View, StyleSheet} from 'react-native';
import {TextInput, Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {isEmpty} from 'lodash';

import {theme} from '../../styles/theme';

interface ICTextInput {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  label: string;
  isSecureText?: boolean;
  error?: string;
  isFocused: boolean;
  isRequired?: boolean;
  onFocus: () => void;
  onBlur: () => void;
  right?: any;
}

const CTextInput = ({
  value,
  onChangeText,
  placeholder,
  label,
  isSecureText,
  error,
  isFocused,
  isRequired,
  onFocus,
  onBlur,
  right,
}: ICTextInput) => {
  return (
    <View style={styles.container}>
      <Text
        style={[
          isFocused ? styles.focused : styles.notFocused,
          !isEmpty(error) && {color: theme.colors.error},
        ]}>
        {label}
        {isRequired && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        placeholder={placeholder}
        mode="outlined"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isSecureText}
        right={right}
        onFocus={onFocus}
        onBlur={onBlur}
        error={isEmpty(error) ? false : true}
      />
      {!isEmpty(error) && (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            color="red"
            size={18}
          />
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  focused: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  notFocused: {
    color: theme.colors.primary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  error: {
    color: theme.colors.error,
    marginLeft: 5,
  },
  required: {
    color: theme.colors.error,
  },
});

export default CTextInput;
