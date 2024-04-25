import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { LoadingStateEnum } from "../../types/types";
import { httpDelete, httpGet, httpPost } from "../apis/Common";
import request from "../utils/requestAgent";

export interface HumanVoiceState {
  uploadAudioToSlideState: LoadingStateEnum;
  uploadedSlideAudio: any;
  fetchArticleHumanVoiceState: LoadingStateEnum;
  humanvoice: any;
  deleteCustomAudioState: LoadingStateEnum;
  deletedAudio: any;
  saveTranslatedTextState: LoadingStateEnum;
  translatedTextInfo: any;
}

const initialState: HumanVoiceState = {
  uploadAudioToSlideState: LoadingStateEnum.DONE,
  uploadedSlideAudio: null,
  fetchArticleHumanVoiceState: LoadingStateEnum.DONE,
  humanvoice: null,
  deleteCustomAudioState: LoadingStateEnum.DONE,
  deletedAudio: null,
  saveTranslatedTextState: LoadingStateEnum.DONE,
  translatedTextInfo: null,
};

export const humanVoiceSlice = createSlice({
  name: "humanVoice",
  initialState,
  reducers: {
    // article
    onFetchArticleHumanVoiceLoading: (state) => {
      state.fetchArticleHumanVoiceState = LoadingStateEnum.LOADING;
    },
    onFetchArticleHumanVoiceSuccess: (state, action: PayloadAction<any>) => {
      state.fetchArticleHumanVoiceState = LoadingStateEnum.DONE;
      state.humanvoice = action.payload;
    },
    onFetchArticleHumanVoiceFailure: (state) => {
      state.fetchArticleHumanVoiceState = LoadingStateEnum.FAILED;
      state.humanvoice = null;
    },
    // upload slide audio human voice
    onUploadSlideAudioHumanVoiceLoading: (state) => {
      state.uploadAudioToSlideState = LoadingStateEnum.LOADING;
    },
    onUploadSlideAudioHumanVoiceSuccess: (
      state,
      action: PayloadAction<any>
    ) => {
      state.uploadAudioToSlideState = LoadingStateEnum.DONE;
      state.uploadedSlideAudio = action.payload.slideAudioInfo;
      state.humanvoice = action.payload.humanvoice;
    },
    onUploadSlideAudioHumanVoiceFailure: (state) => {
      state.uploadAudioToSlideState = LoadingStateEnum.FAILED;
    },
    // save translated text
    onSaveTranslatedTextLoading: (state) => {
      state.saveTranslatedTextState = LoadingStateEnum.LOADING;
      state.translatedTextInfo = null;
    },
    onSaveTranslatedTextSuccess: (state, action: PayloadAction<any>) => {
      state.saveTranslatedTextState = LoadingStateEnum.DONE;
      state.translatedTextInfo = action.payload.translatedTextInfo;
      state.humanvoice = action.payload.humanvoice;
    },
    onSaveTranslatedTextFailure: (state) => {
      state.saveTranslatedTextState = LoadingStateEnum.FAILED;
      state.translatedTextInfo = null;
    },
    // delete custom audio
    onDeleteCustomAudioLoading: (state) => {
      state.deleteCustomAudioState = LoadingStateEnum.LOADING;
      state.deletedAudio = null;
    },
    onDeleteCustomAudioSuccess: (state, action: PayloadAction<any>) => {
      state.deleteCustomAudioState = LoadingStateEnum.DONE;
      state.deletedAudio = action.payload.deletedAudio;
    },
    onDeleteCustomAudioFailure: (state) => {
      state.deleteCustomAudioState = LoadingStateEnum.FAILED;
      state.deletedAudio = null;
    },
  },
});

export default humanVoiceSlice.reducer;

