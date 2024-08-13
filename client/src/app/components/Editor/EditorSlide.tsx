import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { Message, Progress, Button, Icon, Popup } from "semantic-ui-react";
import classnames from "classnames";
import AudioPlayer from "./AudioPlayer";
import request from "../../utils/requestAgent";

import UploadFileInfoModal from "../common/UploadFileInfoModal";
import AuthModal from "../common/AuthModal";
import { getWikiFileExtension } from "../../utils/wikiUtils";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setShowReopenFormNotification } from "../../slices/uiSlice";
import { useTranslation } from "react-i18next";

let videoPlayer: any = null;
const ALLOWED_VIDEO_FORMATS = ["webm", "ogv"];

interface IEditorSlideProps {
  articleId: string;
  title: string;
  wikiSource: string;
  description: string;
  audio: string;
  media: string;
  mediaType: string;
  currentSlideIndex: number;
  onSlidePlayComplete: () => void;
  isPlaying: boolean;
  uploadContent: (...data: any) => void;
  mode: string;
  uploadState: string;
  uploadStatus: any;
  uploadProgress?: number;
  resetUploadState: () => void;
  playbackSpeed: number;
  isLoggedIn: boolean;
  editable: boolean;
  showTextTransition: boolean;
  muted: boolean;
  currentTime: number;
}

