import { Button } from "semantic-ui-react";
// TOOD: Find replacement for popup-tools if possible
import PopupTools from "popup-tools";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setToken, setUser, validateSession } from "../../slices/authSlice";
import { toast } from "react-toastify";
import { LANG_API_MAP } from "../../utils/config";

interface IAuthButtonsProps {
  fluid?: boolean;
  onAuth?: () => void;
  style?: any;
  target?: any;
  noMargen?: boolean;
}

const ENVIRONMENT = process.env.NODE_ENV;

const getUrlBase = (url, lang) => {
  if (ENVIRONMENT === "production") {
    url = `${LANG_API_MAP[lang]}${url.replace("/api/", `/${lang}/api/`)}`;
  } else {
    url = `${LANG_API_MAP[lang]}${url}`;
  }
  return url;
};

const AuthButtons = (props: IAuthButtonsProps) => {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.ui);

  const onLogin = () => {
    PopupTools.popup(
      getUrlBase("/auth/wiki", language),
      "Wiki Connect",
      { width: 1000, height: 600 },
      (err, data) => {
        if (!err) {
          console.log(" login response ", err, data);
          dispatch(setToken({ token: data.token }));
          dispatch(setUser({ user: data.user }));
          dispatch(validateSession());
          toast.success(
            "Awesome! You can now upload files to VideoWiki directly from your computer."
          );
          setTimeout(() => {
            window.location.reload();
          }, 3000);
          if (props.onAuth) {
            props.onAuth();
          }
        }
      }
    );
  };

  const onLoginNCCommons = () => {
    PopupTools.popup(
      getUrlBase("/auth/wiki/nccommons", language),
      "NCCommons Connect",
      { width: 1000, height: 600 },
      (err, data) => {
        if (!err) {
          console.log(" login response ", err, data);
          dispatch(setToken({ token: data.token }));
          dispatch(setUser({ user: data.user }));
          dispatch(validateSession());
          toast.success(
            "Awesome! You can now upload files to VideoWiki directly from your computer."
          );
          setTimeout(() => {
            window.location.reload();
          }, 3000);
          if (props.onAuth) {
            props.onAuth();
          }
        }
      }
    );
  };

  const { onAuth, noMargen, ...rest } = props;
  return (
    <div className={noMargen ? "" : "c-auth-buttons"}>
      {props.target === "nccommons" ? (
        <Button
          {...rest}
          primary
          className="c-auth-buttons__signup"
          onClick={onLoginNCCommons}
        >
          Register / Login with NC Commons
        </Button>
      ) : (
        <Button
          {...rest}
          primary
          className="c-auth-buttons__signup"
          onClick={onLogin}
        >
          Register / Login with Wikipedia
        </Button>
      )}
    </div>
  );
};

export default AuthButtons;