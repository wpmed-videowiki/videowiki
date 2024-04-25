import { configureStore } from "@reduxjs/toolkit";
import articleSlice from "./slices/articleSlice";
import uiSlice from "./slices/uiSlice";
import authSlice from "./slices/authSlice";
import humanVoiceSlice from "./slices/humanVoiceSlice";
import userSlice from "./slices/userSlice";
import videoSlice from "./slices/videoSlice";

export const store = configureStore({
  reducer: {
    article: articleSlice,
    ui: uiSlice,
    auth: authSlice,
    humanvoice: humanVoiceSlice,
    user: userSlice,
    video: videoSlice,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
