import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Icon, Popup, Dropdown } from "semantic-ui-react";
import copy from "clipboard-copy";
import {
  FacebookIcon,
  FacebookShareButton,
  TwitterShareButton,
  VKShareButton,
  RedditShareButton,
  TwitterIcon,
  VKIcon,
  RedditIcon,
} from "react-share";
import Blinker from "../common/Blinker";
import UpdateArticleModal from "./modals/UpdateArticleModal";
import ExportArticleVideo from "./ExportArticleVideo";
import AddHumanVoiceModal from "./modals/AddHumanVoiceModal";
import AuthModal from "../common/AuthModal";
import { toast } from "react-toastify";

interface IEditorHeaderProps {
  article: any;
  mode: string;
  language: string;
  onPublishArticle: any;
  currentSlide: any;
  showPublish?: boolean;
  fetchArticleVideoState?: string;
  authenticated?: boolean;
  articleVideo?: any;
  articleLastVideo?: any;
  onBack?: any;
  onTranslate?: any;
  onPausePlay?: any;
  onViewerModeChange?: any;
  viewerMode: string;
  showViewerModeDropdown?: boolean;
  showTranslate?: boolean;
  options?: any;
  isExportable?: boolean;
}

const EditorHeader = (data: IEditorHeaderProps) => {
  const props = {
    authenticated: false,
    fetchArticleVideoState: "",
    showPublish: false,
    articleVideo: {
      video: {},
      exported: false,
    },
    articleLastVideo: {},
    onBack: () => {},
    onTranslate: () => {},
    onPausePlay: () => {},
    onViewerModeChange: () => {},
    showViewerModeDropdown: false,
    showTranslate: false,
    options: {},
    isExportable: false,
    ...data,
  };
  const [state, updateState] = useState({
    blink: false,
    addHumanVoiceModalVisible: false,
    isLoginModalVisible: false,
    currentSlide: props.currentSlide,
  });

  const navigate = useNavigate();

  const setState = (data) => {
    updateState((prevState) => ({
      ...prevState,
      ...data,
    }));
  };

  useEffect(() => {
    setState({ blink: true });
  }, []);

  useEffect(() => {
    if (
      state.currentSlide &&
      state.currentSlide.position > -1 &&
      state.currentSlide &&
      state.currentSlide.position > -1 &&
      state.currentSlide.position !== props.currentSlide.position &&
      !props.currentSlide.media
    ) {
      setState({ blink: true });
    }
    setState({ currentSlide: props.currentSlide });
  }, [props.currentSlide]);

  const onCopy = () => {
    copy(location.href);
    toast.success("Link copied to clipboard");
  };

  const onAddHumanVoice = (lang) => {
    const { article, language } = props;
    navigate(
      `/${language}/export/humanvoice/${article.title}?wikiSource=${article.wikiSource}&lang=${lang}`
    );
  };

  const onTranslateButtonClick = () => {
    const { article, authenticated } = props;
    if (!authenticated) {
      return setState({ isLoginModalVisible: true });
    }

    if (article.ns !== 0 || article.slides.length < 50) {
      return setState({ addHumanVoiceModalVisible: true });
    }

    return toast.info(
      "Only custom articles and articles with less than 50 slides can be exported."
    );
  };

  const _renderUpdateButton = () => {
    if (!props.options.showUpdateArticle) return;
    return (
      <UpdateArticleModal
        title={props.article.title}
        wikiSource={props.article.wikiSource}
      />
    );
  };

  const _renderExportArticle = () => {
    if (!props.options.showExportArticle || !props.article) return;
    const { article, fetchArticleVideoState, articleVideo, articleLastVideo } =
      props;

    return (
      <ExportArticleVideo
        fetchArticleVideoState={fetchArticleVideoState}
        articleVideo={articleVideo}
        articleLastVideo={articleLastVideo}
        isExportable={props.isExportable}
        articleId={article._id}
        title={article.title}
        wikiSource={article.wikiSource}
        authenticated={props.authenticated}
        onOpen={props.onPausePlay}
      />
    );
  };

  const _renderLoginModal = () => {
    return (
      <AuthModal
        open={state.isLoginModalVisible}
        heading="Only logged in users can export videos to Commons"
        onClose={() => setState({ isLoginModalVisible: false })}
        target=""
      />
    );
  };

  const _renderShareButton = () => {
    return (
      <Button basic icon className="c-editor__toolbar-publish" title="Share">
        <Icon name="share alternate" inverted color="grey" />
      </Button>
    );
  };

  const _renderShareButtons = () => {
    if (!props.options.showShareButtons) return;
    const { article } = props;
    const title = article.title.split("_").join(" ");
    const url = location.href;
    const description = `Checkout the new VideoWiki article at ${location.href}`;

    return (
      <span>
        <Popup
          trigger={
            <span style={{ display: "inline-block" }}>
              <FacebookShareButton
                url={url}
                title={title}
                // picture={article.image}
                // description={description}
                className="c-editor__share-icon"
              >
                <FacebookIcon size={32} round />
              </FacebookShareButton>
            </span>
          }
        >
          Facebook
        </Popup>

        <Popup
          trigger={
            <span style={{ display: "inline-block" }}>
              <TwitterShareButton
                url={url}
                title={title}
                className="c-editor__share-icon"
              >
                <TwitterIcon size={32} round />
              </TwitterShareButton>
            </span>
          }
        >
          Twitter
        </Popup>

        <Popup
          trigger={
            <span style={{ display: "inline-block" }}>
              <VKShareButton
                url={url}
                image={article.image}
                windowWidth={660}
                windowHeight={460}
                className="c-editor__share-icon"
              >
                <VKIcon size={32} round />
              </VKShareButton>
            </span>
          }
        >
          VK
        </Popup>

        <Popup
          trigger={
            <span style={{ display: "inline-block" }}>
              <RedditShareButton
                url={url}
                title={title}
                windowWidth={660}
                windowHeight={460}
                className="c-editor__share-icon"
              >
                <RedditIcon size={32} round />
              </RedditShareButton>
            </span>
          }
        >
          Reddit
        </Popup>
        <Popup
          trigger={
            <Button
              style={{ position: "relative", top: -9, width: 32, height: 32 }}
              circular
              // icon="copy"
              color="facebook"
              onClick={onCopy}
            />
          }
        >
          Copy article link
        </Popup>
      </span>
    );
  };

  const _renderShareIcon = () => {
    if (!props.options.showShareButtons) return;

    return (
      <Popup trigger={_renderShareButton()} hoverable>
        {_renderShareButtons()}
      </Popup>
    );
  };

  const _navigateToEditor = () => {
    const { article } = props;
    const wikiSource = article.wikiSource || "https://en.wikipedia.org";

    if (article.mediaSource === "script") {
      return toast.info(
        "The media of custom Videowiki articles are editable only in the script page"
      );
    }
    navigate(
      `/${props.language}/editor/${article.title}?wikiSource=${wikiSource}`
    );
  };

  const _navigateToArticle = () => {
    const { article } = props;
    const wikiSource = article.wikiSource || "https://en.wikipedia.org";
    window.open(`${wikiSource}/wiki/${article.title}`);
  };

  const _publishArticle = () => {
    props.onPublishArticle();
  };

  const _renderPublishOrEditIcon = () => {
    if (props.options.showPublish) {
      return (
        <Button
          size="huge"
          basic
          icon
          className="c-editor__toolbar-publish"
          title="Publish"
          onClick={() => _publishArticle()}
        >
          <Icon name="save" inverted color="grey" />
        </Button>
      );
    }
    if (props.options.showNavigateToArticle) {
      return (
        <Blinker
          secondary="#1678c2"
          interval={1500}
          repeat={3}
          blink={state.blink}
          onStop={() => setState({ blink: false })}
        >
          <Button
            basic
            icon
            className="c-editor__toolbar-publish"
            style={{ height: "100%" }}
            title="Verify/Edit text and media"
            onClick={() => _navigateToArticle()}
          >
            <Icon name="pencil" inverted color="grey" />
          </Button>
        </Blinker>
      );
    }
    return null;
  };

  const _renderBackButton = () => {
    if (!props.options.showBackButton) return;
    return (
      <Button
        size="huge"
        basic
        icon
        className="c-editor__toolbar-publish"
        title="Back to article"
        onClick={() => props.onBack()}
      >
        <Icon name="chevron left" inverted color="grey" />
      </Button>
    );
  };

  const _renderViewerModeDropdown = () => {
    if (!props.options.showViewerModeDropdown) return;

    return (
      <Dropdown
        style={{ paddingTop: "1rem", paddingLeft: "1rem" }}
        value={props.viewerMode}
        options={[
          { key: 1, text: "Player Mode", value: "player" },
          { key: 2, text: "Editor Mode", value: "editor" },
        ]}
        onChange={props.onViewerModeChange}
      />
    );
  };

  const _renderTranslateButton = () => {
    if (!props.options.showTranslate) return;
    return (
      <a
        className="c-editor__footer-wiki c-editor__footer-sidebar c-editor__toolbar-publish c-app-footer__link "
        style={{ paddingRight: "1.2em" }}
        href="javascript:void(0)"
        onClick={onTranslateButtonClick}
      >
        <Popup trigger={<Icon name="translate" inverted color="grey" />}>
          Translate and export
        </Popup>
      </a>
    );
  };

  const _renderAddHumanVoiceModal = () => {
    return (
      <AddHumanVoiceModal
        open={state.addHumanVoiceModalVisible}
        onClose={() => setState({ addHumanVoiceModalVisible: false })}
        skippable={false}
        disabledLanguages={[props.language]}
        onSubmit={(val) => onAddHumanVoice(val)}
      />
    );
  };

  const { article, options } = props;
  const wikiSource = article.wikiSource || "https://en.wikipedia.org";
  return (
    <div className="c-editor__toolbar">
      {_renderViewerModeDropdown()}
      {_renderBackButton()}
      <a
        className="c-editor__toolbar-title"
        href={`${wikiSource}/wiki/${article.title}`}
        target="_blank"
      >
        {((options && options.title) || article.title).split("_").join(" ")}
      </a>
      {_renderTranslateButton()}
      {_renderExportArticle()}
      {_renderUpdateButton()}
      {/* <a
          className="c-editor__footer-wiki c-editor__footer-sidebar c-editor__toolbar-publish c-app-footer__link "
          href={`${wikiSource}/wiki/${article.title}`}
          target="_blank"
        >
          <Popup
            trigger={
              <Icon name="wikipedia w" inverted color="grey" />
            }
          >
            Verfiy/Edit Text
          </Popup>
        </a> */}
      {_renderShareIcon()}
      {_renderPublishOrEditIcon()}
      {_renderAddHumanVoiceModal()}
      {_renderLoginModal()}
    </div>
  );
};

export default EditorHeader;
