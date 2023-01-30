import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chats",
  initialState: {
    chatsData: {},
  },
  reducers: {
    setChatData: (state, action) => {
      const chatsData = { ...action.payload.chatsData };
      state.chatsData = chatsData;
    },
  },
});

export const setChatData = chatSlice.actions.setChatData;
export default chatSlice.reducer;
