import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { LoadingStateEnum } from "../../types/types";
import { httpGet, httpPost, makeCallback } from "../apis/Common";
import request from "../utils/requestAgent";

export interface ArticleState {
  fetchArticleState: LoadingStateEnum;
  article: any;
  topArticlesState: LoadingStateEnum;
  topArticles: any[];
  conversionPercentage: any;
  conversionPercentageState: LoadingStateEnum;
  publishArticleState: LoadingStateEnum;
  publishArticleStatus: any;
  publishArticleError: any;
  fetchContributorsState: LoadingStateEnum;
  contributors: any[];
  fetchArticleCountState: LoadingStateEnum;
  articleCount: number;
  fetchAllArticlesState: LoadingStateEnum;
  fetchDeltaArticlesState: LoadingStateEnum;
  allArticles: any[];
  deltaArticles: any[];
  uploadState: LoadingStateEnum;
  uploadStatus: any;
  uploadProgress: number;
  playbackSpeed: number;
  fetchAudioFileInfoState: LoadingStateEnum;
  audioInfo: any;
  fetchArticleVideoState: LoadingStateEnum;
  uploadSlideAudioLoadingState: LoadingStateEnum;
  uploadSlideAudioError: any;
  articleVideo: {
    video: any;
    exported: boolean;
  };
  articleLastVideo: any;
}

const initialState: ArticleState = {
  fetchArticleState: LoadingStateEnum.LOADING,
  article: null,
  topArticlesState: LoadingStateEnum.LOADING,
  topArticles: [],
  conversionPercentage: {},
  conversionPercentageState: LoadingStateEnum.LOADING,
  publishArticleState: LoadingStateEnum.DONE,
  publishArticleStatus: null,
  publishArticleError: null,
  fetchContributorsState: LoadingStateEnum.LOADING,
  contributors: [],
  fetchArticleCountState: LoadingStateEnum.LOADING,
  articleCount: 0,
  fetchAllArticlesState: LoadingStateEnum.LOADING,
  fetchDeltaArticlesState: LoadingStateEnum.DONE,
  allArticles: [],
  deltaArticles: [],
  uploadState: LoadingStateEnum.DONE,
  uploadStatus: null,
  uploadProgress: 0,
  playbackSpeed: 1,
  fetchAudioFileInfoState: LoadingStateEnum.DONE,
  audioInfo: {},
  fetchArticleVideoState: LoadingStateEnum.DONE,
  uploadSlideAudioLoadingState: LoadingStateEnum.DONE,
  uploadSlideAudioError: "",
  articleVideo: {
    video: {},
    exported: false,
  },
  articleLastVideo: null,
};

