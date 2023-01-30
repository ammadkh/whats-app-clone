import {
  endAt,
  get,
  getDatabase,
  orderByChild,
  query,
  ref,
  startAt,
} from "firebase/database";
import { async } from "validate.js";
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
