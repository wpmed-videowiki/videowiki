import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { LoadingStateEnum } from "../../types/types";
import { httpGet } from "../apis/Common";

export interface WikiState {
  isSearchResultLoading: boolean;
  fetchCategoriesFromWikimediaCommonsState: LoadingStateEnum;
  fetchImagesFromWikimediaCommonsState: LoadingStateEnum;
  fetchGifsFromWikimediaCommonsState: LoadingStateEnum;
  fetchVideosFromWikimediaCommonsState: LoadingStateEnum;
  searchCategories: any[];
  searchImages: any[];
  searchGifs: any[];
  searchVideos: any[];
  searchResults: any[];
  searchResultState: LoadingStateEnum;
  wikiContentState: LoadingStateEnum;
  wikiContent: string;
  wikiSource: string;
  convertState: LoadingStateEnum;
  convertError: any;
  infoboxState: LoadingStateEnum;
  infobox: any;
  /*
    Persists the values in the upload form for each slide
    Format:
    uploadToCommonsForms: {
      [articleId]: {
        [slideIndex]: {
          [field]: value
        }
      }
    }
  */
  uploadToCommonsForms: any;
  forms: any[];
  wikiProgress: any;
}

const initialState: WikiState = {
  isSearchResultLoading: false,
  fetchCategoriesFromWikimediaCommonsState: LoadingStateEnum.DONE,
  fetchImagesFromWikimediaCommonsState: LoadingStateEnum.DONE,
  fetchGifsFromWikimediaCommonsState: LoadingStateEnum.DONE,
  fetchVideosFromWikimediaCommonsState: LoadingStateEnum.DONE,
  searchCategories: [],
  searchImages: [],
  searchGifs: [],
  searchVideos: [],
  searchResults: [],
  searchResultState: LoadingStateEnum.DONE,
  wikiContentState: LoadingStateEnum.DONE,
  wikiContent: "",
  wikiSource: "",
  convertState: LoadingStateEnum.DONE,
  convertError: null,
  infoboxState: LoadingStateEnum.DONE,
  infobox: null,
  uploadToCommonsForms: {},
  forms: [],
  wikiProgress: null,
};

