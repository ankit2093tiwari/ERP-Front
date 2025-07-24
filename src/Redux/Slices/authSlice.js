import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

const initialState = {
  token: null,
  user: null,
  authorities: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthToken(state, action) {
      state.token = action.payload;

      try {
        const decoded = jwtDecode(action.payload);
        const authoritiesArr = decoded?.data?.authorities || [];
        const authMap = {};

        authoritiesArr.forEach(({ module, actions }) => {
          if (module && actions) authMap[module] = actions;
        });

        state.user = decoded.data;
        state.authorities = authMap;

      } catch (error) {
        console.error("JWT decode failed:", error);
      }
    },

    clearAuth(state) {
      state.token = null;
      state.user = null;
      state.authorities = {};
    },
  },
});

export const { setAuthToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;
