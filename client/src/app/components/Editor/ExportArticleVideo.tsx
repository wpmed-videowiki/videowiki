import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";

import {
  Icon,
  Popup,
  Dropdown,
  Modal,
  Button,
  Checkbox,
  Input,
} from "semantic-ui-react";
import { othersworkLicenceOptions } from "../common/licenceOptions";
import queryString from "query-string";
import AuthModal from "../common/AuthModal";
import fileUtils from "../../utils/fileUtils";

import AddHumanVoiceModal from "./modals/AddHumanVoiceModal";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { toast } from "react-toastify";
import { exportArticleToVideo } from "../../slices/videoSlice";
import { clearSlideForm } from "../../slices/wikiSlice";

const UPLOAD_FORM_INITIAL_VALUES = {
  licence: othersworkLicenceOptions[2].value,
  licenceText: othersworkLicenceOptions[2].text,
  licenceSection: othersworkLicenceOptions[2].section,
  source: "others",
  sourceUrl: location.href,
};
interface IExportArticleVideoProps {
  fetchArticleVideoState: string;
  articleVideo: any;
  articleLastVideo: any;
  title: string;
  wikiSource: string;
  authenticated: boolean;
  isExportable: boolean;
  articleId: string;
  onOpen: () => void;
}

const ExportArticleVideo = (data: IExportArticleVideoProps) => {
  const video = useAppSelector((state) => state.video);
  const { article } = useAppSelector((state) => state.article);
  const { language } = useAppSelector((state) => state.ui);
  const { session } = useAppSelector((state) => state.auth);

  const [state, updateState] = useState<any>({
    open: false,
    addHumanVoiceModalVisible: false,
    updating: false,
    withSubtitles: false,
    autoDownload: false,
    submitLoadingPercentage: 0,
    isLoginModalVisible: false,
    isUploadFormVisible: false,
    isAutodownloadModalVisible: false,
    addHuamnVoiceSkippable: true,
    addExtraUsers: false,
    extraUsers: [],
    extraUsersInput: "",
    exportArticleToVideoState: video.exportArticleToVideoState,
    exportArticleToVideoError: video.exportArticleToVideoError,
  });

  const props = {
    ...data,
    video,
    article,
    language,
  };

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const setState = (newState) => {
    updateState(Object.assign({}, state, newState));
  };

  useEffect(() => {
    const { action, skip } = queryString.parse(location.search);
    if (action && action === "export") {
      if (skip && skip === "humanvoice") {
        onSkipAddHumanVoice();
      } else {
        setTimeout(() => {
          onExportVideoClick();
        }, 100);
      }
    }
  }, []);

  useEffect(() => {
    if (
      state.exportArticleToVideoState === "loading" &&
      props.video.exportArticleToVideoState === "done"
    ) {
      toast.success("Article has been queued to be exported successfully!");
      dispatch(
        clearSlideForm({
          articleId: props.articleId,
          slideIndex: "exportvideo",
        })
      );
      if (props.video.video && props.video.video._id) {
        setTimeout(() => {
          navigate(
            `/${props.language}/videos/progress/${props.video.video._id}`
          );
        }, 1000);
      }
    } else if (
      state.exportArticleToVideoState === "loading" &&
      props.video.exportArticleToVideoState === "failed"
    ) {
      const error =
        props.video.exportArticleToVideoError ||
        "Something went wrong, please try again later";
      toast.info(error);
      dispatch(
        clearSlideForm({
          articleId: props.articleId,
          slideIndex: "exportvideo",
        })
      );
    }

    setState({
      exportArticleToVideoState: video.exportArticleToVideoState,
      exportArticleToVideoError: video.exportArticleToVideoError,
    });
  }, [video.exportArticleToVideoState, video.exportArticleToVideoError]);

  const onOptionSelect = (value) => {
    if (value === "history") {
      console.log(
        "navigating to ",
        `/videos/history/${props.title}?wikiSource=${props.wikiSource}`
      );
      return navigate(
        `/${props.language}/videos/history/${props.title}?wikiSource=${props.wikiSource}`
      );
    } else if (value === "export" && !props.authenticated) {
      setState({ isLoginModalVisible: true });
    } else if (value === "export" && props.authenticated) {
      if (props.isExportable) {
        onExportFormSubmit();
        props.onOpen();
      } else {
        toast.info(
          "Only custom articles and articles with less than 50 slides can be exported."
        );
      }
    } else if (value === "download") {
      console.log("download the video ", props.articleVideo);
      fileUtils.downloadFile(props.articleVideo.video.url);
    }
  };

  const onExportFormSubmit = () => {
    const { articleLastVideo } = props;
    const mode =
      articleLastVideo &&
      articleLastVideo.commonsUrl &&
      articleLastVideo.formTemplate
        ? "update"
        : "new";
    dispatch(
      exportArticleToVideo({
        title: props.title,
        wikiSource: props.wikiSource,
        mode,
      })
    );
  };

  const onExport = () => {
    const { title, wikiSource } = props;
    const { autoDownload, withSubtitles, extraUsers, addExtraUsers } = state;

    const exportParams: any = {
      title,
      wikiSource,
      autoDownload,
      withSubtitles,
    };
    if (addExtraUsers) {
      exportParams.extraUsers = extraUsers;
    }

    dispatch(exportArticleToVideo(exportParams));
    setState({ isAutodownloadModalVisible: false });
  };

  const onAddExtraUser = (userName) => {
    const extraUsers = state.extraUsers;
    if (extraUsers.indexOf(userName) === -1) {
      extraUsers.push(userName);
    }
    setState({ extraUsers, extraUsersInput: "" });
  };

  const onRemoveExtraUser = (index) => {
    const extraUsers = state.extraUsers;
    extraUsers.splice(index, 1);
    setState({ extraUsers });
  };

  // For the Wiki commons upload form
  // onClose() {
  //   this.setState({ open: false });
  // }

  const onClose = () => {
    setState({
      isAutodownloadModalVisible: false,
      extraUsersInput: "",
      extraUsers: [],
    });
  };

  const onAddHumanVoice = (language) => {
    navigate(
      `/${props.language}/export/humanvoice/${props.title}?wikiSource=${props.wikiSource}&lang=${language}`
    );
  };

  const onSkipAddHumanVoice = () => {
    setState({
      addHumanVoiceModalVisible: false,
      addHuamnVoiceSkippable: true,
    });
    setTimeout(() => {
      onOptionSelect("export");
    }, 100);
  };

  const onExportVideoClick = () => {
    if (
      !props.authenticated ||
      (article.uploadTarget === "nccommons" && !session.user.nccommonsId) ||
      ((!article.uploadTarget || article.uploadTarget === "commons") &&
        !session.user.mediawikiId)
    ) {
      setState({ isLoginModalVisible: true });
    } else if (props.isExportable) {
      setState({ addHumanVoiceModalVisible: true });
    } else if (!props.isExportable) {
      toast.info(
        "Only custom articles and articles with less than 50 slides can be exported."
      );
    }
    props.onOpen();
  };

  const onExportInHumanVoice = () => {
    setState({ addHuamnVoiceSkippable: false });

    setTimeout(() => {
      onExportVideoClick();
    }, 100);
  };

  const { fetchArticleVideoState, articleVideo, articleLastVideo } = props;
  if (!article) return <span>loading...</span>;

  let initialFormValues = {
    ...UPLOAD_FORM_INITIAL_VALUES,
    sourceUrl: `${location.origin}/videowiki/${article.title}?wikiSource=${article.wikiSource}`,
  };
  let disabledFields: string[] = [];
  let mode = "new";

  // Set initial form values for the upload form if the article was exported before
  if (
    articleLastVideo &&
    articleLastVideo.commonsUrl &&
    articleLastVideo.formTemplate
  ) {
    const { form } = articleLastVideo.formTemplate;

    initialFormValues = {
      ...form,
      title: form.fileTitle,
      categories: form.categories.map((title) => ({ title })),
      extraUsersInput: "",
      autoDownload: false,
      addExtraUsers: false,
      extraUsers: [],
      sourceUrl: `${location.origin}/${props.language}/videowiki/${article.title}?wikiSource=${article.wikiSource}`,
    };
    disabledFields = ["title"];
    mode = "update";
  }

  const options = [
    {
      text: <p onClick={() => onOptionSelect("history")}>Export History</p>,
      value: "history",
    },
  ];
  // Check to see if the video is to be downloaded or exported
  let downloadable = false;
  if (fetchArticleVideoState === "done" && articleVideo) {
    if (
      articleVideo.exported &&
      articleVideo.video &&
      (articleVideo.video.commonsUploadUrl ||
        articleVideo.video.commonsUrl ||
        articleVideo.video.url)
    ) {
      downloadable = true;
      options.push({
        text: (
          <a
            href={
              articleVideo.video.commonsUrl
                ? `${
                    articleVideo.video.commonsUploadUrl ||
                    articleVideo.video.commonsUrl
                  }?download`
                : articleVideo.video.url
            }
            target="_blank"
          >
            Download video
          </a>
        ),
        value: "export",
      });
    } else if (!articleVideo.exported) {
      options.push({
        text: <p onClick={() => onExportVideoClick()}>Export Video</p>,
        value: "export",
      });
    }
  }

  // If the video is to be downloaded, allow exporting with human voice
  // if (downloadable) {
  //   options.push({
  //     text: (
  //       <p onClick={() => this.onExportInHumanVoice()} >
  //         Export in human voice
  //       </p>
  //     ),
  //     value: 'exporthuman',
  //   })
  // }

  return (
    <a
      onClick={() => setState({ open: true })}
      className="c-editor__footer-wiki c-editor__footer-sidebar c-editor__toolbar-publish c-app-footer__link "
    >
      <Dropdown
        className="import-dropdown export-video-dropdown"
        inline
        compact
        direction="left"
        onChange={onOptionSelect}
        options={options}
        icon={
          <Popup
            position="top right"
            trigger={<Icon inverted color="grey" name="video" />}
            content={<p>Export Video</p>}
          />
        }
      />

      <AddHumanVoiceModal
        open={state.addHumanVoiceModalVisible}
        onClose={() =>
          setState({
            addHumanVoiceModalVisible: false,
            addHuamnVoiceSkippable: true,
          })
        }
        skippable={state.addHuamnVoiceSkippable}
        defaultValue={article.lang}
        onSkip={() => onSkipAddHumanVoice()}
        onSubmit={(val) => onAddHumanVoice(val)}
        disabled
      />
      <AuthModal
        open={state.isLoginModalVisible}
        heading="Only logged in users can export videos to Commons"
        target={article.uploadTarget}
        onClose={() => setState({ isLoginModalVisible: false })}
      />

      {state.isAutodownloadModalVisible && (
        <Modal
          size="small"
          open={state.isAutodownloadModalVisible}
          onClose={() => onClose()}
          style={{ marginTop: 0 }}
        >
          <Modal.Header>
            Export "{props.title.split("_").join(" ")}" to video
          </Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <div>
                <Checkbox
                  label="Auto download the video after it's exported"
                  checked={state.autoDownload}
                  onChange={(e, { checked }) =>
                    setState({ autoDownload: checked })
                  }
                />
              </div>
              <br />
              <div>
                <Checkbox
                  label="Add more user's credits"
                  checked={state.addExtraUsers}
                  onChange={(e, { checked }) =>
                    setState({
                      addExtraUsers: checked,
                      extraUsersInput: checked ? state.extraUsersInput : "",
                    })
                  }
                />
              </div>
              {state.addExtraUsers && (
                <div style={{ paddingLeft: 20, width: "50%" }}>
                  <br />
                  <ul>
                    {state.extraUsers.map((user, index) => (
                      <li
                        key={`extrauser-${user}`}
                        style={{
                          margin: 20,
                          marginTop: 0,
                          position: "relative",
                        }}
                      >
                        {user}{" "}
                        <Icon
                          name="close"
                          style={{
                            cursor: "pointer",
                            position: "absolute",
                            right: 0,
                          }}
                          onClick={() => onRemoveExtraUser(index)}
                        />
                      </li>
                    ))}
                  </ul>
                  <Input
                    action={
                      <Button
                        primary
                        disabled={!state.extraUsersInput.trim()}
                        onClick={() =>
                          onAddExtraUser(state.extraUsersInput.trim())
                        }
                      >
                        Add
                      </Button>
                    }
                    placeholder="User's name"
                    value={state.extraUsersInput}
                    onChange={(e) =>
                      setState({ extraUsersInput: e.target.value })
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        onAddExtraUser(state.extraUsersInput.trim());
                      }
                    }}
                  />
                </div>
              )}
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <div>
              <Button onClick={() => onClose()}>Cancel</Button>
              <Button primary onClick={() => onExport()}>
                Export
              </Button>
            </div>
          </Modal.Actions>
        </Modal>
      )}
    </a>
  );
};

export default ExportArticleVideo;