export const wikiSlice = createSlice({
  name: "wiki",
  initialState,
  reducers: {
    // search wiki
    onSearchWikiLoading: (state) => {
      state.isSearchResultLoading = true;
      state.searchResultState = LoadingStateEnum.LOADING;
    },
    onSearchWikiSuccess: (state, action: PayloadAction<any>) => {
      state.isSearchResultLoading = false;
      state.searchResultState = LoadingStateEnum.DONE;
      state.searchResults = action.payload;
    },
    onSearchWikiFailure: (state) => {
      state.isSearchResultLoading = false;
      state.searchResultState = LoadingStateEnum.FAILED;
      state.searchResults = [];
    },
    // fetch images from wikimedia commons
    onFetchImagesFromWikimediaCommonsLoading: (state) => {
      state.fetchImagesFromWikimediaCommonsState = LoadingStateEnum.LOADING;
    },
    onFetchImagesFromWikimediaCommonsSuccess: (
      state,
      action: PayloadAction<any>
    ) => {
      state.fetchImagesFromWikimediaCommonsState = LoadingStateEnum.DONE;
      state.searchImages = action.payload;
    },
    onFetchImagesFromWikimediaCommonsFailure: (state) => {
      state.fetchImagesFromWikimediaCommonsState = LoadingStateEnum.FAILED;
    },
    // fetch gifs from wikimedia commons
    onFetchGifsFromWikimediaCommonsLoading: (state) => {
      state.fetchGifsFromWikimediaCommonsState = LoadingStateEnum.LOADING;
    },
    onFetchGifsFromWikimediaCommonsSuccess: (
      state,
      action: PayloadAction<any>
    ) => {
      state.fetchGifsFromWikimediaCommonsState = LoadingStateEnum.DONE;
      state.searchGifs = action.payload;
    },
    onFetchGifsFromWikimediaCommonsFailure: (state) => {
      state.fetchGifsFromWikimediaCommonsState = LoadingStateEnum.FAILED;
    },
    // fetch videos from wikimedia commons
    onFetchVideosFromWikimediaCommonsLoading: (state) => {
      state.fetchVideosFromWikimediaCommonsState = LoadingStateEnum.LOADING;
    },
    onFetchVideosFromWikimediaCommonsSuccess: (
      state,
      action: PayloadAction<any>
    ) => {
      state.fetchVideosFromWikimediaCommonsState = LoadingStateEnum.DONE;
      state.searchVideos = action.payload;
    },
    onFetchVideosFromWikimediaCommonsFailure: (state) => {
      state.fetchVideosFromWikimediaCommonsState = LoadingStateEnum.FAILED;
    },
    // fetch categories from wikimedia commons
    onFetchCategoriesFromWikimediaCommonsLoading: (state) => {
      state.fetchCategoriesFromWikimediaCommonsState = LoadingStateEnum.LOADING;
    },
    onFetchCategoriesFromWikimediaCommonsSuccess: (
      state,
      action: PayloadAction<any>
    ) => {
      state.fetchCategoriesFromWikimediaCommonsState = LoadingStateEnum.DONE;
      state.searchCategories = action.payload;
    },
    onFetchCategoriesFromWikimediaCommonsFailure: (state) => {
      state.fetchCategoriesFromWikimediaCommonsState = LoadingStateEnum.FAILED;
    },
    // fetch wiki page
    onFetchWikiContentLoading: (state) => {
      state.wikiContentState = LoadingStateEnum.LOADING;
      state.wikiContent = "";
      state.wikiSource = "";
    },
    onFetchWikiContentSuccess: (state, action: PayloadAction<any>) => {
      state.wikiContentState = LoadingStateEnum.DONE;
      state.wikiContent = action.payload.wikiContent;
      state.wikiSource = action.payload.wikiSource;
    },
    onFetchWikiContentFailure: (state) => {
      state.wikiContentState = LoadingStateEnum.FAILED;
      state.wikiContent = "";
      state.wikiSource = "";
    },
    // convert wiki
    onConvertWikiLoading: (state) => {
      state.convertState = LoadingStateEnum.LOADING;
      state.convertError = null;
    },
    onConvertWikiSuccess: (state) => {
      state.convertState = LoadingStateEnum.DONE;
      state.convertError = null;
    },
    onConvertWikiFailure: (state, action: PayloadAction<any>) => {
      state.convertState = LoadingStateEnum.FAILED;
      state.convertError = action.payload;
    },
    // get conversion status
    onGetConversionStatusSuccesss: (state, action: PayloadAction<any>) => {
      state.wikiProgress = action.payload;
    },
    // get info box
    onGetInfoboxLoading: (state) => {
      state.infoboxState = LoadingStateEnum.LOADING;
    },
    onGetInfoboxSuccess: (state, action: PayloadAction<any>) => {
      state.infoboxState = LoadingStateEnum.DONE;
      state.infobox = action.payload;
    },
    onGetInfoboxFailure: (state) => {
      state.infoboxState = LoadingStateEnum.FAILED;
    },
    // article forms
    onGetArticleFormsSuccess: (state, action: PayloadAction<any>) => {
      state.forms = action.payload;
    },
    updateCommonsUploadFormField: (
      state,
      action: PayloadAction<{
        articleId: string;
        slideIndex: number;
        update: any;
      }>
    ) => {
      const { articleId, slideIndex, update } = action.payload;
      state.uploadToCommonsForms = {
        ...state.uploadToCommonsForms,
        [articleId]: {
          ...(state.uploadToCommonsForms[articleId] || {}),
          [slideIndex]: {
            ...((state.uploadToCommonsForms[articleId] &&
              state.uploadToCommonsForms[articleId][slideIndex]) ||
              {}),
            ...update,
          },
        },
      };
    },
    clearSlideForm: (
      state,
      action: PayloadAction<{ articleId; slideIndex }>
    ) => {
      const { articleId, slideIndex } = action.payload;
      if (
        state.uploadToCommonsForms[articleId] &&
        state.uploadToCommonsForms[articleId][slideIndex]
      ) {
        delete state.uploadToCommonsForms[articleId][slideIndex];
        state.uploadToCommonsForms = {
          ...state.uploadToCommonsForms,
        };
      }
    },
    resetSearchBar: (state) => {
      state.isSearchResultLoading = false;
      state.searchResultState = LoadingStateEnum.LOADING;
      state.searchResults = [];
    },
  },
});

