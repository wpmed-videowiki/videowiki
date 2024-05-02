import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Grid } from "semantic-ui-react";
import queryString from "query-string";

import Editor from "../../app/components/Editor";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchArticle,
  fetchArticleVideoByArticleVersion,
  fetchVideoByArticleTitle,
} from "../../app/slices/articleSlice";
import StateRenderer from "../../app/components/common/StateRenderer";
import InfoBox from "../../app/components/common/InfoBox";
import Contributors from "../../app/components/common/Contributors";
import { SUPPORTED_TTS_LANGS } from "../../app/utils/config";

const VideowikiArticlePage = () => {
  const { wikiSource, viewerMode } = queryString.parse(location.search);
  const [state, setState] = useState({
    wikiSource,
    muted: !!(viewerMode && viewerMode === "editor"),
    viewerMode: viewerMode && viewerMode === "editor" ? "editor" : "player",
  });
  const {
    article,
    fetchArticleState,
    articleVideo,
    fetchArticleVideoState,
    articleLastVideo,
  } = useAppSelector((state) => state.article);
  const { language } = useAppSelector((state) => state.ui);
  const params = useParams();
  const paramsTitle = params["*"] as string;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  console.log({ params });
  useEffect(() => {
    const { wikiSource, viewerMode } = queryString.parse(location.search);
    if (viewerMode && viewerMode === "editor") {
      if (state.viewerMode !== "editor" || !state.muted) {
        setState((state) => ({
          ...state,
          viewerMode: "editor",
          muted: true,
        }));
      }
    } else {
      setState((state) => ({
        ...state,
        viewerMode: "player",
        muted: false,
      }));
    }
    dispatch(
      fetchArticle({
        title: paramsTitle,
        mode: "viewer",
        wikiSource: wikiSource as string,
      })
    );
  }, []);

  useEffect(() => {
    if (fetchArticleState === "done" && article) {
      if (article._id) {
        const { wikiSource } = queryString.parse(location.search);
        if (
          (!wikiSource ||
            wikiSource === undefined ||
            wikiSource === "undefined") &&
          article.wikiSource
        ) {
          navigate(
            `/${language}/videowiki/${article.title}?wikiSource=${article.wikiSource}`
          );
        } else {
          const { title, version, wikiSource, lang } = article;
          dispatch(
            fetchArticleVideoByArticleVersion({
              title,
              version,
              wikiSource,
              lang,
            })
          );
          dispatch(
            fetchVideoByArticleTitle({
              title: article.title,
              wikiSource: article.wikiSource,
              lang,
            })
          );
        }
      } else if (article.redirect) {
        navigate(
          `/${language}/videowiki/${article.title}?wikiSource=${article.wikiSource}`
        );
      }
    }
    if (fetchArticleState === "done" && (!article || !article._id)) {
      const { wikiSource } = queryString.parse(location.search);
      navigate(`/${language}/wiki/${paramsTitle}?wikiSource=${wikiSource}`);
    }
  }, [fetchArticleState]);

  const onViewerModeChange = (viewerMode) => {
    const update: any = {
      viewerMode,
    };
    if (viewerMode === "editor") {
      update.autoPlay = false;
      update.muted = true;
    } else {
      update.muted = false;
    }
    setState((state) => ({ ...state, ...update }));
  };

  const _render = () => {
    if (!article) return <div>Loading...</div>;

    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column computer={10} mobile={16}>
              {article && article._id && (
                <Editor
                  mode="viewer"
                  layout={"1"}
                  title={article.title}
                  viewerMode={state.viewerMode}
                  onViewerModeChange={onViewerModeChange.bind(this)}
                  muted={state.muted}
                  //   match={match}
                  autoPlay
                  showReferences
                  headerOptions={{
                    showViewerModeDropdown: true,
                    showTranslate: true,
                    showNavigateToArticle: true,
                    showExportArticle: true,
                    showShareButtons: true,
                    showUpdateArticle: true,
                  }}
                  article={article}
                  fetchArticleVideoState={fetchArticleVideoState}
                  articleVideo={articleVideo}
                  articleLastVideo={articleLastVideo}
                  enableRecordAudio={
                    SUPPORTED_TTS_LANGS.indexOf(article.lang) === -1 &&
                    viewerMode === "editor"
                  }
                />
              )}
            </Grid.Column>
            <Grid.Column computer={2}></Grid.Column>
            <Grid.Column computer={4} mobile={16}>
              <div className="c-editor-infobox-container">
                <Contributors title={paramsTitle!} />
                {state.wikiSource && (
                  <InfoBox
                    title={paramsTitle!}
                    titleWikiSource={state.wikiSource as string}
                  />
                )}
              </div>
            </Grid.Column>
          </Grid.Row>
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

export default VideowikiArticlePage;