export const articleSlice = createSlice({
  name: "article",
  initialState,
  reducers: {
    // Article
    onFetchArticleLoading: (state) => {
      state.fetchArticleState = LoadingStateEnum.LOADING;
      state.article = null;
    },
    onFetchArticleSuccess: (state, action: PayloadAction<any>) => {
      state.fetchArticleState = LoadingStateEnum.DONE;
      state.article = action.payload;
    },
    onFetchArticleFailure: (state) => {
      state.fetchArticleState = LoadingStateEnum.FAILED;
      state.article = null;
    },
    // Top Articles
    onFetchTopArticlesLoading: (state) => {
      state.topArticlesState = LoadingStateEnum.LOADING;
      state.topArticles = [];
    },
    onFetchTopArticlesSuccess: (state, action: PayloadAction<any>) => {
      state.topArticlesState = LoadingStateEnum.DONE;
      state.topArticles = action.payload;
    },
    onFetchTopArticlesFailure: (state, action: PayloadAction<any>) => {
      state.topArticlesState = LoadingStateEnum.FAILED;
      state.topArticles = action.payload;
    },
    // Upload content
    onUploadContentLoading: (state) => {
      state.uploadState = LoadingStateEnum.LOADING;
      state.uploadStatus = null;
    },
    onUploadContentSuccess: (state, action: PayloadAction<any>) => {
      state.uploadState = LoadingStateEnum.DONE;
      state.uploadStatus = action.payload;
    },
    onUploadContentFailure: (state) => {
      state.uploadState = LoadingStateEnum.FAILED;
      state.uploadStatus = null;
    },
    // Conversion progress
    onConversionProgressLoading: (state) => {
      state.conversionPercentageState = LoadingStateEnum.LOADING;
    },
    onConversionProgressSuccess: (state, action: PayloadAction<any>) => {
      state.conversionPercentageState = LoadingStateEnum.DONE;
      state.conversionPercentage = action.payload;
    },
    onConversionProgressFailure: (state) => {
      state.conversionPercentageState = LoadingStateEnum.FAILED;
    },
    // publish article
    onPublishArticleLoading: (state) => {
      state.publishArticleState = LoadingStateEnum.LOADING;
      state.publishArticleError = null;
      state.publishArticleStatus = null;
    },
    onPublishArticleSuccess: (state, action: PayloadAction<any>) => {
      state.publishArticleState = LoadingStateEnum.DONE;
      state.publishArticleStatus = action.payload;
    },
    onPublishArticleFailure: (state, action: PayloadAction<any>) => {
      state.publishArticleState = LoadingStateEnum.FAILED;
      state.publishArticleError = action.payload;
    },
    // fetch contributors
    onFetchContributorsLoading: (state) => {
      state.fetchContributorsState = LoadingStateEnum.LOADING;
    },
    onFetchContributorsSuccess: (state, action: PayloadAction<any>) => {
      state.fetchContributorsState = LoadingStateEnum.DONE;
      state.contributors = action.payload;
    },
    onFetchContributorsFailure: (state) => {
      state.fetchContributorsState = LoadingStateEnum.FAILED;
    },
    // article count
    onFetchArticleCountLoading: (state) => {
      state.fetchArticleCountState = LoadingStateEnum.LOADING;
    },
    onFetchArticleCountSuccess: (state, action: PayloadAction<any>) => {
      state.fetchArticleCountState = LoadingStateEnum.DONE;
      state.articleCount = action.payload;
    },
    onFetchArticleCountFailure: (state) => {
      state.fetchArticleCountState = LoadingStateEnum.FAILED;
    },
    // all articles
    onFetchAllArticlesLoading: (state) => {
      state.fetchAllArticlesState = LoadingStateEnum.LOADING;
    },
    onFetchAllArticlesSuccess: (state, action: PayloadAction<any>) => {
      state.fetchAllArticlesState = LoadingStateEnum.DONE;
      const allArticleIds = state.allArticles.map((article) => article._id);
      state.allArticles = state.allArticles.concat(action.payload.filter((article) => !allArticleIds.includes(article._id)));
      state.deltaArticles = action.payload;
    },
    onFetchAllArticlesFailure: (state) => {
      state.fetchAllArticlesState = LoadingStateEnum.FAILED;
    },
    // delta articles
    onFetchDeltaArticlesLoading: (state) => {
      state.fetchDeltaArticlesState = LoadingStateEnum.LOADING;
      state.deltaArticles = [];
    },
    onFetchDeltaArticlesSuccess: (state, action: PayloadAction<any>) => {
      state.fetchDeltaArticlesState = LoadingStateEnum.DONE;
      state.allArticles = state.allArticles.concat(action.payload);
      state.deltaArticles = action.payload;
    },
    onFetchDeltaArticlesFailure: (state) => {
      state.fetchDeltaArticlesState = LoadingStateEnum.FAILED;
      state.deltaArticles = [];
    },
    // audio file info
    onFetchAudioFileInfoLoading: (state) => {
      state.fetchAudioFileInfoState = LoadingStateEnum.LOADING;
    },
    onFetchAudioFileInfoSuccess: (state, action: PayloadAction<any>) => {
      state.fetchAudioFileInfoState = LoadingStateEnum.DONE;
      state.audioInfo = action.payload;
    },
    onFetchAudioFileInfoFailure: (state) => {
      state.fetchAudioFileInfoState = LoadingStateEnum.FAILED;
    },
    // article video
    onFetchArticleVideoLoading: (state) => {
      state.fetchArticleVideoState = LoadingStateEnum.LOADING;
      state.articleVideo = {
        video: {},
        exported: false,
      };
    },
    onFetchArticleVideoSuccess: (state, action: PayloadAction<any>) => {
      state.fetchArticleVideoState = LoadingStateEnum.DONE;
      state.articleVideo = action.payload;
    },
    onFetchArticleVideoFailure: (state) => {
      state.fetchArticleVideoState = LoadingStateEnum.FAILED;
      state.articleVideo = {
        video: {},
        exported: false,
      };
    },
    // articleLastVideo
    onFetchArticleLastVideoLoading: (state) => {
      state.articleLastVideo = null;
    },
    onFetchArticleLastVideoSuccess: (state, action: PayloadAction<any>) => {
      state.articleLastVideo = action.payload;
    },
    onFetchArticleLastVideoFailure: (state) => {
      state.articleLastVideo = null;
    },
    // slide media duration
    onUpdateSlideMediaDurationSuccess(state, action: PayloadAction<any>) {
      const article = { ...state.article };
      const { durations, slideNumber } = action.payload;
      durations.forEach((duration, index) => {
        article.slides[slideNumber].media[index].time = duration;
        article.slidesHtml[slideNumber].media[index].time = duration;
      });

      state.article = article;
    },
    // upload slide audio
    onUploadSlideAudioLoading(state) {
      state.uploadSlideAudioLoadingState = LoadingStateEnum.LOADING;
      state.uploadSlideAudioError = "";
    },
    onUploadSlideAudioSuccess(state, action: PayloadAction<any>) {
      state.uploadSlideAudioLoadingState = LoadingStateEnum.DONE;
      state.uploadSlideAudioError = "";
      state.article = action.payload;
    },
    onUploadSlideAudioFailure(state, action: PayloadAction<any>) {
      state.uploadSlideAudioLoadingState = LoadingStateEnum.FAILED;
      state.uploadSlideAudioError = action.payload;
    },
    // Delete slide audio
    onDeleteSlideAudioLoading(state) {
      state.uploadSlideAudioLoadingState = LoadingStateEnum.LOADING;
      state.uploadSlideAudioError = "";
    },
    onDeleteSlideAudioSuccess(state, action: PayloadAction<any>) {
      state.uploadSlideAudioLoadingState = LoadingStateEnum.DONE;
      state.uploadSlideAudioError = "";
      state.article = action.payload;
    },
    onDeleteSlideAudioFailure(state, action: PayloadAction<any>) {
      state.uploadSlideAudioLoadingState = LoadingStateEnum.FAILED;
      state.uploadSlideAudioError = action.payload;
    },
    onSetUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    updateArticle: (state, action: PayloadAction<{ article: any }>) => {
      state.article = action.payload.article;
    },
    onResetUploadState: (state) => {
      state.uploadState = LoadingStateEnum.DONE;
      state.uploadStatus = null;
    },
    setPlaybackSpeed: (state, action: PayloadAction<{ playbackSpeed }>) => {
      state.playbackSpeed = action.payload.playbackSpeed;
    },
    resetPublishError(state) {
      state.publishArticleStatus = null;
      state.publishArticleError = null;
      state.publishArticleState = LoadingStateEnum.DONE;
    },
    clearConversionProgress(state) {
      state.conversionPercentage = {
        progress: 0,
        converted: false,
        title: '',
      };
      state.conversionPercentageState = LoadingStateEnum.DONE;
    }
  },
});

