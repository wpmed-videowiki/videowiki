import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { LoadingStateEnum } from "../../types/types";
import { httpGet, httpPost } from "../apis/Common";
import websockets from "../websockets";

export interface AuthState {
  token: string | null;
  session: any;
  signupState: any;
  signupStatus: any;
  signupError: any;
  loginState: any;
  loginStatus: any;
  loginError: any;
  logoutState: LoadingStateEnum;
  resetState: any;
  verifyResetTokenState: LoadingStateEnum;
  verifyResetTokenError: any;
  updatePasswordState: LoadingStateEnum;
  updatePasswordStatus: any;
  youtubeAuthLink: string;
  youtubeChannelInfo: any;
}

const initialState: AuthState = {
  token: "",
  session: {
    anonymousId: "",
  },
  loginError: null,
  loginState: null,
  loginStatus: null,

  signupState: null,
  signupStatus: null,
  signupError: null,
  logoutState: LoadingStateEnum.LOADING,
  resetState: null,
  verifyResetTokenState: LoadingStateEnum.LOADING,
  verifyResetTokenError: null,
  updatePasswordState: LoadingStateEnum.LOADING,
  updatePasswordStatus: null,
  youtubeAuthLink: "",
  youtubeChannelInfo: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // signup
    onSignupLoading: (state) => {
      state.signupState = LoadingStateEnum.LOADING;
      state.signupStatus = null;
      state.signupError = null;
    },
    onSignupSuccess: (state, action: PayloadAction<any>) => {
      state.signupState = LoadingStateEnum.DONE;
      state.signupStatus = action.payload;
      state.signupError = null;
    },
    onSignupFailure: (state, action: PayloadAction<any>) => {
      state.signupState = LoadingStateEnum.FAILED;
      state.signupStatus = null;
      state.signupError = action.payload;
    },
    // login
    onLoginLoading: (state) => {
      state.loginState = LoadingStateEnum.LOADING;
      state.loginStatus = null;
      state.loginError = null;
    },
    onLoginSuccess: (state, action: PayloadAction<any>) => {
      state.loginStatus = action.payload.loginStatus;
      state.session = action.payload.session;
      state.loginState = LoadingStateEnum.DONE;
      state.loginError = null;
    },
    onLoginFailure: (state, action: PayloadAction<any>) => {
      state.loginState = LoadingStateEnum.FAILED;
      state.loginStatus = null;
      state.loginError = action.payload;
    },
    // logout
    onLogoutLoading: (state) => {
      state.logoutState = LoadingStateEnum.LOADING;
    },
    onLogoutSuccess: (state) => {
      state.logoutState = LoadingStateEnum.DONE;
      state.session = null;
    },
    onLogoutFailure: (state) => {
      state.logoutState = LoadingStateEnum.FAILED;
    },
    // validate session
    onValidateSessionLoading: (state) => {
      // state.session = null;
    },
    onValidateSessionSuccess: (state, action: PayloadAction<any>) => {
      state.session = action.payload.session || {};
      if (action.payload.session && action.payload.session.token) {
        state.token = action.payload.session.token;
        websockets.emitEvent(websockets.websocketsEvents.AUTHENTICATE, {
          token: action.payload.session.token,
        });
      } else {
        state.token = null;
      }
      if (
        (!action.payload.session || !action.payload.session.user) &&
        state.session
      ) {
        state.session.user = null;
      }
      if (!action.payload.session || !action.payload.session.token) {
        state.session.token = null;
      }
    },
    onValidateSessionFailure: (state) => {
      state.session = null;
      state.token = "";
    },
    // reset password
    onResetPasswordLoading: (state) => {
      state.resetState = LoadingStateEnum.LOADING;
    },
    onResetPasswordSuccess: (state) => {
      state.resetState = LoadingStateEnum.DONE;
    },
    onResetPasswordFailure: (state) => {
      state.resetState = LoadingStateEnum.FAILED;
    },
    // verify reset token
    onVerifyResetTokenLoading: (state) => {
      state.verifyResetTokenState = LoadingStateEnum.LOADING;
    },
    onVerfiyResetTokenSuccess: (state) => {
      state.verifyResetTokenState = LoadingStateEnum.DONE;
    },
    onVerifyResetTokenFailure: (state) => {
      state.verifyResetTokenState = LoadingStateEnum.FAILED;
    },
    // update password
    onUpdatePasswordLoading: (state) => {
      state.updatePasswordState = LoadingStateEnum.LOADING;
    },
    onUpdatePasswordSuccess: (state, action: PayloadAction<any>) => {
      state.updatePasswordState = LoadingStateEnum.DONE;
      state.updatePasswordStatus = action.payload;
    },
    onUpdatePasswordFailure: (state) => {
      state.updatePasswordState = LoadingStateEnum.FAILED;
    },
    onYouTubeAuthLinkSuccess: (state, action: PayloadAction<any>) => {
      state.youtubeAuthLink = action.payload.youtubeAuthLink;
    },
    setUser: (state, action: PayloadAction<{ user: any }>) => {
      state.session = {
        user: action.payload.user,
        token: action.payload.user && state.token ? state.token : "",
      };
      localStorage.setItem("session", JSON.stringify(state.session));
    },
    setToken: (state, action: PayloadAction<{ token: any }>) => {
      state.token = action.payload.token;
      localStorage.setItem("token", action.payload.token);
    },
    setYouTubeChannelInfo: (state, action: PayloadAction<any>) => {
      state.youtubeChannelInfo = action.payload;
    },
    setYouTubeAuthLink: (state, action: PayloadAction<any>) => {
      state.youtubeAuthLink = action.payload;
    },
  },
});

