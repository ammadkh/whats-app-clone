import { get, getDatabase, ref } from "firebase/database";
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
