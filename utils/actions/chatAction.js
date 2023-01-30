import { getDatabase, push, ref, update } from "firebase/database";
import { getFirebaseApp } from "../firebaseHelper";

export const createChat = async (loggedInUserId, chatData) => {
  const newChatData = {
    ...chatData,
    createdBy: loggedInUserId,
    updatedBy: loggedInUserId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const app = getFirebaseApp();
  const db = getDatabase(app);

  const newChat = await push(ref(db, "chats"), newChatData);

  for (let i = 0; i < newChatData.users.length; i++) {
    const userId = newChatData.users[i];
    await push(ref(db, `userChat/${userId}`), newChat.key);
  }

  return newChat.key;
};

export const sendTextMessage = async (chatId, senderId, textMessage) => {
  const app = getFirebaseApp();
  const db = getDatabase(app);

  const messageRef = ref(db, `messages/${chatId}`);
  const messageData = {
    sentBy: senderId,
    sentAt: new Date().toISOString(),
    text: textMessage,
  };
  await push(messageRef, messageData);
  const chatRef = ref(db, `chats/${chatId}`);
  await update(chatRef, {
    updatedBy: senderId,
    updatedAt: new Date().toISOString(),
    lastTextMessage: textMessage,
  });
};
