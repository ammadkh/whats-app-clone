import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirebaseApp } from "../firebaseHelper";
import { getDatabase, ref, set, child, update, push } from "firebase/database";
import { async } from "validate.js";
import { authenticate, logout } from "../../store/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUser, removePushToken, savePushToken } from "./userActions";
let timer;
export const signup = (firstName, lastName, email, password) => {
  return async (dispatch) => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const { uid, stsTokenManager } = res.user;
      const { accessToken, expirationTime } = stsTokenManager;
      const userData = await createUser(firstName, lastName, email, uid);
      await savePushToken(userData);
      dispatch(authenticate({ token: accessToken, userData }));
      saveUserToStorage(accessToken, uid, new Date(expirationTime));
      timer = setTimeout(() => {
        logoutUser();
      }, expirationTimeInMiliSecond);
    } catch (error) {
      let message = "something went wrong";

      if (error.code === "auth/email-already-in-use") {
        message = "user already exists";
      }
      console.log(error);
      throw new Error(message);
    }
  };
};

export const signin = (email, password) => {
  return async (dispatch) => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const { uid, stsTokenManager } = res.user;
      const { accessToken, expirationTime } = stsTokenManager;
      const userData = await getUser(uid);
      await savePushToken(userData);
      dispatch(authenticate({ token: accessToken, userData }));
      saveUserToStorage(accessToken, uid, new Date(expirationTime));
      const expirationTimeInMiliSecond = new Date(expirationTime) - new Date();
      timer = setTimeout(() => {
        dispatch(logoutUser());
      }, expirationTimeInMiliSecond);
    } catch (error) {
      let message = "something went wrong";

      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        message = "The username or password is incorrect ";
      }
      console.log(error);
      throw new Error(message);
    }
  };
};

export const updateUser = async (userId, newUser) => {
  if (!!newUser?.firstName && !!newUser?.lastName) {
    const fullName = `${newUser.firstName} ${newUser.lastName}`.toLowerCase();
    newUser.fullName = fullName;
  }
  const db = getDatabase();
  // Get a key for a new Post.
  const newUserKey = ref(db, `users/${userId}`);

  await update(newUserKey, newUser);
};

const createUser = async (firstName, lastName, email, userId) => {
  fullName = `${firstName} ${lastName}`.toLowerCase();
  const userData = {
    fullName,
    firstName,
    lastName,
    email,
    userId,
    signUpDate: new Date().toISOString(),
  };
  const db = getDatabase();
  const childRef = ref(db, `users/${userId}`);
  await set(childRef, userData);
  return userData;
};

const saveUserToStorage = async (token, userId, expiryDate) => {
  await AsyncStorage.setItem(
    "user",
    JSON.stringify({ token, userId, expiryDate: expiryDate.toISOString() })
  );
};

export const logoutUser = (userData) => {
  return async (dispatch) => {
    try {
      await removePushToken(userData);
    } catch (error) {
      console.log(error);
    }
    await AsyncStorage.clear();
    clearTimeout(timer);
    dispatch(logout());
  };
};