export default articleSlice.reducer;

// Action creators are generated for each case reducer function
export const {
  updateArticle,
  clearConversionProgress,
  setPlaybackSpeed,
  onResetUploadState,
  resetPublishError,
  onSetUploadProgress,
  onFetchArticleFailure,
  onFetchArticleLoading,
  onFetchArticleSuccess,
  onFetchTopArticlesFailure,
  onFetchTopArticlesLoading,
  onFetchTopArticlesSuccess,
  onUploadContentFailure,
  onUploadContentLoading,
  onUploadContentSuccess,
  onConversionProgressFailure,
  onConversionProgressLoading,
  onConversionProgressSuccess,
  onPublishArticleFailure,
  onPublishArticleLoading,
  onPublishArticleSuccess,
  onFetchContributorsFailure,
  onFetchContributorsLoading,
  onFetchContributorsSuccess,
  onFetchArticleCountFailure,
  onFetchArticleCountLoading,
  onFetchArticleCountSuccess,
  onFetchAllArticlesLoading,
  onFetchAllArticlesSuccess,
  onFetchAllArticlesFailure,
  onFetchDeltaArticlesFailure,
  onFetchDeltaArticlesLoading,
  onFetchDeltaArticlesSuccess,
  onFetchAudioFileInfoFailure,
  onFetchAudioFileInfoLoading,
  onFetchAudioFileInfoSuccess,
  onFetchArticleVideoLoading,
  onFetchArticleVideoSuccess,
  onFetchArticleVideoFailure,
  onFetchArticleLastVideoFailure,
  onFetchArticleLastVideoLoading,
  onFetchArticleLastVideoSuccess,
  onUpdateSlideMediaDurationSuccess,
  onUploadSlideAudioLoading,
  onUploadSlideAudioSuccess,
  onUploadSlideAudioFailure,
  onDeleteSlideAudioLoading,
  onDeleteSlideAudioSuccess,
  onDeleteSlideAudioFailure,
} = articleSlice.actions;