// Action creators are generated for each case reducer function
export const {
  onFetchArticleHumanVoiceFailure,
  onFetchArticleHumanVoiceLoading,
  onFetchArticleHumanVoiceSuccess,
  onUploadSlideAudioHumanVoiceFailure,
  onUploadSlideAudioHumanVoiceLoading,
  onUploadSlideAudioHumanVoiceSuccess,
  onSaveTranslatedTextFailure,
  onSaveTranslatedTextLoading,
  onSaveTranslatedTextSuccess,
  onDeleteCustomAudioFailure,
  onDeleteCustomAudioLoading,
  onDeleteCustomAudioSuccess,
} = humanVoiceSlice.actions;

export const fetchArticleHumanVoice = createAsyncThunk(
  "humanVoice/fetchArticleHumanVoice",
  async (
    {
      title,
      wikiSource,
      lang,
    }: { title: string; wikiSource: string; lang: string },
    { dispatch }
  ) => {
    const url = `/api/humanvoice/?title=${encodeURIComponent(
      title
    )}&wikiSource=${wikiSource}&lang=${lang}`;

    dispatch(onFetchArticleHumanVoiceLoading());

    try {
      const response = await httpGet(url)
        .then((res: any) => ({ humanvoice: res.body.humanvoice }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onFetchArticleHumanVoiceSuccess(response.humanvoice));
    } catch (err) {
      console.error(err);
      dispatch(onFetchArticleHumanVoiceFailure());
    }
  }
);

export const uploadSlideAudioHumanVoice = createAsyncThunk(
  "humanVoice/uploadSlideAudioHumanVoice",
  async (
    {
      title,
      wikiSource,
      lang,
      slideNumber,
      blob,
      enableAudioProcessing,
    }: {
      title: string;
      wikiSource: string;
      lang: string;
      slideNumber: number;
      blob: any;
      enableAudioProcessing: boolean;
    },
    { dispatch }
  ) => {
    const url = `/api/humanvoice/audios`;
    dispatch(onUploadSlideAudioHumanVoiceLoading());

    try {
      const response = await request
        .post(url)
        .field("title", title)
        .field("wikiSource", wikiSource)
        .field("position", slideNumber)
        .field("lang", lang)
        .field("enableAudioProcessing", enableAudioProcessing)
        .field("file", blob)
        .then((res) => ({
          slideAudioInfo: res.body.slideAudioInfo,
          humanvoice: res.body.humanvoice,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onUploadSlideAudioHumanVoiceSuccess(response));
    } catch (err) {
      console.error(err);
      dispatch(onUploadSlideAudioHumanVoiceFailure());
    }
  }
);

export const savetranslatedText = createAsyncThunk(
  "humanVoice/savetranslatedText",
  async (
    {
      title,
      wikiSource,
      lang,
      slideNumber,
      text,
    }: {
      title: string;
      wikiSource: string;
      lang: string;
      slideNumber: number;
      text: string;
    },
    { dispatch }
  ) => {
    const url = `/api/humanvoice/translated_text`;
    const data = {
      title,
      wikiSource,
      lang,
      position: slideNumber,
      text,
    };
    dispatch(onSaveTranslatedTextLoading());
    try {
      const response = await httpPost(url, data)
        .then(({ body }: any) => ({
          translatedTextInfo: body.translatedTextInfo,
          humanvoice: body.humanvoice,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onSaveTranslatedTextSuccess(response));
    } catch (err) {
      console.error(err);
      dispatch(onSaveTranslatedTextFailure());
    }
  }
);

export const deleteCustomAudio = createAsyncThunk(
  "humanVoice/deleteCustomAudio",
  async (
    {
      title,
      wikiSource,
      lang,
      slideNumber,
    }: { title: string; wikiSource: string; lang: string; slideNumber: number },
    { dispatch }
  ) => {
    const url = `/api/humanvoice/audios`;
    const data = {
      title,
      wikiSource,
      lang,
      position: slideNumber,
    };

    dispatch(onDeleteCustomAudioLoading());
    try {
      const response = await httpDelete(url, data)
        .then((res: any) => ({
          deletedAudio: res.body.deletedAudio,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onDeleteCustomAudioSuccess(response));
    } catch (err) {
      console.error(err);
      dispatch(onDeleteCustomAudioFailure());
    }
  }
);