export default wikiSlice.reducer;

// Action creators are generated for each case reducer function
export const {
  clearSlideForm,
  resetSearchBar,
  onSearchWikiFailure,
  onSearchWikiLoading,
  onSearchWikiSuccess,
  onConvertWikiFailure,
  onConvertWikiLoading,
  onConvertWikiSuccess,
  onFetchCategoriesFromWikimediaCommonsFailure,
  onFetchCategoriesFromWikimediaCommonsLoading,
  onFetchCategoriesFromWikimediaCommonsSuccess,
  onFetchGifsFromWikimediaCommonsFailure,
  onFetchGifsFromWikimediaCommonsLoading,
  onFetchGifsFromWikimediaCommonsSuccess,
  onFetchImagesFromWikimediaCommonsFailure,
  onFetchImagesFromWikimediaCommonsLoading,
  onFetchImagesFromWikimediaCommonsSuccess,
  onFetchVideosFromWikimediaCommonsFailure,
  onFetchVideosFromWikimediaCommonsLoading,
  onFetchVideosFromWikimediaCommonsSuccess,
  onFetchWikiContentFailure,
  onFetchWikiContentLoading,
  onFetchWikiContentSuccess,
  onGetArticleFormsSuccess,
  onGetConversionStatusSuccesss,
  onGetInfoboxFailure,
  onGetInfoboxLoading,
  onGetInfoboxSuccess,
  updateCommonsUploadFormField,
} = wikiSlice.actions;

export const searchWiki = createAsyncThunk(
  "wiki/searchWiki",
  async (
    { searchText, wikiSource }: { searchText: string; wikiSource: string },
    { dispatch }
  ) => {
    if (wikiSource === "https://mdwiki.org") {
      searchText = searchText.replace(/_/g, " ");
    }
    if (!wikiSource && searchText.toLowerCase().startsWith("video:")) {
      wikiSource = "https://mdwiki.org";
      searchText = searchText.replace(/_/g, " ");
    }
    let url = `/api/wiki/search?searchTerm=${encodeURIComponent(searchText)}`;

    if (wikiSource) {
      url += `&wikiSource=${wikiSource}`;
    }

    dispatch(onSearchWikiLoading());

    try {
      const response = await httpGet(url).then(({ body }: any) => ({
        searchResults: body.searchResults,
      }));
      dispatch(onSearchWikiSuccess(response.searchResults));
    } catch (err) {
      console.error(err);
      dispatch(onSearchWikiFailure());
    }
  }
);

