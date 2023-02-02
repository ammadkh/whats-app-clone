import * as ImagePicker from "expo-image-picker";
import {
  getStorage,
  uploadBytesResumable,
  ref,
  getDownloadURL,
} from "firebase/storage";
import { getFirebaseApp } from "./firebaseHelper";
import uuid from "react-native-uuid";
import { Camera, CameraType } from "expo-camera";

export const launchImagePicker = async () => {
  await checkPermission();
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
    aspect: [1, 1],
    allowsEditing: true,
  });
  if (!result.canceled) {
    return result?.assets[0].uri;
  }
};

export const launchCamera = async () => {
  await checkCameraPermission();
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
    aspect: [1, 1],
    allowsEditing: true,
  });
  if (!result.canceled) {
    return result?.assets[0].uri;
  }
};

const checkCameraPermission = async () => {
  const permissionResponse = await ImagePicker.requestCameraPermissionsAsync();
  if (!permissionResponse.granted) {
    return Promise.reject("permission is required");
  }
  return Promise.resolve();
};

const checkPermission = async () => {
  const permissionResponse =
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResponse.granted) {
    return Promise.reject("permission is required");
  }
  return Promise.resolve();
};

export const uploadImageAsync = async (uri, isChatImage = false) => {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new Error("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
  const pathFolder = isChatImage ? "chatPictures" : "profilePic";
  const app = getFirebaseApp();
  const fileRef = ref(getStorage(app), `${pathFolder}/${uuid.v4()}`);
  await uploadBytesResumable(fileRef, blob);

  blob.close();
  const downloadUrl = await getDownloadURL(fileRef);
  return downloadUrl;
};
