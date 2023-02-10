import {
  endAt,
  get,
  getDatabase,
  orderByChild,
  push,
  query,
  ref,
  remove,
  startAt,
  set,
} from "firebase/database";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { getFirebaseApp } from "../firebaseHelper";

export const getUser = async (userId) => {
  try {
    const app = getFirebaseApp();
    const db = getDatabase(app);
    const userRef = ref(db, `users/${userId}`);
    const res = await get(userRef);
    return res?.val();
  } catch (error) {
    console.log(error);
  }
};

export const getUserChats = async (userId) => {
  try {
    const app = getFirebaseApp();
    const db = getDatabase(app);
    const userRef = ref(db, `userChat/${userId}`);
    const res = await get(userRef);
    return res?.val();
  } catch (error) {
    console.log(error);
  }
};

export const deleteUserChats = async (userId, chatId) => {
  try {
    const app = getFirebaseApp();
    const db = getDatabase(app);
    const userRef = ref(db, `userChat/${userId}/${chatId}`);
    await remove(userRef);
  } catch (error) {
    console.log(error);
  }
};

export const addUserChats = async (userId, chatId) => {
  try {
    const app = getFirebaseApp();
    const db = getDatabase(app);
    const userRef = ref(db, `userChat/${userId}`);
    await push(userRef, chatId);
  } catch (error) {
    console.log(error);
  }
};

export const searchUser = async (search) => {
  try {
    const searchTerm = search.toLowerCase();
    const app = getFirebaseApp();
    const db = getDatabase(app);
    const userRef = ref(db, "users");
    const queryRef = query(
      userRef,
      orderByChild("fullName"),
      startAt(searchTerm),
      endAt(searchTerm + "\uf8ff")
    );

    const snapshot = await get(queryRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return {};
  } catch (error) {
    console.log(error);
  }
};

export const savePushToken = async (userData) => {
  if (!Device.isDevice) {
    return;
  }
  token = (await Notifications.getExpoPushTokenAsync()).data;
  const tokenData = { ...userData.pushTokens } || {};
  const tokenArray = Object.values(tokenData);

  if (tokenArray.includes(token)) {
    return;
  }
  tokenArray.push(token);
  for (let i = 0; i < tokenArray.length; i++) {
    tokenData[i] = tokenArray[i];
  }
  const app = getFirebaseApp();
  const db = getDatabase(app);
  const userRef = ref(db, `users/${userData.userId}/pushTokens`);
  await set(userRef, tokenData);
};

export const removePushToken = async (userData) => {
  if (!Device.isDevice) {
    return;
  }
  token = (await Notifications.getExpoPushTokenAsync()).data;
  const tokenData = await getUserPushToken(userData.userId);
  for (let key in tokenData) {
    if (tokenData[key] === token) {
      delete tokenData[key];
      break;
    }
  }
  const app = getFirebaseApp();
  const db = getDatabase(app);
  const userRef = ref(db, `users/${userData.userId}/pushTokens`);
  await set(userRef, tokenData);
};

export const getUserPushToken = async (userId) => {
  try {
    if (!Device.isDevice) {
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    const app = getFirebaseApp();
    const db = getDatabase(app);
    const userRef = ref(db, `users/${userId}/pushTokens`);
    const snapshot = await get(userRef);
    return snapshot?.val() || {};
  } catch (error) {
    console.log(error);
  }
};
