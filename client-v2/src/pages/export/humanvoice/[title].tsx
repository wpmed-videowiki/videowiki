import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Grid, Button, Icon, Progress, Input } from "semantic-ui-react";
import queryString from "query-string";
import { NotificationManager } from "react-notifications";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  fetchArticle,
  fetchVideoByArticleTitle,
} from "../../../app/slices/articleSlice";
import { clearSlideForm } from "../../../app/slices/wikiSlice";
import {
  deleteCustomAudio,
  fetchArticleHumanVoice,
  savetranslatedText,
  uploadSlideAudioHumanVoice,
} from "../../../app/slices/humanVoiceSlice";
import { toast } from "react-toastify";
import { exportArticleToVideo } from "../../../app/slices/videoSlice";
import { othersworkLicenceOptions } from "../../../app/components/common/licenceOptions";
import websockets from "../../../app/websockets";
import UploadFileInfoModal from "../../../app/components/common/UploadFileInfoModal";
import Editor from "../../../app/components/Editor";
import StateRenderer from "../../../app/components/common/StateRenderer";
import TranslateBoxV2 from "../../../app/components/HumanVoice/TranslateBoxV2";
import AudioRecorderV2 from "../../../app/components/common/AudioRecorder/v2";
import InvalidPublishModal from "../../../app/components/HumanVoice/InvalidPublishModal";
import SlidesListV2 from "../../../app/components/HumanVoice/SlidesListV2";

function mapTranslatedSlidesArray(slides) {
  const obj = {};
  slides.forEach((slide) => {
    obj[slide.position] = slide.text;
  });

  return obj;
}