export const fetchArticle = createAsyncThunk(
  "article/fetchArticle",
  async (
    {
      title,
      mode,
      wikiSource,
    }: { title: string; mode: string; wikiSource: string },
    { dispatch }
  ) => {
    // fetch article
    const edit = mode !== "viewer";
    let url = `/api/wiki/article?title=${encodeURIComponent(
      title
    )}&edit=${edit}`;

    if (wikiSource) {
      url += `&wikiSource=${wikiSource}`;
    }

    dispatch(onFetchArticleLoading());

    try {
      const data = await httpGet(url).then(({ text }: any) => ({
        article: JSON.parse(text),
      }));

      dispatch(onFetchArticleSuccess(data.article));
    } catch (err: any) {
      console.log(err);
      dispatch(onFetchArticleFailure(err.reason));
    }
  }
);

export const fetchTopArticles = createAsyncThunk(
  "article/fetchTopArticles",
  async (_, { dispatch }) => {
    const url = "/api/articles/top?limit=100";
    dispatch(onFetchTopArticlesLoading());
    try {
      const data = await httpGet(url)
        .then(({ text }: any) => JSON.parse(text))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onFetchTopArticlesSuccess(data.articles));
    } catch (err: any) {
      console.log(err);
      dispatch(onFetchTopArticlesFailure(err.reason));
    }
  }
);

const makeFileUploadMethod =
  (method) =>
  (url, title, slideNumber, file, headers = {}) =>
    new Promise((resolve, reject) => {
      method(url)
        .set(headers)
        .field("title", title)
        .field("slideNumber", slideNumber)
        .attach("file", file)
        .on("progress", (event) => {
          const uploadStatus = event;
          return {
            uploadStatus,
          };
        })
        .end(makeCallback(resolve, reject));
    });

export const uploadContent = createAsyncThunk(
  "article/uploadContent",
  async (
    {
      title,
      slideNumber,
      file,
    }: { title: string; slideNumber: number; file: any },
    { dispatch }
  ) => {
    const url = "/api/upload/slide-audio";
    dispatch(onUploadContentLoading());
    try {
      const data = await makeFileUploadMethod(httpPost)(
        url,
        title,
        slideNumber,
        file
      ).then(({ body }: any) => ({
        uploadStatus: body,
      }));
      dispatch(onUploadContentSuccess(data.uploadStatus));
    } catch (err: any) {
      console.log(err);
      dispatch(onUploadContentFailure());
    }
  }
);

export const uploadImageUrl = createAsyncThunk(
  "article/uploadImageUrl",
  async (
    {
      title,
      wikiSource,
      slideNumber,
      url,
      mimetype,
    }: {
      title: string;
      wikiSource: string;
      slideNumber: number;
      url: string;
      mimetype: string;
    },
    { dispatch }
  ) => {
    const uploadUrl = "/api/wiki/article/imageUpload";

    const body = {
      title,
      wikiSource,
      slideNumber,
      url,
      mimetype,
    };

    dispatch(onUploadContentLoading());
    try {
      const data = await httpPost(uploadUrl, body)
        .then(({ body }: any) => ({
          uploadStatus: body,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onUploadContentSuccess(data.uploadStatus));
    } catch (err: any) {
      console.log(err);
      dispatch(onUploadContentFailure());
    }
  }
);

export const fetchConversionProgress = createAsyncThunk(
  "article/fetchConversionProgress",
  async (
    { title, wikiSource }: { title: string; wikiSource: string },
    { dispatch }
  ) => {
    const url = `/api/articles/progress?title=${title}&wikiSource=${wikiSource}`;

    dispatch(onConversionProgressLoading());
    try {
      const data = await httpGet(url)
        .then(({ text }: any) => JSON.parse(text))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onConversionProgressSuccess(data));
    } catch (err) {
      console.log(err);
      dispatch(onConversionProgressFailure());
    }
  }
);

export const publishArticle = createAsyncThunk(
  "article/publishArticle",
  async (
    { title, wikiSource }: { title: string; wikiSource: string },
    { dispatch }
  ) => {
    let url = `/api/articles/publish?title=${title}`;

    if (wikiSource) {
      url += `&wikiSource=${wikiSource}`;
    }

    dispatch(onPublishArticleLoading());

    try {
      const data = await httpGet(url)
        .then(({ text }: any) => text)
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onPublishArticleSuccess(data));
    } catch (err: any) {
      dispatch(onPublishArticleFailure(err.reason));
    }
  }
);

