import _ from "lodash";
import request from "../../utils/requestAgent";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  Segment,
  Progress,
  Modal,
  Button,
  Icon,
} from "semantic-ui-react";
import classnames from "classnames";
import queryString from "query-string";

import EditorSidebar from "./EditorSidebar";
import EditorFooter from "./EditorFooter";
import EditorSlide from "./EditorSlide";
import EditorHeader from "./EditorHeader";

import LoaderOverlay from "../common/LoaderOverlay";

import Viewer from "./Viewer";
import EditorReferences from "./EditorReferences";
import EditorTimeline from "./EditorTimeline";
import EditorAudioRecorder from "./EditorAudioRecorder";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  deleteSlideAudio,
  onResetUploadState,
  onSetUploadProgress,
  onUploadContentFailure,
  onUploadContentLoading,
  onUploadContentSuccess,
  publishArticle,
  resetPublishError,
  setPlaybackSpeed,
  updateArticle,
  updateSlideMediaDurations,
  uploadImageUrl,
  uploadSlideAudio,
} from "../../slices/articleSlice";
import { toast } from "react-toastify";

interface IEditorProps {
  title: string;
  article: any;
  mode: string;
  publishArticleState?: string;
  publishArticleStatus?: any;
  publishArticleError?: any;
  uploadState?: string;
  uploadStatus?: any;
  uploadProgress?: number;
  autoPlay?: boolean;
  showReferences?: boolean;
  editable?: boolean;
  isPlaying?: boolean;
  fetchArticleVideoState: string;
  articleVideo?: any;
  articleLastVideo?: any;
  onSlideChange?: any;
  customPublish?: boolean;
  onPublish?: any;
  showPublish?: boolean;
  muted?: boolean;
  currentSlideIndex?: number;
  onPlayComplete?: any;
  onPlay?: any;
  controlled?: boolean;
  onViewerModeChange?: any;
  viewerMode?: string;
  layout?: string | number;
  headerOptions?: any;
  enableRecordAudio?: boolean;
}

