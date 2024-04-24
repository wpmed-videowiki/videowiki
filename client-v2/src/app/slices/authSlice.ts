import { createSlice } from "@reduxjs/toolkit";

export interface AuthState {
  token?: string;
  session?: {
    anonymousId: string;
  };
}

const initialState: AuthState = {
  token: "",
  session: {
    anonymousId: "",
  },
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
});

export default authSlice.reducer;

// Action creators are generated for each case reducer function
export const {} = authSlice.actions;