export const fetchContributors = createAsyncThunk(
  "article/fetchContributors",
  async ({ title }: { title: string }, { dispatch }) => {
    const url = `/api/articles/contributors?title=${title}`;

    dispatch(onFetchContributorsLoading());
    try {
      const data = await httpGet(url)
        .then(({ body }: any) => ({
          contributors: body.contributors,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onFetchContributorsSuccess(data.contributors));
    } catch (err) {
      console.log(err);
      dispatch(onFetchContributorsFailure());
    }
  }
);

export const fetchArticleCount = createAsyncThunk(
  "article/fetchArticleCount",
  async (wiki: string, { dispatch }) => {
    let url = `/api/articles/count`;
    if (wiki) url = `${url}?wiki=${wiki}`;
    dispatch(onFetchArticleCountLoading());
    try {
      const data = await httpGet(url)
        .then(({ body }: any) => ({
          count: body.count,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });

      dispatch(onFetchArticleCountSuccess(data.count));
    } catch (err) {
      console.log(err);
      dispatch(onFetchArticleCountFailure());
    }
  }
);

export const fetchAllArticles = createAsyncThunk(
  "article/fetchAllArticles",
  async ({ offset, wiki }: { offset: number; wiki: string }, { dispatch }) => {
    let url = `/api/articles/all?offset=${offset}`;
    if (wiki) url = `${url}&wiki=${wiki}`;

    dispatch(onFetchAllArticlesLoading());
    try {
      const data = await httpGet(url)
        .then(({ body }: any) => ({
          articles: body.articles,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onFetchAllArticlesSuccess(data.articles));
    } catch (err) {
      console.log(err);
      dispatch(onFetchAllArticlesFailure());
    }
  }
);

export const fetchDeltaArticles = createAsyncThunk(
  "article/fetchDeltaArticles",
  async ({ offset, wiki }: { offset: number; wiki: string }, { dispatch }) => {
    let url = `/api/articles/all?offset=${offset}`;
    if (wiki) url = `${url}&wiki=${wiki}`;

    dispatch(onFetchDeltaArticlesLoading());
    try {
      const data = await httpGet(url)
        .then(({ body }: any) => ({
          articles: body.articles,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onFetchDeltaArticlesSuccess(data.articles));
    } catch (err) {
      console.log(err);
      dispatch(onFetchDeltaArticlesFailure());
    }
  }
);

export const fetchImagesFromBing = createAsyncThunk(
  "article/fetchImagesFromBing",
  async (searchText: string) => {
    const url = `/api/articles/bing/images?searchTerm=${searchText}`;

    return await httpGet(url)
      .then(({ body }: any) => ({
        images: body.images,
      }))
      .catch((reason) => {
        throw { error: "FAILED", reason };
      });
  }
);

export const fetchGifsFromGiphy = createAsyncThunk(
  "article/fetchGifsFromGiphy",
  async (searchText: string) => {
    const url = `/api/articles/gifs?searchTerm=${searchText}`;

    return await httpGet(url)
      .then(({ body }: any) => ({
        gifs: body.gifs,
      }))
      .catch((reason) => {
        throw { error: "FAILED", reason };
      });
  }
);

export const fetchAudioFileInfo = createAsyncThunk(
  "article/fetchAudioFileInfo",
  async (file: any, { dispatch }) => {
    const url = `/api/articles/audios?filename=${file}`;
    dispatch(onFetchAudioFileInfoLoading());

    try {
      const data = await httpGet(url)
        .then(({ body }: any) => ({
          audioInfo: body.file,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onFetchAudioFileInfoSuccess(data.audioInfo));
    } catch (err) {
      console.log(err);
      dispatch(onFetchAudioFileInfoFailure());
    }
  }
);

export const fetchArticleVideo = createAsyncThunk(
  "article/fetchArticleVideo",
  async (
    { articleId, lang }: { articleId: string; lang: string },
    { dispatch }
  ) => {
    const url = `/api/videos/by_article_id/${articleId}?lang=${lang}`;
    dispatch(onFetchArticleVideoLoading());

    try {
      const data = await httpGet(url)
        .then(({ body }: any) => ({
          exported: body.exported,
          video: body.video,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onFetchArticleVideoSuccess(data));
    } catch (err) {
      console.log(err);
      dispatch(onFetchArticleVideoFailure());
    }
  }
);

export const fetchArticleVideoByArticleVersion = createAsyncThunk(
  "article/fetchArticleVideoByArticleVersion",
  async (
    {
      version,
      title,
      wikiSource,
      lang,
    }: { version: number; title: string; wikiSource: string; lang: string },
    { dispatch }
  ) => {
    const url = `/api/videos/by_article_version/${version}?title=${title}&wikiSource=${wikiSource}&lang=${lang}`;
    dispatch(onFetchArticleVideoLoading());

    try {
      const data = await httpGet(url)
        .then(({ body }: any) => ({
          exported: body.exported,
          video: body.video,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onFetchArticleVideoSuccess(data));
    } catch (err) {
      console.log(err);
      dispatch(onFetchArticleVideoFailure());
    }
  }
);

export const fetchVideoByArticleTitle = createAsyncThunk(
  "article/fetchVideoByArticleTitle",
  async (
    {
      title,
      wikiSource,
      lang,
    }: { title: string; wikiSource: string; lang: string },
    { dispatch }
  ) => {
    let url = `/api/videos/by_article_title?title=${encodeURIComponent(
      title
    )}&wikiSource=${wikiSource}`;
    if (lang) {
      url += `&lang=${lang}`;
    }

    dispatch(onFetchArticleLastVideoLoading());
    try {
      const data = await httpGet(url)
        .then(({ body }: any) => ({
          video: body.video,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onFetchArticleLastVideoSuccess(data.video));
    } catch (err) {
      console.log(err);
      dispatch(onFetchArticleLastVideoFailure());
    }
  }
);

export const updateSlideMediaDurations = createAsyncThunk(
  "article/updateSlideMediaDurations",
  async (
    {
      title,
      wikiSource,
      slideNumber,
      durations,
    }: {
      title: string;
      wikiSource: string;
      slideNumber: number;
      durations: any[];
    },
    { dispatch }
  ) => {
    const url = `/api/articles/media/durations`;
    const body = {
      title,
      wikiSource,
      slideNumber,
      durations,
    };

    try {
      const data = await httpPost(url, body)
        .then(({ body }: any) => body)
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onUpdateSlideMediaDurationSuccess(data));
    } catch (err) {
      console.log(err);
    }
  }
);

export const uploadSlideAudio = createAsyncThunk(
  "article/uploadSlideAudio",
  async (
    {
      title,
      wikiSource,
      slideNumber,
      blob,
      enableAudioProcessing,
    }: {
      title: string;
      wikiSource: string;
      slideNumber: number;
      blob: Blob;
      enableAudioProcessing: boolean;
    },
    { dispatch }
  ) => {
    const url = `/api/articles/audios`;

    dispatch(onUploadSlideAudioLoading());
    try {
      const data = await request
        .post(url)
        .field("title", title)
        .field("wikiSource", wikiSource)
        .field("position", slideNumber)
        .field("enableAudioProcessing", enableAudioProcessing)
        .field("file", blob)
        .then((res) => ({
          article: res.body.article,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onUploadSlideAudioSuccess(data.article));
    } catch (err: any) {
      console.log(err);
      dispatch(onUploadSlideAudioFailure(err.reason));
    }
  }
);

export const deleteSlideAudio = createAsyncThunk(
  "article/deleteSlideAudio",
  async (
    {
      title,
      wikiSource,
      slideNumber,
    }: { title: string; wikiSource: string; slideNumber: number },
    { dispatch }
  ) => {
    const url = `/api/articles/audios/${slideNumber}`;

    dispatch(onDeleteSlideAudioLoading());
    try {
      const data = await request
        .delete(url)
        .field("title", title)
        .field("wikiSource", wikiSource)
        .field("position", slideNumber)
        .then((res) => ({
          article: res.body.article,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onDeleteSlideAudioSuccess(data.article));
    } catch (err: any) {
      console.log(err);
      dispatch(onDeleteSlideAudioFailure(err.reason));
    }
  }
);
