import {
  get,
  getDatabase,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
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

export const sendTextMessage = async (
  chatId,
  senderId,
  textMessage,
  replyTo
) => {
  sendMessages(chatId, senderId, textMessage, null, replyTo);
};

export const sendImgMessage = async (chatId, senderId, imageUrl, replyTo) => {
  sendMessages(chatId, senderId, "image", imageUrl, replyTo);
};

const sendMessages = async (
  chatId,
  senderId,
  textMessage,
  imageUrl,
  replyTo
) => {
  const app = getFirebaseApp();
  const db = getDatabase(app);

  const messageRef = ref(db, `messages/${chatId}`);
  const messageData = {
    sentBy: senderId,
    sentAt: new Date().toISOString(),
    text: textMessage,
  };
  if (!!replyTo) {
    messageData.replyTo = replyTo;
  }
  if (!!imageUrl) {
    messageData.imageUrl = imageUrl;
  }
  await push(messageRef, messageData);
  const chatRef = ref(db, `chats/${chatId}`);
  await update(chatRef, {
    updatedBy: senderId,
    updatedAt: new Date().toISOString(),
    lastTextMessage: textMessage,
  });
};

export const starMessages = async (userId, chatId, messageId) => {
  try {
    const app = getFirebaseApp();
    const db = getDatabase(app);

    const starMessageRef = ref(
      db,
      `userStarMessages/${userId}/${chatId}/${messageId}`
    );

    const snapshot = await get(starMessageRef);
    if (snapshot.exists()) {
      console.log("unstarring");
      await remove(starMessageRef);
    } else {
      const starMessageData = {
        chatId,
        messageId,
        starAt: new Date().toISOString(),
      };
      await set(starMessageRef, starMessageData);

      console.log("starring");
    }
  } catch (error) {
    console.log(error);
  }
};
