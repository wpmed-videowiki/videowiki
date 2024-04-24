import { createSlice } from "@reduxjs/toolkit";

export interface UIState {
  language: string;
}

const initialState: UIState = {
  language: "en",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {},
});

export default uiSlice.reducer;

// Action creators are generated for each case reducer function
export const {} = uiSlice.actions;
