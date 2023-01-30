import { createSlice } from "@reduxjs/toolkit";
import React from "react";

const userSlice = createSlice({
  name: "userSlice",
  initialState: {
    storedUsers: {},
  },
  reducers: {
    setStoredUsers: (state, action) => {
      const newUser = action.payload.newUser;
      const existingUser = state.storedUsers;
      for (let key in newUser) {
        existingUser[key] = newUser[key];
      }
      state.storedUsers = existingUser;
    },
  },
});

export const setStoredUsers = userSlice.actions.setStoredUsers;
export default userSlice.reducer;
