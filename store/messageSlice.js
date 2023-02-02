import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "messages",
  initialState: {
    messageData: {},
    starredMessages: {},
  },
  reducers: {
    setMessagesData: (state, action) => {
      const { chatId, messagesData } = action.payload;
      const existingMessages = state.messageData;
      existingMessages[chatId] = messagesData;
      state.messageData = existingMessages;
    },
    addStarMessages: (state, action) => {
      const { starredMessage } = action.payload;
      state.starredMessages[starredMessage.messageId] = starredMessage;
    },
    removeStarMessages: (state, action) => {
      const { starreddMessageId } = action.payload;
      delete state.starredMessages[starreddMessageId];
    },
    setStarredMessage: (state, action) => {
      const { starredMessages } = action.payload;
      state.starredMessages = starredMessages ?? {};
    },
  },
});

export const setMessagesData = messageSlice.actions.setMessagesData;
export const setStarredMessage = messageSlice.actions.setStarredMessage;
export const addStarMessages = messageSlice.actions.addStarMessages;
export const removeStarMessages = messageSlice.actions.removeStarMessages;

export default messageSlice.reducer;