const EditorSlide = (data: IEditorSlideProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const { uploadToCommonsForms } = useAppSelector((state) => state.wiki);
  const { showReopenFormNotification } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const props = {
    ...data,
    uploadToCommonsForms,
    showReopenFormNotification,
  };

  const [state, updateState] = useState({
    fileUploadError: false,
    errorMessage: "",
    file: null,
    onDragOver: false,
    isFileUploadModalVisible: false,
    isUploadResume: false,
    isLoginModalVisible: false,
  });

  const setState = (data) => {
    updateState((state) => ({ ...state, ...data }));
  };

  const _onDragLeave = () => {
    setState({
      onDragOver: false,
    });
  };

  const _onDragOver = () => {
    setState({
      onDragOver: true,
    });
  };

  useEffect(() => {
    if (videoPlayer) {
      if (props.isPlaying) {
        videoPlayer.play();
      } else {
        videoPlayer.pause();
      }
    }
  }, [props.isPlaying]);

  useEffect(() => {
    setState({
      fileUploadError: false,
      errorMessage: "",
    });
    props.resetUploadState();
  }, [props.description]);

  const hasForm = () => {
    const { uploadToCommonsForms, currentSlideIndex, articleId } = props;

    return (
      uploadToCommonsForms[articleId] &&
      uploadToCommonsForms[articleId][currentSlideIndex]
    );
  };

  const _handleCommonsVideoDrop = (fileUrl, mimetype) => {
    request
      .post("/api/wiki/commons/video_by_name")
      .field("url", fileUrl)
      .then((response) => {
        console.log("response", response);
        _handleImageUrlDrop(response.body.url, mimetype);
      })
      .catch((err) => {
        toast.error("Oops, could fetch the video file, please try again");
      });
  };

  const _handleImageUrlDrop = (imageUrlToUpload, imageUrlMimetype) => {
    setState({
      fileUploadError: false,
      errorMessage: "",
      file: null,
    });

    props.uploadContent(null, imageUrlToUpload, imageUrlMimetype);
  };

  const _handleFileUpload = (acceptedFiles, rejectedFiles, evt) => {
    console.log("file dropped ", acceptedFiles, rejectedFiles, evt);
    const { uploadState } = props;
    if (rejectedFiles.length > 0) {
      const file = rejectedFiles[0];
      let errorMessage = "";

      if (file.size > 10 * 1024 * 1024) {
        errorMessage = "Max file size limit is 10MB!";
      } else if (
        file.type.indexOf("video") === -1 &&
        file.type.indexOf("image") === -1 &&
        file.type.indexOf("gif") === -1
      ) {
        // check if image dropped from container
        if (evt && evt.dataTransfer && evt.dataTransfer.getData("text/html")) {
          const imageElement = evt.dataTransfer.getData("text/html");

          console.log("image data ", evt.dataTransfer.getData("text/html"));
          const urlRex = /data-orig="?([^"\s]+)"?\s*/;
          // const descriptionUrlRex = /data-orig-desc="?([^"\s]+)"?\s*/
          const mimetypeRex = /data-orig-mimetype="?([^"\s]+)"?\s*/;

          const url = urlRex.exec(imageElement);
          // const descriptionUrl = descriptionUrlRex.exec(imageElement)
          const mimetype = mimetypeRex.exec(imageElement);

          if (url && url[1] && mimetype && mimetype[1]) {
            return _handleImageUrlDrop(url[1], mimetype[1]);
          }

          const commonsReg =
            /src=\"https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/([^"\s]+)"?\s*/;
          // If no match on data-orig, check if it's a commons url
          if (imageElement.match(commonsReg).length === 2) {
            let commonsUrl = "";
            let commonsMimetype = "";
            const commonsMatch = imageElement.match(commonsReg);
            // Remove trailing backslash /
            if (
              commonsMatch[1].trim().lastIndexOf("/") === commonsMatch[1].length
            ) {
              commonsMatch[1] = commonsMatch[1]
                .trim()
                .substr(0, commonsMatch[1].trim().lastIndexOf("/"));
            }
            let urlParts = commonsMatch[1].split("/");
            const extension = getWikiFileExtension(urlParts.join("/"));
            if (extension === "gif") {
              // it's a gif
              commonsMimetype = "image/gif";
              // urlParts.unshift('thumb');
            } else if (ALLOWED_VIDEO_FORMATS.indexOf(extension) !== -1) {
              // It's a video
              urlParts = urlParts.filter((part) => part !== "thumb");
              // Keep only the first 3 parts of the url
              // 2 parts for the directory, last part for the file name
              while (urlParts.length > 3) {
                urlParts.pop();
              }
              commonsMimetype = `video/${extension}`;
              urlParts.unshift(
                "https://upload.wikimedia.org/wikipedia/commons"
              );
              _handleImageUrlDrop(urlParts.join("/"), commonsMimetype);
              return;
            } else {
              // It's an image
              if (urlParts[0] !== "thumb") {
                urlParts.unshift("thumb");
              }
              // Check if it's already a thumbnail of the image
              if (
                urlParts[urlParts.length - 1].match(/^[0-9]+px-/).length === 0
              ) {
                urlParts.push(`400px-${urlParts[urlParts.length - 1]}`);
              } else {
                const oldFileName = urlParts.pop();
                urlParts.push(oldFileName.replace(/^[0-9]+px-/, "400px-"));
              }
              commonsMimetype = `image/${extension}`;
            }
            urlParts.unshift("https://upload.wikimedia.org/wikipedia/commons");
            commonsUrl = urlParts.join("/");
            _handleImageUrlDrop(commonsUrl, commonsMimetype);
          }
        } else {
          errorMessage = "Only images and videos can be uploaded!";
        }
      }

      setState({
        fileUploadError: true,
        errorMessage,
        file: null,
      });
    } else {
      if (!props.isLoggedIn) {
        setState({ isLoginModalVisible: true });
        // NotificationManager.info('Only logged in users can upload files directly. A good chance to sign up! ')
        return;
      }

      if (acceptedFiles[0] && acceptedFiles[0].type.indexOf("video") > -1) {
        const videoFormat = acceptedFiles[0].type.split("/")[1];

        if (ALLOWED_VIDEO_FORMATS.indexOf(videoFormat) === -1) {
          toast.error("Please upload videos with WebM or Ogv file format only");
          return;
        }
      }

      if (acceptedFiles.length > 0 && uploadState === "loading") {
        toast.info("An upload is already in progress, please hold");
        return;
      }

      setState({
        fileUploadError: false,
        errorMessage: "",
        file: acceptedFiles[0],
      });

      // TODO: upload to server
      if (acceptedFiles.length > 0) {
        setState({ isFileUploadModalVisible: true });
      }
    }
  };

  const _handleDismiss = () => {
    setState({
      fileUploadError: false,
    });
  };

  const _handleFileUploadModalClose = () => {
    if (props.showReopenFormNotification) {
      toast.info(t("Edior.reopen_form"));
      dispatch(setShowReopenFormNotification(false));
    }
    setState({ isFileUploadModalVisible: false, isUploadResume: false });
  };

  const _renderFileUploadModal = () => {
    if (!state.isFileUploadModalVisible) return;
    return (
      <UploadFileInfoModal
        articleId={props.articleId}
        currentSlideIndex={props.currentSlideIndex}
        title={props.title}
        wikiSource={props.wikiSource}
        visible={state.isFileUploadModalVisible}
        isUploadResume={state.isUploadResume}
        file={state.file}
        onClose={() => _handleFileUploadModalClose()}
      />
    );
  };

  const _renderLoginModal = () => {
    return (
      <AuthModal
        open={state.isLoginModalVisible}
        onClose={() => setState({ isLoginModalVisible: false })}
        target=""
      />
    );
  };

  const _renderFileUploadErrorMessage = () => {
    const { errorMessage } = state;

    return state.fileUploadError ? (
      <Message
        negative
        className="c-editor-message"
        onDismiss={() => _handleDismiss()}
        content={errorMessage}
      />
    ) : null;
  };

  const _renderLoading = (boxClassnames) => {
    if (props.uploadProgress === 100) {
      return (
        <div className={boxClassnames}>
          <div className="box__input">
            <svg
              className="box__icon"
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="43"
              viewBox="0 0 50 43"
            >
              <path d="M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6h-43.3v-11.6c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v13.2c0 .9.7 1.7 1.7 1.7h46.7c.9 0 1.7-.7 1.7-1.7v-13.2c0-1-.7-1.7-1.7-1.7zm-24.5 6.1c.3.3.8.5 1.2.5.4 0 .9-.2 1.2-.5l10-11.6c.7-.7.7-1.7 0-2.4s-1.7-.7-2.4 0l-7.1 8.3v-25.3c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v25.3l-7.1-8.3c-.7-.7-1.7-.7-2.4 0s-.7 1.7 0 2.4l10 11.6z" />
            </svg>
            <label>Saving file...</label>
          </div>
        </div>
      );
    } else {
      const progress = Math.floor(props.uploadProgress || 0);
      return (
        <div className={boxClassnames}>
          <div className="box__input">
            <svg
              className="box__icon"
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="43"
              viewBox="0 0 50 43"
            >
              <path d="M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6h-43.3v-11.6c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v13.2c0 .9.7 1.7 1.7 1.7h46.7c.9 0 1.7-.7 1.7-1.7v-13.2c0-1-.7-1.7-1.7-1.7zm-24.5 6.1c.3.3.8.5 1.2.5.4 0 .9-.2 1.2-.5l10-11.6c.7-.7.7-1.7 0-2.4s-1.7-.7-2.4 0l-7.1 8.3v-25.3c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v25.3l-7.1-8.3c-.7-.7-1.7-.7-2.4 0s-.7 1.7 0 2.4l10 11.6z" />
            </svg>
            <Progress
              className="c-upload-progress"
              percent={progress}
              progress
              indicating
            />
            <label>Uploading...</label>
          </div>
        </div>
      );
    }
  };

  const _renderDefaultContent = () => {
    const { isPlaying, media, mediaType, uploadState } = props;

    const boxClassnames = classnames("c-editor__content-default", {
      box__hover: state.onDragOver,
    });

    if (uploadState === "loading") {
      return _renderLoading(boxClassnames);
    }

    if (uploadState === "failed") {
      return (
        <div className={boxClassnames}>
          <div className="box__input">
            <svg
              className="box__icon"
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="43"
              viewBox="0 0 50 43"
            >
              <path d="M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6h-43.3v-11.6c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v13.2c0 .9.7 1.7 1.7 1.7h46.7c.9 0 1.7-.7 1.7-1.7v-13.2c0-1-.7-1.7-1.7-1.7zm-24.5 6.1c.3.3.8.5 1.2.5.4 0 .9-.2 1.2-.5l10-11.6c.7-.7.7-1.7 0-2.4s-1.7-.7-2.4 0l-7.1 8.3v-25.3c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v25.3l-7.1-8.3c-.7-.7-1.7-.7-2.4 0s-.7 1.7 0 2.4l10 11.6z" />
            </svg>
            <label>Error while uploading! Please try again!</label>
          </div>
        </div>
      );
    }

    return mediaType === "video" ? (
      <video
        autoPlay={isPlaying}
        ref={(videoPlayer) => {
          videoPlayer = videoPlayer;
        }}
        muted={true}
        className="c-editor__content-video"
        src={media}
      />
    ) : mediaType === "image" || mediaType === "gif" ? (
      <img className="c-editor__content-image" src={media} />
    ) : (
      <div className={boxClassnames}>
        <div className="box__input">
          <svg
            className="box__icon"
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="43"
            viewBox="0 0 50 43"
          >
            <path d="M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6h-43.3v-11.6c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v13.2c0 .9.7 1.7 1.7 1.7h46.7c.9 0 1.7-.7 1.7-1.7v-13.2c0-1-.7-1.7-1.7-1.7zm-24.5 6.1c.3.3.8.5 1.2.5.4 0 .9-.2 1.2-.5l10-11.6c.7-.7.7-1.7 0-2.4s-1.7-.7-2.4 0l-7.1 8.3v-25.3c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v25.3l-7.1-8.3c-.7-.7-1.7-.7-2.4 0s-.7 1.7 0 2.4l10 11.6z" />
          </svg>
          <label>Choose a file or drag it here.</label>
        </div>
      </div>
    );
  };

  const _renderDropzone = () => {
    return props.mode === "editor" && props.editable ? (
      <Dropzone
        // TODO: Check this
        // accept={{ "image/*": ['test'], "video/*": true, "gif/*": true }}
        onDrop={_handleFileUpload}
        maxSize={10 * 1024 * 1024}
        multiple={false}
        onDragOver={_onDragOver}
        onDragLeave={_onDragLeave}
      >
        {({ getRootProps, getInputProps }) => (
          <section className="c-editor__content--dropzone">
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {_renderDefaultContent()}
            </div>
          </section>
        )}
      </Dropzone>
    ) : (
      <div className="c-editor__content--dropzone">
        {_renderDefaultContent()}
      </div>
    );
  };

  const {
    description,
    audio,
    onSlidePlayComplete,
    isPlaying,
    playbackSpeed,
    muted,
  } = props;

  return (
    <div className="c-editor__content-area">
      {hasForm() && (
        <Popup
          position="bottom right"
          trigger={
            <Button
              icon
              className="c-editor__resume-edit-btn"
              onClick={() =>
                setState({
                  isFileUploadModalVisible: true,
                  isUploadResume: true,
                })
              }
            >
              <Icon name="newspaper" />
            </Button>
          }
          content="Show form"
        />
      )}
      {_renderFileUploadErrorMessage()}
      <div className="c-editor__content--media">{_renderDropzone()}</div>
      <AudioPlayer
        description={description}
        audio={audio}
        muted={muted}
        showTextTransition={props.showTextTransition}
        onSlidePlayComplete={onSlidePlayComplete}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        onTimeUpdate={setCurrentTime}
      />
      {_renderFileUploadModal()}
      {_renderLoginModal()}
    </div>
  );
};

export default EditorSlide;