export default authSlice.reducer;

function handleError(response) {
  if (response.status === 401) {
    return { session: null };
  } else {
    throw { response };
  }
}

// Action creators are generated for each case reducer function
export const {
  setToken,
  setUser,
  setYouTubeChannelInfo,
  setYouTubeAuthLink,
  onSignupFailure,
  onSignupLoading,
  onSignupSuccess,
  onLoginFailure,
  onLoginLoading,
  onLoginSuccess,
  onLogoutFailure,
  onLogoutLoading,
  onLogoutSuccess,
  onValidateSessionFailure,
  onValidateSessionLoading,
  onValidateSessionSuccess,
  onResetPasswordFailure,
  onResetPasswordLoading,
  onResetPasswordSuccess,
  onVerfiyResetTokenSuccess,
  onVerifyResetTokenFailure,
  onVerifyResetTokenLoading,
  onUpdatePasswordFailure,
  onUpdatePasswordLoading,
  onUpdatePasswordSuccess,
  onYouTubeAuthLinkSuccess,
} = authSlice.actions;

export const signup = createAsyncThunk(
  "auth/signup",
  async (
    {
      email,
      password,
      firstName,
      lastName,
      captcha,
    }: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      captcha: string;
    },
    { dispatch }
  ) => {
    const url = "/api/auth/signup";
    const data = {
      email,
      password,
      firstName,
      lastName,
      captcha,
    };
    dispatch(onSignupLoading());
    try {
      const response = await httpPost(url, data)
        .then(({ body }: any) => ({
          signupStatus: body,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onSignupSuccess(response.signupStatus));
    } catch (err: any) {
      console.error(err);
      dispatch(onSignupFailure(err.reason));
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (
    {
      email,
      password,
      remember,
    }: { email: string; password: string; remember: boolean },
    { dispatch }
  ) => {
    const data = {
      email,
      password,
      remember,
    };

    const url = "/api/auth/login";
    dispatch(onLoginLoading());
    try {
      const response = await httpPost(url, data)
        .then(({ body }: any) => ({
          session: body,
        }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onLoginSuccess(response));
    } catch (err: any) {
      console.error(err);
      dispatch(onLoginFailure(err.reason));
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    const url = "/api/auth/logout";
    dispatch(onLogoutLoading());
    try {
      await httpGet(url).then(({ body }: any) => {
        return { logoutStatus: body };
      });
      dispatch(onLogoutSuccess());
    } catch (err) {
      console.error(err);
      dispatch(onLogoutFailure());
    }
  }
);

export const validateSession = createAsyncThunk(
  "auth/validateSession",
  async (_, { dispatch }) => {
    const url = "/api/auth/session";
    dispatch(onValidateSessionLoading());

    try {
      const response = await httpGet(url)
        .then(({ body }: any) => ({ session: body }))
        .catch(handleError);
      dispatch(onValidateSessionSuccess(response));
    } catch (err) {
      console.error(err);
      dispatch(onValidateSessionFailure());
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email }: { email: string }, { dispatch }) => {
    const url = `/api/auth/reset?email=${email}`;

    const data = {
      email,
    };

    dispatch(onResetPasswordLoading());
    try {
      await httpPost(url, data).then(({ body }: any) => ({
        resetStatus: body,
      }));
      dispatch(onResetPasswordSuccess());
    } catch (err) {
      console.error(err);
      dispatch(onResetPasswordFailure());
    }
  }
);

export const verifyResetToken = createAsyncThunk(
  "auth/verifyResetToken",
  async ({ email, token }: { email: string; token: string }, { dispatch }) => {
    const url = `/api/auth/reset/${email}/${token}`;

    dispatch(onVerifyResetTokenLoading());
    try {
      await httpGet(url)
        .then(({ body }: any) => ({ session: body }))
        .catch((reason) => {
          throw { error: "FAILED", reason };
        });
      dispatch(onVerfiyResetTokenSuccess());
    } catch (err) {
      console.error(err);
      dispatch(onVerifyResetTokenFailure());
    }
  }
);

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (
    { email, password }: { email: string; password: string },
    { dispatch }
  ) => {
    const url = `/api/auth/reset/${email}`;

    const data = {
      password,
    };

    try {
      const response = await httpPost(url, data).then(({ text }: any) => ({
        updatePasswordStatus: text,
      }));
      dispatch(onUpdatePasswordSuccess(response.updatePasswordStatus));
    } catch (err) {
      console.error(err);
      dispatch(onUpdatePasswordFailure());
    }
  }
);

export const generateYoutubeAuthLink = createAsyncThunk(
  "auth/generateYoutubeAuthLink",
  async ({ password }: { password: string }, { dispatch }) => {
    const url = `/api/auth/youtube/authenticate/generate`;

    const data = { password };
    try {
      const response = await httpPost(url, data).then(({ body }: any) => ({
        youtubeAuthLink: body.url,
      }));
      dispatch(setYouTubeAuthLink(response.youtubeAuthLink));
    } catch (err) {
      console.error(err);
    }
  }
);
