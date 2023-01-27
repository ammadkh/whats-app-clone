import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    userData: null,
    didTryAutoLogin: false,
  },
  reducers: {
    authenticate: (state, action) => {
      const { payload } = action;
      state.token = payload.token;
      state.userData = payload.userData;
      state.didTryAutoLogin = false;
    },
    didTryAutoLogin: (state, action) => {
      state.didTryAutoLogin = true;
    },
    logout: (state, action) => {
      state.token = null;
      state.userData = null;
      state.didTryAutoLogin = false;
    },
    updateUserInformation: (state, action) => {
      state.userData = { ...state.userData, ...action.payload.newData };
    },
  },
});

export const authenticate = authSlice.actions.authenticate;
export const didTryAutoLogin = authSlice.actions.didTryAutoLogin;
export const logout = authSlice.actions.logout;
export const updateUserInformation = authSlice.actions.updateUserInformation;
export default authSlice.reducer;