const Editor = (data: IEditorProps) => {
  const auth = useAppSelector((state) => state.auth);
  const {
    playbackSpeed,
    uploadState,
    uploadSlideAudioLoadingState,
    uploadSlideAudioError,
  } = useAppSelector((state) => state.article);
  const { language } = useAppSelector((state) => state.ui);
  const [currentTime, setCurrentTime] = useState(0);
  const props = {
    isLoggedIn: false,
    autoPlay: false,
    showReferences: false,
    editable: false,
    isPlaying: false,
    articleVideo: {
      video: {},
      exported: "false",
    },
    articleLastVideo: {},
    onSlideChange: () => {},
    onPublish: () => {},
    onPlayComplete: () => {},
    onPlay: () => {},
    onViewerModeChange: () => {},
    showPublish: false,
    customPublish: false,
    muted: false,
    currentSlideIndex: 0,
    controlled: false,
    viewerMode: "player",
    layout: "random",
    headerOptions: {},
    enableRecordAudio: false,
    ...data,
    playbackSpeed,
    uploadState,
    uploadSlideAudioLoadingState,
    uploadSlideAudioError,
    language,
  };
  const [state, setState] = useState({
    currentSlideIndex: 0,
    isPlaying: props.autoPlay,
    showTextTransition: true,
    sidebarVisible:
      props.mode === "editor" ||
      (props.mode === "viewer" && props.viewerMode === "editor"),
    showDescription:
      props.mode === "editor" ||
      (props.mode === "viewer" && props.viewerMode === "editor"),
    audioLoaded: false,
    modalOpen: false,
    currentSubmediaIndex: 0,
    defaultSlideStartTime: 0,
    recording: false,
    viewerMode: props.viewerMode,
    uploadState: props.uploadState,
    publishArticleState: props.publishArticleState,
    uploadSlideAudioLoadingState: props.uploadSlideAudioLoadingState,
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.uploadState === "loading" && props.uploadState === "done") {
      const { article, uploadStatus } = props;
      const { slideNumber, mimetype, filepath } = uploadStatus;

      const updatedArticle = Object.assign({}, article);
      updatedArticle["slides"][slideNumber]["mediaType"] = mimetype;
      updatedArticle["slides"][slideNumber]["media"] = filepath;

      dispatch(updateArticle({ article }));
    }
    if (state.viewerMode !== props.viewerMode) {
      setState((state) => ({
        ...state,
        defaultSlideStartTime: 10,
        isPlaying: false,
        viewerMode: props.viewerMode,
      }));
      setTimeout(() => {
        setState((state) => ({
          ...state,
          defaultSlideStartTime: 0,
          currentSlideIndex: 0,
          currentSubmediaIndex: 0,
          isPlaying: false,
        }));
      }, 100);
    }

    if (
      state.publishArticleState === "loading" &&
      props.publishArticleState === "done"
    ) {
      // redirect to viewer
      const title = props.title;
      const { wikiSource } = queryString.parse(location.search);
      return navigate(
        `/${props.language}/videowiki/${title}?wikiSource=${wikiSource}&notification=false`
      );
    }
    // If the isPlaying changes from the props, change in the state too
    if (state.isPlaying !== props.isPlaying) {
      if (props.isPlaying) {
        const oldIndex = state.currentSlideIndex;
        let tempIndex;
        if (oldIndex === 0) {
          tempIndex = 1;
        } else {
          tempIndex = oldIndex - 1;
        }

        setState((state) => ({
          ...state,
          isPlaying: false,
          currentSlideIndex: tempIndex,
          showTextTransition: false,
        }));
        setTimeout(() => {
          setState((state) => ({
            ...state,
            isPlaying: true,
            currentSlideIndex: oldIndex,
            showTextTransition: true,
          }));
        }, 50);
      } else {
        setState((state) => ({ ...state, isPlaying: props.isPlaying }));
      }
    }
    if (
      props.controlled &&
      props.currentSlideIndex !== state.currentSlideIndex
    ) {
      _handleNavigateToSlide(props.currentSlideIndex);
    }

    // check for viewerMode update
    if (state.viewerMode !== props.viewerMode) {
      if (props.viewerMode === "editor") {
        setState((state) => ({
          ...state,
          viewerMode: props.viewerMode,
          showDescription: true,
          sidebarVisible: true,
        }));
      } else {
        setState((state) => ({
          ...state,
          viewerMode: "viewer",
          showDescription: false,
          sidebarVisible: false,
        }));
      }
    }
    if (
      state.uploadSlideAudioLoadingState === "loading" &&
      props.uploadSlideAudioLoadingState !== "loading"
    ) {
      if (props.uploadSlideAudioLoadingState === "done") {
        const oldIndex = state.currentSlideIndex;
        let tempIndex;
        if (oldIndex === 0) {
          tempIndex = 1;
        } else {
          tempIndex = oldIndex - 1;
        }
        setState((state) => ({
          ...state,
          isPlaying: false,
          currentSlideIndex: tempIndex,
          showTextTransition: false,
          defaultSlideStartTime: 0,
          uploadSlideAudioLoadingState: props.uploadSlideAudioLoadingState,
        }));
        setTimeout(() => {
          setState((state) => ({
            ...state,
            currentSlideIndex: oldIndex,
            showTextTransition: true,
          }));
        }, 50);
      } else if (props.uploadSlideAudioLoadingState === "failed") {
        setState((state) => ({
          ...state,
          uploadSlideAudioLoadingState: props.uploadSlideAudioLoadingState,
        }));
        toast.error(props.uploadSlideAudioError);
      }
    }
  }, []);

  const _getTableOfContents = () => {
    const {
      article: { sections },
    } = props;

    return sections.map((section) =>
      _.pick(section, [
        "title",
        "toclevel",
        "tocnumber",
        "index",
        "slideStartPosition",
        "numSlides",
      ])
    );
  };

  const resetUploadState = () => {
    dispatch(onResetUploadState());
  };

  const onSpeedChange = (playbackSpeed) => {
    dispatch(setPlaybackSpeed({ playbackSpeed }));
  };

  const _handleTogglePlay = () => {
    setState((state) => {
      const newIsPlaying = !state.isPlaying;
      setTimeout(() => {
        if (newIsPlaying) {
          props.onPlay();
        }
      }, 100);
      return {
        ...state,
        isPlaying: newIsPlaying,
      };
    });
  };

  const _handleToggleRecording = () => {
    setState((state) => ({ ...state, recording: !state.recording }));
  };

  const onDeleteAudio = (slidePosition) => {
    const { title, wikiSource } = props.article;
    const slideNumber = state.currentSlideIndex;
    dispatch(deleteSlideAudio({ title, wikiSource, slideNumber }));
  };

  const onStopRecording = (recordedBlob) => {
    const { title, wikiSource } = props.article;
    const slideNumber = state.currentSlideIndex;

    dispatch(
      uploadSlideAudio({
        title,
        wikiSource,
        slideNumber,
        blob: recordedBlob,
        enableAudioProcessing: false,
      })
    );
  };

  const _handleNavigateToSlide = (slideIndex) => {
    const { article } = props;
    const { slides } = article;

    const index =
      slideIndex < 0
        ? 0
        : slideIndex >= slides.length
        ? slides.length - 1
        : slideIndex;

    const slide = slides[index];
    setState((state) => ({
      ...state,
      currentSlideIndex: index,
      // Consider audio is loaded for slides that doesnt have audio
      audioLoaded: slide.audio ? false : true,
      defaultSlideStartTime: 0,
      currentSubmediaIndex: 0,
    }));
    setTimeout(() => {
      props.onSlideChange(index);
    }, 100);
  };

  const _handleSlideBack = () => {
    const { currentSlideIndex } = state;
    if (currentSlideIndex > 0) {
      const { article } = props;
      const { slides } = article;
      const slideIndex = currentSlideIndex - 1;

      const slide = slides[slideIndex];
      setState((state) => ({
        ...state,
        currentSlideIndex: currentSlideIndex - 1,
        currentSubmediaIndex: 0,
        defaultSlideStartTime: 0,
        audioLoaded: slide.audio ? false : true,
      }));

      setTimeout(() => {
        props.onSlideChange(currentSlideIndex - 1);
      }, 100);
    }
  };

  const _handleSlideForward = () => {
    const { currentSlideIndex } = state;

    const { article } = props;
    const { slides } = article;

    if (currentSlideIndex < slides.length - 1) {
      const slideIndex = currentSlideIndex + 1;
      const slide = slides[slideIndex];

      setState((state) => ({
        ...state,
        currentSlideIndex: currentSlideIndex + 1,
        currentSubmediaIndex: 0,
        defaultSlideStartTime: 0,
        audioLoaded: slide.audio ? false : true,
      }));
      setTimeout(() => {
        props.onSlideChange(currentSlideIndex + 1);
      }, 100);
    } else {
      setState((state) => ({ ...state, isPlaying: false }));
      props.onPlayComplete();
    }
  };

  const _toggleSidebar = () => {
    setState((state) => ({
      ...state,
      sidebarVisible: !state.sidebarVisible,
    }));
  };

  const _uploadContent = (data, url, mimetype) => {
    const { currentSlideIndex } = state;
    const { wikiSource } = queryString.parse(location.search);
    if (data) {
      // dispatch(articleActions.uploadContent({
      //   title: match.params.title,
      //   slideNumber: currentSlideIndex,
      //   file,
      // }))
      dispatch(onUploadContentLoading());

      const uploadRequest = request
        .post("/api/wiki/article/upload")
        .field("title", props.title)
        .field("wikiSource", wikiSource)
        .field("slideNumber", currentSlideIndex);

      // attach given fields in the request
      Object.keys(data).forEach((key) => {
        uploadRequest.field(key, data[key]);
      });

      // finally attach the file to the form
      uploadRequest
        .attach("file", data.file)
        .on("progress", (event) => {
          dispatch(onSetUploadProgress(event.percent));
        })
        .end((err, { body }) => {
          if (err) {
            dispatch(onUploadContentFailure());
          } else {
            toast.success(
              "Success! Don't forget to click on the publish icon to save your changes"
            );
          }
          dispatch(onUploadContentSuccess(body));
        });
    } else {
      dispatch(
        uploadImageUrl({
          title: props.title,
          wikiSource: wikiSource as string,
          slideNumber: currentSlideIndex,
          url,
          mimetype,
        })
      );
      toast.success(
        "Success! Don't forget to click on the publish icon to save your changes"
      );
    }
  };

  const _publishArticle = () => {
    if (props.customPublish) {
      return props.onPublish();
    }

    const { wikiSource } = queryString.parse(location.search);

    dispatch(
      publishArticle({ title: props.title, wikiSource: wikiSource as string })
    );
  };

  const _renderLoading = () => {
    return props.publishArticleState === "loading" ? (
      <LoaderOverlay loaderImage="/img/publish-loader.gif">
        Updating your contribution to the sum of all human knowledge
      </LoaderOverlay>
    ) : null;
  };

  const _handleMessageDismiss = () => {
    dispatch(resetPublishError());
  };

  const onDurationsChange = (slide, durations) => {
    const { title, wikiSource } = props.article;
    if (slide.media && slide.media.length > 1) {
      dispatch(
        updateSlideMediaDurations({
          title,
          wikiSource,
          slideNumber: slide.position,
          durations,
        })
      );
    }
  };

  const handleClose = () => {
    const { wikiSource } = queryString.parse(location.search);

    return navigate(
      `/${language}/videowiki/${props.title}?wikiSource=${wikiSource}`
    );
  };

  const _handleTimelineSeekEnd = (defaultSlideStartTime) => {
    setState((state) => ({
      ...state,
      defaultSlideStartTime: defaultSlideStartTime * 1000,
      isPlaying: false,
    }));
  };

  const _renderError = () => {
    const { publishArticleError } = props;
    return publishArticleError && publishArticleError.response ? (
      <Modal open={true} onClose={handleClose} basic size="small">
        <Modal.Content>
          <h3 className="c-editor-error-modal">
            {publishArticleError.response.text}
          </h3>
        </Modal.Content>
        <Modal.Actions>
          <Button color="green" onClick={handleClose} inverted>
            <Icon name="checkmark" /> Got it
          </Button>
        </Modal.Actions>
      </Modal>
    ) : null;
  };

  const _renderPublished = () => {
    const { publishArticleState, mode } = props;

    if (mode !== "viewer" && publishArticleState) {
      switch (publishArticleState) {
        case "done":
          return _render();
        case "loading":
          return _renderLoading();
        case "failed":
          return _renderError();
        default:
          return _render();
      }
    } else {
      return _render();
    }
  };

  const _renderEditorSlide = () => {
    const { article, mode, uploadState, uploadStatus, uploadProgress, muted } =
      props;
    const { wikiSource } = queryString.parse(location.search);
    const { slides } = article;

    const { currentSlideIndex, isPlaying } = state;

    const currentSlide = slides[currentSlideIndex];

    const { text, audio, media } = currentSlide;
    let mediaUrl, mediaType;
    if (media && media.length > 0) {
      mediaUrl = media[0].url;
      mediaType = media[0].type;
    }

    return (
      <EditorSlide
        articleId={article._id}
        title={article.title}
        wikiSource={wikiSource as string}
        currentSlideIndex={currentSlideIndex}
        editable={props.editable}
        showTextTransition={state.showTextTransition}
        // showDescription={state.showDescription}
        description={text}
        audio={audio}
        muted={muted}
        media={mediaUrl}
        mediaType={mediaType}
        onSlidePlayComplete={() => _handleSlideForward()}
        isPlaying={isPlaying}
        uploadContent={(data, url, mimetype) =>
          _uploadContent(data, url, mimetype)
        }
        mode={mode}
        uploadState={uploadState}
        uploadStatus={uploadStatus}
        uploadProgress={uploadProgress}
        resetUploadState={resetUploadState}
        playbackSpeed={props.playbackSpeed}
        isLoggedIn={(auth.session && auth.session.user) || false}
        currentTime={currentTime}
      />
    );
  };

  const _renderViewer = () => {
    const { article, layout } = props;
    const { slidesHtml, slides } = article;
    const { currentSlideIndex, isPlaying } = state;

    let renderedSlides = slides;
    // check if slidesHtml is available
    if (
      slidesHtml &&
      slidesHtml.length > 0 &&
      slidesHtml.length === slides.length
    ) {
      renderedSlides = slidesHtml;
    }
    return (
      <Viewer
        slides={renderedSlides}
        muted={props.muted}
        showDescription={state.showDescription}
        currentSlideIndex={currentSlideIndex}
        isPlaying={isPlaying && state.audioLoaded}
        layout={layout}
        currentSubmediaIndex={state.currentSubmediaIndex}
        defaultSlideStartTime={state.defaultSlideStartTime}
        onSlidePlayComplete={() => _handleSlideForward()}
        onAudioLoad={() =>
          setState((state) => ({ ...state, audioLoaded: true }))
        }
        playbackSpeed={props.playbackSpeed}
        onSubMediaSlideChange={(currentSubmediaIndex) =>
          setState((state) => ({ ...state, currentSubmediaIndex }))
        }
        currentTime={currentTime}
        onTimeUpdate={(time) => setCurrentTime(time)}
      />
    );
  };

  const _renderSlide = () => {
    return props.mode === "viewer" ? _renderViewer() : _renderEditorSlide();
  };

  const _render = () => {
    const { article, mode, uploadState, language } = props;

    if (!article) {
      let redirectStr = `/${props.language}/wiki/${props.title}`;
      const { wikiSource } = queryString.parse(location.search);
      if (wikiSource) {
        redirectStr += `?wikiSource=${wikiSource}`;
      }
      // redirect to convert page
      navigate(redirectStr);
      return null;
    }

    const { slides } = article;
    const updatedAt = article.updated_at;

    const { currentSlideIndex, sidebarVisible } = state;
    const currentSlide = slides[currentSlideIndex] || {};

    const mainContentClasses = classnames("c-main-content", {
      "c-main-content__sidebar-visible": sidebarVisible,
      "c-main-content__sidebar-visible--viewer":
        sidebarVisible && mode === "viewer",
    });

    const editorClasses = classnames("c-editor", {
      "c-editor__editor": mode !== "viewer",
      "c-editor__viewer": mode === "viewer",
    });

    const hideSidebarToggle = mode !== "viewer";

    // Meta tags for SEO
    const pageTitle = `VideoWiki: ${
      props.article && article.title.split("_").join(" ")
    }`;
    const pageDesc = `Checkout the new VideoWiki article at ${location.href}`;

    const metaTags = {
      title: pageTitle,
      description: pageDesc,
      canonical: location.href,
      meta: {
        charSet: "utf-8",
        itemProp: {
          name: pageTitle,
          description: pageDesc,
          image: props.article && props.article.image,
        },
        property: {
          "og:url": location.href,
          "og:title": pageTitle,
          "og:type": "article",
          "og:image": props.article && props.article.image,
          "og:site_name": "Videowiki",
          "twitter:site": "@videowiki",
          "twitter:title": pageTitle,
        },
      },
      auto: {
        ograph: true,
      },
    };

    return (
      // <DocumentMeta {...metaTags} >
      <div>
        <div className={editorClasses}>
          {/* Header */}
          <EditorHeader
            article={article}
            language={language}
            // showViewerModeDropdown={this.props.showViewerModeDropdown}
            authenticated={auth.session && auth.session.user}
            currentSlide={currentSlide || {}}
            mode={mode}
            options={props.headerOptions || {}}
            isExportable={article.ns !== 0 || article.slides.length < 50}
            showPublish={props.showPublish}
            articleVideo={props.articleVideo}
            articleLastVideo={props.articleLastVideo}
            fetchArticleVideoState={props.fetchArticleVideoState}
            onPublishArticle={() => _publishArticle()}
            onPausePlay={() =>
              setState((state) => ({ ...state, isPlaying: false }))
            }
            viewerMode={props.viewerMode}
            onViewerModeChange={(e, { value }) =>
              props.onViewerModeChange(value)
            }
            onBack={() =>
              navigate(
                `/${props.language}/videowiki/${props.article.title}?wikiSource=${props.article.wikiSource}`
              )
            }
          />

          {/* Main */}
          <div className="c-editor__content">
            <Sidebar.Pushable as={Segment} className="c-editor__content--all">
              <EditorSidebar
                toc={_getTableOfContents()}
                visible={sidebarVisible}
                currentSlideIndex={currentSlideIndex}
                navigateToSlide={(slideStartPosition) =>
                  _handleNavigateToSlide(slideStartPosition)
                }
              />
              <Sidebar.Pusher className={mainContentClasses}>
                {_renderSlide()}
              </Sidebar.Pusher>
            </Sidebar.Pushable>
            <Progress
              color="blue"
              value={currentSlideIndex + 1}
              total={slides.length}
              attached="bottom"
            />
          </div>

          {/* Footer */}
          <EditorFooter
            currentSlideIndex={currentSlideIndex}
            totalSlideCount={slides.length}
            uploadState={uploadState}
            onSlideBack={() => _handleSlideBack()}
            togglePlay={() => _handleTogglePlay()}
            onCCToggle={() =>
              setState((state) => ({
                ...state,
                showDescription: !state.showDescription,
              }))
            }
            onSlideForward={() => _handleSlideForward()}
            isPlaying={state.isPlaying}
            toggleSidebar={() => _toggleSidebar()}
            title={props.title}
            hideSidebarToggle={hideSidebarToggle}
            onSpeedChange={(value) => onSpeedChange(value)}
            updatedAt={updatedAt}
          />
        </div>
        {props.enableRecordAudio && currentSlide && (
          <EditorAudioRecorder
            currentSlide={currentSlide}
            recording={state.recording}
            toggleRecording={_handleToggleRecording}
            onDeleteAudio={onDeleteAudio}
            onStop={onStopRecording}
            isLoggedIn={auth.session && auth.session.user ? true : false}
            loading={props.uploadSlideAudioLoadingState === "loading"}
            disabled={props.uploadSlideAudioLoadingState === "loading"}
          />
        )}
        {props.viewerMode === "editor" &&
          currentSlide &&
          currentSlide.media &&
          currentSlide.media.length > 0 && (
            <EditorTimeline
              onDurationsChange={onDurationsChange}
              currentSlide={currentSlide}
              currentSlideIndex={currentSlideIndex}
              isPlaying={state.isPlaying}
              onAudioLoad={() =>
                setState((state) => ({ ...state, audioLoaded: true }))
              }
              onPlayComplete={() => _handleSlideForward()}
              onSeekEnd={_handleTimelineSeekEnd}
              onTimeUpdate={setCurrentTime}
            />
          )}
        {props.showReferences && (
          <EditorReferences
            mode={mode}
            defaultVisible={mode === "editor"}
            article={article}
            currentSlideIndex={currentSlideIndex}
            currentSlide={currentSlide}
            currentSubmediaIndex={state.currentSubmediaIndex}
            language={props.language}
          />
        )}
      </div>
      // </DocumentMeta>
    );
  };

  const _renderEditor = () => {
    return props.mode === "viewer" ? _render() : _renderPublished();
  };

  return _renderEditor();
};

export default Editor;
