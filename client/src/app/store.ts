import { combineReducers, configureStore } from "@reduxjs/toolkit";
import articleSlice from "./slices/articleSlice";
import uiSlice from "./slices/uiSlice";
import authSlice from "./slices/authSlice";
import humanVoiceSlice from "./slices/humanVoiceSlice";
import userSlice from "./slices/userSlice";
import videoSlice from "./slices/videoSlice";
import wikiSlice from "./slices/wikiSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["ui", "auth"],
};

const rootReducer = combineReducers({
  article: articleSlice,
  ui: uiSlice,
  auth: authSlice,
  humanvoice: humanVoiceSlice,
  user: userSlice,
  video: videoSlice,
  wiki: wikiSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