export const fetchImagesFromWikimediaCommons = createAsyncThunk(
  "wiki/fetchImagesFromWikimediaCommons",
  async ({ searchText }: { searchText: string }, { dispatch }) => {
    const url = `/api/wiki/wikimediaCommons/images?searchTerm=${searchText}`;

    dispatch(onFetchImagesFromWikimediaCommonsLoading());
    try {
      const response = await httpGet(url)
        .then(({ body }: any) => ({
          images: body.images,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onFetchImagesFromWikimediaCommonsSuccess(response.images));
    } catch (err) {
      console.error(err);
      dispatch(onFetchImagesFromWikimediaCommonsFailure());
    }
  }
);

export const fetchGifsFromWikimediaCommons = createAsyncThunk(
  "wiki/fetchGifsFromWikimediaCommons",
  async ({ searchText }: { searchText: string }, { dispatch }) => {
    const url = `/api/wiki/wikimediaCommons/gifs?searchTerm=${searchText}`;

    dispatch(onFetchGifsFromWikimediaCommonsLoading());
    try {
      const response = await httpGet(url)
        .then(({ body }: any) => ({
          gifs: body.gifs,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onFetchGifsFromWikimediaCommonsSuccess(response.gifs));
    } catch (err) {
      console.error(err);
      dispatch(onFetchGifsFromWikimediaCommonsFailure());
    }
  }
);

export const fetchVideosFromWikimediaCommons = createAsyncThunk(
  "wiki/fetchVideosFromWikimediaCommons",
  async ({ searchText }: { searchText: string }, { dispatch }) => {
    const url = `/api/wiki/wikimediaCommons/videos?searchTerm=${searchText}`;

    dispatch(onFetchVideosFromWikimediaCommonsLoading());
    try {
      const response = await httpGet(url)
        .then(({ body }: any) => ({
          videos: body.videos,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onFetchVideosFromWikimediaCommonsSuccess(response.videos));
    } catch (err) {
      console.error(err);
      dispatch(onFetchVideosFromWikimediaCommonsFailure());
    }
  }
);

export const fetchCategoriesFromWikimediaCommons = createAsyncThunk(
  "wiki/fetchCategoriesFromWikimediaCommons",
  async ({ searchText }: { searchText: string }, { dispatch }) => {
    const url = `/api/wiki/wikimediaCommons/categories?searchTerm=${searchText}`;

    dispatch(onFetchCategoriesFromWikimediaCommonsLoading());
    try {
      const response = await httpGet(url)
        .then(({ body }: any) => ({
          categories: body.categories,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(
        onFetchCategoriesFromWikimediaCommonsSuccess(response.categories)
      );
    } catch (err) {
      console.error(err);
      dispatch(onFetchCategoriesFromWikimediaCommonsFailure());
    }
  }
);

export const fetchWikiPage = createAsyncThunk(
  "wiki/fetchWikiPage",
  async (
    { title, wikiSource }: { title: string; wikiSource: string },
    { dispatch }
  ) => {
    let url = `/api/wiki?title=${encodeURIComponent(title)}`;

    if (wikiSource) {
      url += `&wikiSource=${wikiSource}`;
    }

    dispatch(onFetchWikiContentLoading());

    try {
      const response = await httpGet(url).then(({ body }: any) => ({
        wikiContent: body.wikiContent ? body.wikiContent : JSON.stringify(body),
        wikiSource: body.wikiSource ? body.wikiSource : "",
      }));
      dispatch(onFetchWikiContentSuccess(response));
    } catch (err) {
      dispatch(onFetchWikiContentFailure());
    }
  }
);

export const convertWiki = createAsyncThunk(
  "wiki/convertWiki",
  async (
    { title, wikiSource }: { title: string; wikiSource: string },
    { dispatch }
  ) => {
    let url = `/api/wiki/convert?title=${encodeURIComponent(title)}`;

    if (wikiSource) {
      url += `&wikiSource=${wikiSource}`;
    }

    dispatch(onConvertWikiLoading());
    try {
      const response = await httpGet(url)
        .then(({ body }: any) => ({
          wikiConvert: body,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onConvertWikiSuccess());
    } catch (err: any) {
      console.error(err);
      dispatch(onConvertWikiFailure(err.reason));
    }
  }
);

export const getConversionState = createAsyncThunk(
  "wiki/getConversionState",
  async ({ title }: { title: string }, { dispatch }) => {
    const url = `/api/wiki/convert/status?title=${encodeURIComponent(title)}`;

    try {
      const response = await httpGet(url).then(({ body }: any) => ({
        wikiProgress: body,
      }));
      dispatch(onGetConversionStatusSuccesss(response.wikiProgress));
    } catch (err) {
      console.error(err);
    }
  }
);

export const getInfoBox = createAsyncThunk(
  "wiki/getInfoBox",
  async (
    { title, wikiSource }: { title: string; wikiSource: string },
    { dispatch }
  ) => {
    let url = `/api/wiki/infobox?title=${encodeURIComponent(title)}`;

    if (wikiSource) {
      url += `&wikiSource=${wikiSource}`;
    }

    dispatch(onGetInfoboxLoading());
    try {
      const response = await httpGet(url)
        .then(({ body }: any) => ({
          infobox: body.infobox,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onGetInfoboxSuccess(response.infobox));
    } catch (err) {
      console.error(err);
      dispatch(onGetInfoboxFailure());
    }
  }
);

export const getArticleForms = createAsyncThunk(
  "wiki/getArticleForms",
  async ({ title }: { title: string }, { dispatch }) => {
    const url = `/api/wiki/forms?title=${title}`;

    try {
      const response = await httpGet(url)
        .then(({ body }: any) => ({
          forms: body.forms,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onGetArticleFormsSuccess(response.forms));
    } catch (err) {
      console.error(err);
    }
  }
);
