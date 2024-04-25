import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { LoadingStateEnum } from "../../types/types";
import { httpDelete, httpGet, httpPost } from "../apis/Common";
import request from "../utils/requestAgent";

export interface VideoState {
  exportArticleToVideoState: LoadingStateEnum;
  exportArticleToVideoError: any;
  video: any;
  videosHistory: {
    fetchVideosHistoryState: LoadingStateEnum;
    videos: any[];
  };
  videoConvertProgress: {
    videoConvertProgressState: LoadingStateEnum;
    video: any;
  };
}

const initialState: VideoState = {
  exportArticleToVideoState: LoadingStateEnum.DONE,
  exportArticleToVideoError: "",
  video: {},
  videosHistory: {
    fetchVideosHistoryState: LoadingStateEnum.DONE,
    videos: [],
  },
  videoConvertProgress: {
    videoConvertProgressState: LoadingStateEnum.DONE,
    video: {},
  },
};

export const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    // export article to video
    onExportArticleToVideoLoading: (state) => {
      state.exportArticleToVideoState = LoadingStateEnum.LOADING;
      state.exportArticleToVideoError = "";
    },
    onExportArticleToVideoSuccess: (state, action: PayloadAction<any>) => {
      state.exportArticleToVideoState = LoadingStateEnum.DONE;
      state.video = action.payload;
      state.exportArticleToVideoError = "";
    },
    onExportArticleToVideoFailure: (state, action: PayloadAction<any>) => {
      state.exportArticleToVideoState = LoadingStateEnum.FAILED;
      state.exportArticleToVideoError = action.payload;
    },
    // fetch video history
    onFetchVideosHistoryLoading: (state) => {
      state.videosHistory.fetchVideosHistoryState = LoadingStateEnum.LOADING;
      state.videosHistory.videos = [];
    },
    onFetchVideosHistorySuccess: (state, action: PayloadAction<any>) => {
      state.videosHistory.fetchVideosHistoryState = LoadingStateEnum.DONE;
      state.videosHistory.videos = action.payload;
    },
    onFetchVideosHistoryFailure: (state) => {
      state.videosHistory.fetchVideosHistoryState = LoadingStateEnum.FAILED;
      state.videosHistory.videos = [];
    },
    // fetch video
    onFetchVideoLoading: (state) => {
      state.videoConvertProgress.videoConvertProgressState =
        LoadingStateEnum.LOADING;
      state.videoConvertProgress.video = {};
    },
    onFetchVideoSuccess: (state, action: PayloadAction<any>) => {
      state.videoConvertProgress.videoConvertProgressState =
        LoadingStateEnum.DONE;
      state.videoConvertProgress.video = action.payload;
    },
    onFetchVideoFailure: (state) => {
      state.videoConvertProgress.videoConvertProgressState =
        LoadingStateEnum.FAILED;
      state.videoConvertProgress.video = {};
    },
    // retry youtube upload
    onRetryYouTubeUploadSuccess: (state, action: PayloadAction<any>) => {
      const videoIndex = state.videosHistory.videos.findIndex(
        (video) => video._id === action.payload.videoId
      );
      const videos = state.videosHistory.videos.slice();
      videos[videoIndex].youtubeUploadStatus =
        action.payload.youtubeUploadStatus;
      state.videosHistory.videos = videos;
    },
  },
});

export default videoSlice.reducer;

// Action creators are generated for each case reducer function
export const {
  onExportArticleToVideoFailure,
  onExportArticleToVideoLoading,
  onExportArticleToVideoSuccess,
  onFetchVideosHistoryFailure,
  onFetchVideosHistoryLoading,
  onFetchVideosHistorySuccess,
  onFetchVideoFailure,
  onFetchVideoLoading,
  onFetchVideoSuccess,
  onRetryYouTubeUploadSuccess,
} = videoSlice.actions;

export const exportArticleToVideo = createAsyncThunk(
  "video/exportArticleToVideo",
  async (formData: any, { dispatch }) => {
    const url = "/api/videos/convert";
    dispatch(onExportArticleToVideoLoading());
    try {
      const response = await httpPost(url, formData)
        .then(({ body }: any) => ({
          video: body.video,
        }))
        .catch((err) => {
          throw {
            error: "FAILED",
            reason: (err.response && err.response.text) || "",
          };
        });
      dispatch(onExportArticleToVideoSuccess(response.video));
    } catch (err) {
      console.error(err);
      dispatch(onExportArticleToVideoFailure(err));
    }
  }
);

export const fetchVideosHistory = createAsyncThunk(
  "video/fetchVideosHistory",
  async (
    { title, wikiSource }: { title: string; wikiSource: string },
    { dispatch }
  ) => {
    const url = `/api/videos/history?title=${title}&wikiSource=${wikiSource}`;
    dispatch(onFetchVideosHistoryLoading());
    try {
      const response = await httpGet(url)
        .then(({ body }: any) => ({
          videos: body.videos.sort(
            (a, b) => parseInt(b.version) - parseInt(a.version)
          ),
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onFetchVideosHistorySuccess(response.videos));
    } catch (err) {
      console.error(err);
      dispatch(onFetchVideosHistoryFailure());
    }
  }
);

export const fetchVideo = createAsyncThunk(
  "video/fetchVideo",
  async ({ id }: { id: string }, { dispatch }) => {
    const url = `/api/videos/${id}`;

    dispatch(onFetchVideoLoading());
    try {
      const response = await httpGet(url)
        .then(({ body }: any) => ({
          video: body.video,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onFetchVideoSuccess(response.video));
    } catch (err) {
      console.error(err);
      dispatch(onFetchVideoFailure());
    }
  }
);

export const retryYouTubeUpload = createAsyncThunk(
  "video/retryYouTubeUpload",
  async ({ videoId }: { videoId: string }, { dispatch }) => {
    const url = `/api/videos/${videoId}/youtube_retry`;
    try {
      const response = await httpPost(url, {})
        .then(({ body }: any) => ({
          videoId,
          youtubeUploadStatus: body.youtubeUploadStatus,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onRetryYouTubeUploadSuccess(response));
    } catch (err) {
      console.error(err);
    }
  }
);
