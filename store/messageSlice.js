import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "messages",
  initialState: {
    messageData: {},
  },
  reducers: {
    setMessagesData: (state, action) => {
      const { chatId, messagesData } = action.payload;
      const existingMessages = state.messageData;
      existingMessages[chatId] = messagesData;
      state.messageData = existingMessages;
    },
  },
});

export const setMessagesData = messageSlice.actions.setMessagesData;
export default messageSlice.reducer;
