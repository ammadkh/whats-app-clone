import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import chatSlice from "./chatSlice";
import messageSlice from "./messageSlice";
import userSlice from "./userSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    users: userSlice,
    chat: chatSlice,
    messages: messageSlice,
  },
});