const ExportHumanVoice = () => {
  const [state, updateState] = useState<any>({
    lang: "",
    currentSlideIndex: 0,
    enableAudioProcessing: true,
    record: false,
    recordedAudio: null,
    article: null,
    isPlaying: false,
    inPreview: false,
    editorMuted: false,
    uploadAudioLoading: false,
    saveTranslatedTextLoading: false,
    invalidPublishModalVisible: false,
    isUploadFormVisible: false,
    UPLOAD_FORM_INITIAL_VALUES: {
      licence: othersworkLicenceOptions[2].value,
      licenceText: othersworkLicenceOptions[2].text,
      licenceSection: othersworkLicenceOptions[2].section,
      source: "others",
      sourceUrl: "",
    },
    translatedSlides: {},
    isDone: false,
    afterSavePreviewStart: false,
    afterSavePreviewEnd: false,
    uploadAudioInputValue: null,
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const paramsTitle = params["*"] as string;

  const setState = (newState) => {
    updateState((prevState) => ({
      ...prevState,
      ...newState,
    }));
  };
  const { article, fetchArticleState, articleLastVideo } = useAppSelector(
    (state) => state.article
  );
  const humanvoice = useAppSelector((state) => state.humanvoice);
  const video = useAppSelector((state) => state.video);
  const language = useAppSelector((state) => state.ui.language);
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      (!auth.session || !auth.session.user || !auth.session.token)
    ) {
      return navigate(`/${language}`);
    }

    const title = paramsTitle;
    const { wikiSource, lang } = queryString.parse(location.search);
    if (!title || !wikiSource || !lang) {
      return navigate(`/videowiki/${title}`);
    }
    const { UPLOAD_FORM_INITIAL_VALUES } = state;
    UPLOAD_FORM_INITIAL_VALUES.sourceUrl = `${location.origin}/videowiki/${title}?wikiSource=${wikiSource}`;
    setState({ lang, UPLOAD_FORM_INITIAL_VALUES });
    dispatch(
      fetchArticle({ title, wikiSource: wikiSource as string, mode: "viewer" })
    );
  }, [paramsTitle]);

  useEffect(() => {
    websockets.subscribeToEvent(
      websockets.websocketsEvents.HUMANVOICE_AUDIO_PROCESSING,
      (data) => {
        const { success, humanvoiceId, slideAudioInfo } = data;
        if (humanvoiceId === humanvoice.humanvoice._id) {
          if (!state.isPlaying) {
            if (success) {
              setState((state) => {
                const article = state.article;
                article.slides[slideAudioInfo.position].customAudio =
                  slideAudioInfo.audioURL;
                article.slides[slideAudioInfo.position].completed = true;
                return {
                  article,
                  uploadAudioLoading: false,
                  uploadAudioInputValue: null,
                };
              });
            } else {
              setState({
                uploadAudioLoading: false,
                uploadAudioInputValue: null,
              });
              NotificationManager.info(
                "Something went wrong while processing the audio, we kept you original recording though."
              );
            }
          }
        } else {
          // NotificationManager.error('Invalid human voice item');
        }
      }
    );
    return () => {
      websockets.unsubscribeFromEvent(
        websockets.websocketsEvents.HUMANVOICE_AUDIO_PROCESSING
      );
    };
  }, []);

  const canPublish = () => {
    const { article, translatedSlides } = state;
    if (!article || !translatedSlides) return false;

    const { lang } = queryString.parse(location.search);
    const translatedSlidesValid =
      lang === article.lang
        ? true
        : article.slides.length <= Object.keys(translatedSlides).length;
    return (
      translatedSlidesValid && article.slides.every((slide) => slide.completed)
    );
  };

  useEffect(() => {
    if (canPublish() && !state.isDone) {
      console.log("+++++++++++++++++++++ isDone ++++++++++++++++++");
      updateState((state) => {
        const { article, translatedSlides } = state;
        const { lang } = queryString.parse(location.search);
        humanvoice.humanvoice.audios.forEach((audio) => {
          if (audio.position < article!.slides.length) {
            article!.slides[audio.position].audio = audio.audioURL;
            // if (lang !== article.lang) {
            //   article.slides[audio.position].text = translatedSlides[audio.position];
            // }
          }
        });
        return { ...state, article, isDone: true };
      });
    } else if (!canPublish() && state.isDone) {
      updateState((state) => {
        // { isDone: false }
        const newArticle = JSON.parse(JSON.stringify(state.article));
        newArticle.slides.forEach((slide, index) => {
          slide.audio = article.slides[index].audio;
          // slide.text = this.props.article.slides[index].text;
        });
        return { ...state, article: newArticle, isDone: false };
      });
    }
  }, [canPublish(), state.isDone]);

  useEffect(() => {
    return () => {
      if (article && article._id) {
        dispatch(
          clearSlideForm({ articleId: article._id, slideIndex: "exportvideo" })
        );
      }
    };
  }, []);

  // success action for loading the article
  useEffect(() => {
    if (fetchArticleState === "done" && article) {
      const title = paramsTitle;
      const { wikiSource, lang } = queryString.parse(location.search);
      const articleClone = JSON.parse(JSON.stringify(article));
      setState({ article: articleClone });
      // clear upload modal form
      dispatch(
        clearSlideForm({ articleId: article._id, slideIndex: "exportvideo" })
      );
      // Fetch any stored human voice for this article made by the logged in user
      dispatch(
        fetchArticleHumanVoice({
          title: title as string,
          wikiSource: wikiSource as string,
          lang: lang as string,
        })
      );
      dispatch(
        fetchVideoByArticleTitle({
          title: article.title,
          wikiSource: article.wikiSource,
          lang: lang as string,
        })
      );
    }
  }, [fetchArticleState, article]);

  // success action for uploading audio to a slide
  useEffect(() => {
    if (humanvoice.uploadAudioToSlideState === "done") {
      if (humanvoice.uploadedSlideAudio) {
        const { uploadedSlideAudio } = humanvoice;
        updateState((state) => {
          const { enableAudioProcessing, article } = state;
          article.slides[uploadedSlideAudio.position].customAudio =
            uploadedSlideAudio.audioURL;
          article.slides[uploadedSlideAudio.position].completed = true;
          return {
            ...state,
            article: { ...article },
            uploadAudioLoading: false,
            uploadAudioInputValue: null,
          };
        });
        toast.success("Audio Uploaded");
      }
    }
  }, [humanvoice.uploadAudioToSlideState, humanvoice.uploadedSlideAudio]);

  // Saving translated text

  useEffect(() => {
    if (humanvoice.saveTranslatedTextState !== "loading") {
      if (
        humanvoice.saveTranslatedTextState === "done" &&
        humanvoice.translatedTextInfo
      ) {
        const { translatedTextInfo } = humanvoice;
        let oldSlideIndex;
        updateState((state) => {
          const { translatedSlides, currentSlideIndex, article } = state;
          let newSlideIndex = currentSlideIndex;
          oldSlideIndex = currentSlideIndex;
          translatedSlides[translatedTextInfo.position] =
            translatedTextInfo.text;
          // Move to next slide after saving text
          if (
            article.slides[currentSlideIndex].completed &&
            currentSlideIndex < article.slides.length - 1
          ) {
            newSlideIndex += 1;
          }
          return {
            ...state,
            translatedSlides,
            currentSlideIndex: newSlideIndex,
            article,
            afterSavePreviewStart: true,
          };
        });
        const { article } = state;
        if (
          article.slides[oldSlideIndex] &&
          article.slides[oldSlideIndex].completed
        ) {
          setTimeout(() => {
            setState({ isPlaying: true });
          }, 500);
        }
      } else if (humanvoice.saveTranslatedTextState === "failed") {
        toast.error(
          "Something went wrong while updating the text, please try again"
        );
      }
      setState({ saveTranslatedTextLoading: false });
    }
  }, [humanvoice.saveTranslatedTextState, humanvoice.translatedTextInfo]);

  // failed action for uploading audio to slide
  useEffect(() => {
    if (humanvoice.uploadAudioToSlideState === "failed") {
      setState({ uploadAudioLoading: false });
      toast.error(
        "Something went wrong while uploading audio, please try again"
      );
    }
  }, [humanvoice.uploadAudioToSlideState]);

  // Fetch previous records for this article

  useEffect(() => {
    if (
      humanvoice.fetchArticleHumanVoiceState === "done" &&
      humanvoice.humanvoice
    ) {
      // Set audios recorded before on this article
      updateState((state) => {
        const article = state.article;
        humanvoice.humanvoice.audios.forEach((audio) => {
          if (audio.position < article.slides.length) {
            article.slides[audio.position].customAudio = audio.audioURL;
            article.slides[audio.position].completed = true;
          }
        });

        let translatedSlides = {};
        if (humanvoice.humanvoice.translatedSlides) {
          translatedSlides = mapTranslatedSlidesArray(
            humanvoice.humanvoice.translatedSlides
          );
        }
        return { ...state, article, translatedSlides };
      });
    }
  }, [humanvoice.fetchArticleHumanVoiceState, humanvoice.humanvoice]);

  useEffect(() => {
    // delete custom audio from slide action
    if (humanvoice.deleteCustomAudioState !== "loading") {
      setState({ uploadAudioLoading: false });
      if (
        humanvoice.deleteCustomAudioState === "done" &&
        humanvoice.deletedAudio
      ) {
        // remove the audio from the slide
        updateState((state) => {
          const article = state.article;
          article.slides[humanvoice.deletedAudio.position].customAudio = "";
          article.slides[humanvoice.deletedAudio.position].audioBlob = null;
          article.slides[humanvoice.deletedAudio.position].completed = false;
          return { ...state, record: false, recordedAudio: null, article };
        });
      } else {
        // window.location.reload();
      }
    }
  }, [humanvoice.deleteCustomAudioState, humanvoice.deletedAudio]);

  useEffect(() => {
    // Export article to video actions
    if (
      video.exportArticleToVideoState === "done" &&
      video.video &&
      video.video._id
    ) {
      toast.success("Article has been queued to be exported successfully!");
      setState({ isUploadFormVisible: false });
      dispatch(
        clearSlideForm({ articleId: article._id, slideIndex: "exportvideo" })
      );
      setTimeout(() => {
        navigate(`/${language}/videos/progress/${video.video._id}`);
      }, 1000);
    } else if (video.exportArticleToVideoState === "failed") {
      const error =
        video.exportArticleToVideoError ||
        "Something went wrong, please try again later";
      toast.info(error);
      setState({ isUploadFormVisible: false });
      dispatch(
        clearSlideForm({ articleId: article._id, slideIndex: "exportvideo" })
      );
    }
  }, [
    video.exportArticleToVideoState,
    video.video,
    video.exportArticleToVideoError,
    language,
    article?._id,
  ]);

  const toggleRecording = () => {
    updateState((state) => {
      const record = !state.record;
      const article = state.article;
      if (record) {
        article.slides[state.currentSlideIndex].customAudio = "";
        article.slides[state.currentSlideIndex].audioBlob = "";
      }
      return {
        ...state,
        record,
        recordedAudio: record ? null : state.recordedAudio,
        isPlaying: record,
        editorMuted: record,
        article,
      };
    });
  };

  const onPreviewFinalVideo = () => {
    console.log("on preview final video");
    updateState((state) => {
      const inPreview = !state.inPreview;
      const { article, translatedSlides } = state;
      const { lang } = queryString.parse(location.search);
      // If we'll be in preview, set the article audios to the user custom audios
      // otherwise, reset the audios to the TTS audios
      // debugger;
      if (inPreview) {
        humanvoice.humanvoice.audios.forEach((audio) => {
          if (audio.position < article.slides.length) {
            article.slidesHtml[audio.position].audio = audio.audioURL;
            if (lang !== article.lang) {
              article.slidesHtml[audio.position].text =
                translatedSlides[audio.position];
            }
          }
        });
      } else if (!canPublish()) {
        article.slides.forEach((slide, index) => {
          slide.audio = article.slides[index].audio;
          slide.text = article.slides[index].text;
        });
      } else if (!inPreview) {
        article.slides.forEach((slide, index) => {
          slide.text = article.slidesHtml[index].text;
          slide.audio = article.slidesHtml[index].audio;
        });
      }
      return {
        ...state,
        article: { ...article },
        inPreview,
        currentSlideIndex: 0,
      };
    });

    setTimeout(() => {
      if (state.inPreview) {
        setState({ isPlaying: true });
        toast.info("Click on the publish icon when you are done previewing");
      } else {
        setState({ isPlaying: false });
      }
    }, 100);
  };

  const onPreviewEnd = () => {
    updateState((state) => {
      const { article } = state;
      // Reset the origianl TTS audios on the article
      article.slidesHtml.forEach((slide, index) => {
        slide.audio = article.slidesHtml[index].audio;
        slide.text = article.slidesHtml[index].text;
      });

      return {
        ...state,
        article,
        inPreview: false,
        isPlaying: false,
        currentSlideIndex: 0,
        editorMuted: false,
      };
    });
  };

  const onSlideChange = (newIndex) => {
    const { article, inPreview, afterSavePreviewStart, afterSavePreviewEnd } =
      state;
    const customAudio = article.slides[newIndex].customAudio;
    console.log("aftersavePreview", afterSavePreviewStart, afterSavePreviewEnd);
    if (afterSavePreviewStart) {
      return setState({
        isPlaying: false,
        afterSavePreviewStart: false,
        afterSavePreviewEnd: true,
        currentSlideIndex: newIndex,
      });
    }
    if (afterSavePreviewEnd) {
      return setState({
        isPlaying: false,
        afterSavePreviewStart: false,
        afterSavePreviewEnd: false,
        currentSlideIndex: newIndex - 1,
      });
    }
    // We need to force the audio player to re-render, so we clear the custom audio
    // and set it back in a new cycle of the event loop
    article.slides[newIndex].customAudio = "";
    setState({
      article,
      currentSlideIndex: newIndex,
      isPlaying: inPreview,
      afterSavePreviewStart: false,
      afterSavePreviewEnd: false,
    });
    setTimeout(() => {
      updateState((state) => {
        const article = state.article;
        article.slides[newIndex].customAudio = customAudio;
        return { ...state, article, editorMuted: false };
      });
    }, 100);
  };

  const onStop = (recordedBlob) => {
    console.log("recordedBlob is: ", recordedBlob);
    if (recordedBlob) {
      updateState((state) => {
        const article = state.article;
        // Add audio info to current slide
        article.slides[state.currentSlideIndex].customAudio = recordedBlob;
        article.slides[state.currentSlideIndex].audioBlob = {
          blob: recordedBlob,
        };
        article.slides[state.currentSlideIndex].completed = false;

        return {
          ...state,
          recordedAudio: recordedBlob,
          article,
          record: false,
          isPlaying: false,
          editorMuted: false,
        };
      });
      setTimeout(() => {
        onUploadAudioToSlide();
      }, 100);
    } else {
      setState({ record: false });
    }
  };

  const onDeleteAudio = (slideIndex) => {
    if (!state.article.slides[slideIndex].completed) {
      console.log("local delete");
      updateState((state) => {
        const article = state.article;
        // Clear prev audio
        article.slides[slideIndex].customAudio = "";
        article.slides[state.currentSlideIndex].audioBlob = null;
        article.slides[slideIndex].completed = false;
        return { ...state, record: false, recordedAudio: null, article };
      });
    } else {
      const { title, wikiSource } = article;
      const { lang } = state;
      dispatch(
        deleteCustomAudio({ title, wikiSource, lang, slideNumber: slideIndex })
      );
      setState({ uploadAudioLoading: true });
    }
  };

  const canRecord = () => {
    const { uploadAudioLoading } = state;

    return !uploadAudioLoading;
  };

  const onUploadAudioToSlide = () => {
    const { article, currentSlideIndex, lang, enableAudioProcessing } = state;
    const { title, wikiSource } = article;
    console.log(article.slides[currentSlideIndex]);
    const blob = article.slides[currentSlideIndex].audioBlob
      ? article.slides[currentSlideIndex].audioBlob &&
        article.slides[currentSlideIndex].audioBlob.blob
      : null;
    if (blob) {
      dispatch(
        uploadSlideAudioHumanVoice({
          title,
          wikiSource,
          lang,
          slideNumber: currentSlideIndex,
          blob,
          enableAudioProcessing,
        })
      );
      setState({ uploadAudioLoading: true });
    } else {
      toast.error("Unable to upload audio, please try again.");
    }
  };

  const onUploadAudioChange = (e) => {
    const { article, currentSlideIndex, lang, enableAudioProcessing } = state;
    const { title, wikiSource } = article;
    if (e.target.files && e.target.files.length > 0) {
      dispatch(
        uploadSlideAudioHumanVoice({
          title,
          wikiSource,
          lang,
          slideNumber: currentSlideIndex,
          blob: e.target.files[0],
          enableAudioProcessing,
        })
      );
      setState({
        uploadAudioLoading: true,
        uploadAudioInputValue: e.target.value,
      });
    }
  };

  const onPublish = () => {
    const publishValid = canPublish();
    if (publishValid) {
      setState({ isUploadFormVisible: true });
    } else {
      setState({ invalidPublishModalVisible: true });
    }
  };

  const onExportFormSubmit = (formValues) => {
    const mode =
      articleLastVideo &&
      articleLastVideo.commonsUrl &&
      articleLastVideo.formTemplate
        ? "update"
        : "new";
    dispatch(
      exportArticleToVideo({
        ...formValues,
        title: article.title,
        wikiSource: article.wikiSource,
        mode,
        humanvoiceId: humanvoice.humanvoice._id,
      })
    );
  };

  const onSaveTranslatedText = (value) => {
    const { lang } = queryString.parse(location.search);
    updateState((state) => {
      const { translatedSlides, currentSlideIndex, article } = state;
      const { title, wikiSource } = article;
      translatedSlides[currentSlideIndex] = value;

      dispatch(
        savetranslatedText({
          title,
          wikiSource,
          lang: lang as string,
          slideNumber: currentSlideIndex,
          text: value,
        })
      );
      return {
        ...state,
        saveTranslatedTextLoading: true,
        translatedSlides,
      };
    });
  };

  const _renderInvalidPublishModal = () => {
    return (
      <InvalidPublishModal
        open={state.invalidPublishModalVisible}
        onClose={() => setState({ invalidPublishModalVisible: false })}
      />
    );
  };

  const _renderUploadModal = () => {
    if (!article || !state.isUploadFormVisible) return;

    let initialFormValues = state.UPLOAD_FORM_INITIAL_VALUES;
    let disabledFields: any[] = [];
    let mode = "new";

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
      };
      disabledFields = ["title"];
      mode = "update";
    }

    return (
      <UploadFileInfoModal
        standalone
        withSubtitles
        subTitle={`Upload exported video for ${article.title}`}
        initialFormValues={initialFormValues}
        disabledFields={disabledFields}
        showExtraUsers
        showAutoDownload
        // mode={mode}
        articleId={article._id}
        currentSlideIndex="exportvideo"
        uploadMessage="Hold on tight!"
        title={article.title}
        wikiSource={article.wikiSource}
        visible={state.isUploadFormVisible}
        onClose={() => setState({ isUploadFormVisible: false })}
        onSubmit={onExportFormSubmit}
      />
    );
  };

  const _renderPreviewFinalVideo = () => {
    if (!canPublish()) return;

    return (
      <Button
        color={state.inPreview ? "blue" : "green"}
        className="c-export-human-voice__final_preview_button"
        onClick={onPreviewFinalVideo}
      >
        {!state.inPreview ? "Preview Final Video" : "Stop Preview"}
      </Button>
    );
  };

  const _renderSlideTranslateBox = () => {
    const {
      translatedSlides,
      currentSlideIndex,
      saveTranslatedTextLoading,
      article,
    } = state;
    const { lang } = queryString.parse(location.search);

    if (!article) return;
    if (article.lang === lang) return;

    return (
      <TranslateBoxV2
        value={translatedSlides[currentSlideIndex] || ""}
        onSave={onSaveTranslatedText}
        loading={saveTranslatedTextLoading}
        currentSlideIndex={currentSlideIndex}
        currentSubslideIndex={0}
        disabled={false}
      />
    );
  };

  const _renderProgress = () => {
    const { article } = state;
    const { lang } = queryString.parse(location.search);

    if (!article || !humanvoice.humanvoice) {
      return <Progress progress indicating percent={0} />;
    }
    const total = article.slides.length;
    let value = 0;
    const translatedSlidesObj = mapTranslatedSlidesArray(
      humanvoice.humanvoice.translatedSlides
    );
    article.slides.forEach((slide, index) => {
      if (
        slide.completed &&
        (lang === article.lang ||
          (humanvoice.humanvoice.translatedSlides &&
            translatedSlidesObj[index] &&
            translatedSlidesObj[index].trim()))
      ) {
        value += 1;
      }
    });
    return (
      <Progress
        progress
        size="small"
        color="green"
        style={{ marginBottom: 0 }}
        percent={Math.ceil((value / total) * 100)}
      />
    );
  };

  const _renderUploadAudio = () => {
    return (
      <Input
        input={
          <input
            type="file"
            onChange={onUploadAudioChange}
            value={state.uploadAudioInputValue}
            accept=".webm, .mp3, .wav"
          />
        }
      />
    );
  };

  const _renderRecordAudio = () => {
    const { uploadAudioLoading, record, article, currentSlideIndex } = state;
    const hasAudio = article.slides[currentSlideIndex].completed;

    return (
      <div style={{ display: "flex", alignItems: "center", height: "5rem" }}>
        <AudioRecorderV2
          //   style={{ marginRight: 10 }}
          //   className="c-export-human-voice__recorder-mic"
          //   backgroundColor="#2185d0"
          //   strokeColor="#000000"
          record={record}
          loading={uploadAudioLoading}
          showLabel={!hasAudio}
          disabled={uploadAudioLoading}
          onStart={toggleRecording}
          onStop={onStop}
        />

        {!record && !uploadAudioLoading && (
          <span>
            <Button
              circular
              basic
              icon="cloud upload"
              color="teal"
              onClick={() =>
                document.getElementById("upload-audio-input")?.click()
              }
              content={hasAudio ? null : "Upload"}
            />
            <Input
              input={
                <input
                  //   ref={(r) => uploadRef = r}
                  disabled={uploadAudioLoading}
                  type="file"
                  id="upload-audio-input"
                  style={{
                    visibility: "hidden",
                    position: "absolute",
                    zIndex: -1,
                  }}
                  onChange={onUploadAudioChange}
                  value={state.uploadAudioInputValue}
                  accept=".webm, .mp3, .wav, .m4a"
                />
              }
            />
          </span>
        )}
        {!uploadAudioLoading &&
          article &&
          article.slides[currentSlideIndex] &&
          article.slides[currentSlideIndex].customAudio &&
          !record && (
            <div className="c-export-human-voice__audio_container">
              <audio
                controls
                onPlay={() => setState({ isPlaying: true, editorMuted: true })}
                onPause={() =>
                  setState({ isPlaying: false, editorMuted: false })
                }
                onEnded={() =>
                  setState({ isPlaying: false, editorMuted: false })
                }
              >
                <source
                  src={
                    article.slides[currentSlideIndex].completed
                      ? `https:${article.slides[currentSlideIndex].customAudio}`
                      : article.slides[currentSlideIndex].customAudio
                  }
                />
                Your browser does not support the audio element.
              </audio>
              <Icon
                name="close"
                className="c-export-human-voice__clear-record"
                onClick={() => onDeleteAudio(currentSlideIndex)}
              />
            </div>
          )}
      </div>
    );
  };

  const _renderSLidesList = () => {
    const { article, currentSlideIndex } = state;

    return (
      <Grid>
        <Grid.Row>
          <Grid.Column width={10}>
            <h5>
              ALL SLIDES (
              {article && article.slides ? article.slides.length : 0})
              <Button
                basic
                circular
                size="tiny"
                disabled={!canPublish()}
                style={{ marginLeft: 10, fontSize: "0.6em" }}
                icon={state.inPreview ? "pause" : "play"}
                color="teal"
                onClick={() => {
                  if (state.inPreview) {
                    onPreviewEnd();
                  } else {
                    onPreviewFinalVideo();
                  }
                }}
              />
            </h5>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>{_renderProgress()}</Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <Grid>
              <SlidesListV2
                currentSlideIndex={currentSlideIndex}
                slides={article.slides}
                onSubslideClick={onSlideChange}
              />
            </Grid>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  };

  const _render = () => {
    const {
      currentSlideIndex,
      article,
      record,
      isPlaying,
      uploadAudioLoading,
      editorMuted,
      inPreview,
    } = state;
    const { lang } = queryString.parse(location.search);
    if (!article) return <div>loading...</div>;

    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column computer={10} mobile={16}>
              <Editor
                mode="viewer"
                layout={1}
                controlled
                customPublish
                headerOptions={{
                  showPublish: true,
                  title: `${article.title}/${lang}`,
                }}
                muted={editorMuted}
                article={article}
                isPlaying={isPlaying}
                onPlay={() => setState({ isPlaying: true })}
                currentSlideIndex={currentSlideIndex}
                onPublish={onPublish}
                onSlideChange={onSlideChange}
                onPlayComplete={() => inPreview && onPreviewEnd()}
                title={article.title}
                fetchArticleVideoState={fetchArticleState}
              />
            </Grid.Column>
            <Grid.Column computer={6} mobile={16}>
              <Grid>
                <Grid.Row>
                  <Grid.Column width={16}>
                    {_renderSlideTranslateBox()}
                    {_renderRecordAudio()}
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column width={16}>{_renderSLidesList()}</Grid.Column>
                </Grid.Row>
              </Grid>
              {/* {this._renderPreviewFinalVideo()} */}
            </Grid.Column>
          </Grid.Row>

          {_renderInvalidPublishModal()}
          {_renderUploadModal()}
        </Grid>
      </div>
    );
  };

  return (
    <StateRenderer
      componentState={fetchArticleState}
      loaderImage="/img/view-loader.gif"
      loaderMessage="Loading your article from the sum of all human knowledge!"
      errorMessage="Error while loading article! Please try again later!"
      onRender={() => _render()}
    />
  );
};

export default ExportHumanVoice;
