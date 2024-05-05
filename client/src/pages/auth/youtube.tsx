import React from "react";
import { Image, Button, Form } from "semantic-ui-react";
import PopupTools from "popup-tools";
import "./style.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  generateYoutubeAuthLink,
  setYouTubeChannelInfo,
} from "../../app/slices/authSlice";
import { toast } from "react-toastify";

const YouTubeAuthPage = () => {
  const [password, setPassword] = React.useState("");

  const { youtubeAuthLink, youtubeChannelInfo } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();

  const onLogin = () => {
    PopupTools.popup(
      youtubeAuthLink,
      "Connect Youtube",
      { width: 1000, height: 600 },
      (err, data) => {
        if (!err) {
          toast.success("Youtube connected succesfully");
          dispatch(setYouTubeChannelInfo(data.channelData));
        }
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(generateYoutubeAuthLink({ password }));
  };

  return (
    <div className="auth-youtube-form-container">
      {youtubeAuthLink ? (
        <div>
          <a onClick={onLogin}>Connect Channel</a>
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Form.Field>
            <label>Password</label>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </Form.Field>
          <Button type="submit">Submit</Button>
        </Form>
      )}
      {youtubeChannelInfo ? (
        <div className="channel-info">
          <Image src={youtubeChannelInfo.thumbnail} avatar />
          <span>{youtubeChannelInfo.title}</span>
        </div>
      ) : null}
    </div>
  );
};

export default YouTubeAuthPage;
