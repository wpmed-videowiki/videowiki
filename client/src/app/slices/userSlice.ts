import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { LoadingStateEnum } from "../../types/types";
import { httpDelete, httpGet, httpPost } from "../apis/Common";
import request from "../utils/requestAgent";

export interface UserState {
  fetchLeaderboardState: LoadingStateEnum;
  leaderboard: any;
}

const initialState: UserState = {
  fetchLeaderboardState: LoadingStateEnum.LOADING,
  leaderboard: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    onFetchLeaderboardLoading: (state) => {
      state.fetchLeaderboardState = LoadingStateEnum.LOADING;
      state.leaderboard = null;
    },
    onFetchLeaderboardSuccess: (state, action: PayloadAction<any>) => {
      state.fetchLeaderboardState = LoadingStateEnum.DONE;
      state.leaderboard = action.payload;
    },
    onFetchLeaderboardFailure: (state) => {
      state.fetchLeaderboardState = LoadingStateEnum.FAILED;
      state.leaderboard = null;
    },
  },
});

export default userSlice.reducer;

// Action creators are generated for each case reducer function
export const {
  onFetchLeaderboardFailure,
  onFetchLeaderboardLoading,
  onFetchLeaderboardSuccess,
} = userSlice.actions;

export const fetchLeaderboard = createAsyncThunk(
  "user/fetchLeaderboard",
  async (_, { dispatch }) => {
    const url = `/api/users/leaderboard`;
    dispatch(onFetchLeaderboardLoading());

    try {
      const response = await httpGet(url)
        .then(({ body }: any) => ({
          leaderboard: body.users,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onFetchLeaderboardSuccess(response.leaderboard));
    } catch (err) {
      console.error(err);
      dispatch(onFetchLeaderboardFailure());
    }
  }
);
