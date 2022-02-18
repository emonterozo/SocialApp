import React from 'react';
import {TouchableWithoutFeedback, View, StyleSheet} from 'react-native';
import {TouchableRipple, Text, Title} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../../../styles/theme';

interface IUploadDialog {
  handleOpenCamera: () => void;
  handleOpenGallery: () => void;
  handleHideDialog: () => void;
}

const UploadDialog = ({
  handleOpenCamera,
  handleOpenGallery,
  handleHideDialog,
}: IUploadDialog) => {
  return (
    <TouchableWithoutFeedback onPress={handleHideDialog}>
      <View style={styles.dialogContainer}>
        <View style={styles.dialogContent}>
          <TouchableRipple
            onPress={handleOpenCamera}
            hasTVPreferredFocus={false}
            tvParallaxProperties>
            <View style={styles.option}>
              <MaterialCommunityIcons
                size={30}
                name="camera"
                color={theme.colors.primary}
              />
              <Text style={styles.optionText}>Use Camera</Text>
            </View>
          </TouchableRipple>
          <TouchableRipple
            onPress={handleOpenGallery}
            hasTVPreferredFocus={false}
            tvParallaxProperties>
            <View style={styles.option}>
              <MaterialCommunityIcons
                size={30}
                name="upload"
                color={theme.colors.primary}
              />
              <Text style={styles.optionText}>Upload from Gallery</Text>
            </View>
          </TouchableRipple>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  dialogContainer: {
    flex: 1,
  },
  dialogContent: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {
    marginLeft: 10,
  },
});

export default UploadDialog;
