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
import { deleteUserChats, getUserChats } from "./userActions";

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

export const updateChatData = async (chatId, userId, chatData) => {
  const app = getFirebaseApp();
  const db = getDatabase(app);
  const updatedChatData = {
    ...chatData,
    updatedAt: new Date().toISOString(),
    updateBy: userId,
  };
  console.log(updatedChatData, "updatedChatData");
  try {
    const updatedChat = await update(
      ref(db, `chats/${chatId}`),
      updatedChatData
    );
  } catch (error) {
    console.log(error);
  }
};

export const sendInfoMessage = async (chatId, senderId, textMessage) => {
  sendMessages(chatId, senderId, textMessage, null, null, "info");
};

export const sendTextMessage = async (
  chatId,
  senderId,
  textMessage,
  replyTo
) => {
  sendMessages(chatId, senderId, textMessage, null, replyTo, null);
};

export const sendImgMessage = async (chatId, senderId, imageUrl, replyTo) => {
  sendMessages(chatId, senderId, "image", imageUrl, replyTo, null);
};

const sendMessages = async (
  chatId,
  senderId,
  textMessage,
  imageUrl,
  replyTo,
  type
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
  if (!!type) {
    messageData.type = type;
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

export const removeUserFromChat = async (
  loggedInUserData,
  removedUserData,
  chatData
) => {
  const removedUserId = removedUserData.userId;
  const newUser = chatData.users.filter((user) => user !== removedUserId);
  await updateChatData(chatData.key, loggedInUserData.userId, {
    users: newUser,
  });

  const userChats = await getUserChats(removedUserData.userId);
  for (let key in userChats) {
    const currentUserChat = userChats[key];
    if (currentUserChat === chatData.key) {
      console.log(chatData, "current user chat");
      await deleteUserChats(removedUserData.userId, key);
      break;
    }
  }
  let infoMessage;
  if (loggedInUserData.userId === removedUserData.userId) {
    infoMessage = `${loggedInUserData.fullName} left the chat.`;
  } else {
    infoMessage = `${loggedInUserData.fullName} removed ${removedUserData.fullName} from chat.`;
  }
  await sendInfoMessage(chatData.key, loggedInUserData.userId, infoMessage);
};
