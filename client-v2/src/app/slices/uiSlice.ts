import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface UIState {
  showReopenFormNotification: boolean;
  showBetaDisclaimer: boolean;
  language: string;
  wiki: any;
}

const initialState: UIState = {
  language: "en",
  showBetaDisclaimer: true,
  showReopenFormNotification: true,
  wiki: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setWiki: (state, action: PayloadAction<string|undefined>) => {
      state.wiki = action.payload;
    },
    setShowReopenFormNotification: (state, action: PayloadAction<boolean>) => {
      state.showReopenFormNotification = action.payload;
    },
    closeBetaDisclaimer: (state) => {
      state.showBetaDisclaimer = false;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
  },
});

export default uiSlice.reducer;

// Action creators are generated for each case reducer function
export const {
  closeBetaDisclaimer,
  setLanguage,
  setShowReopenFormNotification,
  setWiki,
} = uiSlice.actions;
