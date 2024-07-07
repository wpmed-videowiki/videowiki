import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import querystring from "querystring";
import moment from "moment";
import { Grid, Button } from "semantic-ui-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  fetchVideosHistory,
  retryYouTubeUpload,
} from "../../../app/slices/videoSlice";
import { isoLangs } from "../../../app/utils/langs";
import websockets from "../../../app/websockets";
import fileUtils from "../../../app/utils/fileUtils";
import Editor from "../../../app/components/Editor";
import StateRenderer from "../../../app/components/common/StateRenderer";
import { useTranslation } from "react-i18next";

const styles: any = {
  container: {
    // height: 54,
  },
  separator: {
    position: "absolute",
    display: "inline-block",
    height: "97%",
    width: 1,
    background: "black",
    zIndex: 2,
    left: "30%",
  },
  title: {
    fontWeight: "bold",
    display: "inline-block",
    width: "30%",
    padding: ".7rem",
    textAlign: "left",
    backgroundColor: "#61bbff",
    borderBottom: "2px solid rgb(97, 187, 255)",
    borderTop: "none",
    verticalAlign: "top",
    float: "left",
    maxWidth: "30%",
    height: "110%",
  },
  description: {
    display: "inline-block",
    padding: ".7rem",
    position: "relative",
    verticalAlign: "middle",
    wordBreak: "break-word",
    float: "left",
    width: "70%",
    maxWidth: "70%",
    backgroundColor: "white",
    border: "2px solid white",
  },
};
const VideosHistory = () => {
  const { language } = useAppSelector((state) => state.ui);
  const videosHistory = useAppSelector((state) => state.video.videosHistory);
  const { t } = useTranslation();

  const params = useParams();
  const paramsTitle = params["*"] as string;
  const dispatch = useAppDispatch();

  const getDecriptionUrl = (media, uploadTarget) => {
    if (!media) return null;

    const fileName = media.split("/").pop();
    if (uploadTarget === "nccommons") {
      return `https://nccommons.org/wiki/File:${fileName}`;
    }

    return `https://commons.wikimedia.org/wiki/File:${fileName}`;
  };

  const getVideoSrc = (video) => {
    if (video.archived && video.archivename) {
      const commonsUrl = video.commonsUploadUrl || video.commonsUrl;
      if (commonsUrl.indexOf("/commons/archive/") > -1) return commonsUrl;
      const pathParts = commonsUrl.split("/commons/");
      const fileHashPrefix = pathParts[1].split("/");
      fileHashPrefix.pop();
      return `${pathParts[0]}/commons/archive/${fileHashPrefix.join("/")}/${
        video.archivename
      }`;
    }
    return video.commonsUploadUrl || video.commonsUrl || video.url;
  };

  const onRetryYoutubeUpload = (video) => {
    dispatch(retryYouTubeUpload({ videoId: video._id }));
  };

  const _renderFileInfo = (videoInfo) => {
    // const date = videoInfo.formTemplate && videoInfo.formTemplate.form ? moment(videoInfo.formTemplate.form.date).format('DD MMMM YYYY') : 'Unknown';
    const date = moment(videoInfo.created_at).format("DD MMMM YYYY");
    const authorsSource =
      videoInfo && videoInfo.wikiSource
        ? `https://xtools.wmflabs.org/articleinfo/${videoInfo.wikiSource.replace(
            "https://",
            ""
          )}/${videoInfo.title}?format=html`
        : "";
    const commonsUrl = getDecriptionUrl(
      videoInfo.commonsUrl,
      videoInfo.article.uploadTarget
    );

    return (
      <div
        style={{
          border: "1px solid",
          borderLeft: "1px solid",
          marginTop: 10,
          backgroundColor: "#61bbff",
        }}
      >
        <div style={styles.separator}></div>
        {commonsUrl && (
          <div style={{ ...styles.container, height: 50 }}>
            <div style={{ ...styles.title, height: "120%" }}>
              {t("ExportHistory.commons_url")}
            </div>
            <div style={styles.description}>
              <a target="_blank" href={commonsUrl}>
                {commonsUrl}
              </a>
            </div>
          </div>
        )}
        <div style={{ content: "", clear: "both" }}></div>
        <div style={{ ...styles.container, height: 50 }}>
          <div style={{ ...styles.title, height: "120%" }}>
            {t("ExportHistory.youtube_url")}
          </div>
          <div style={styles.description}>
            {videoInfo.youtubeVideoId ? (
              <a
                target="_blank"
                href={`https://www.youtube.com/watch?v=${videoInfo.youtubeVideoId}`}
              >{`https://www.youtube.com/watch?v=${videoInfo.youtubeVideoId}`}</a>
            ) : (
              <Button
                primary
                disabled={["queued", "processing"].includes(
                  videoInfo.youtubeUploadStatus
                )}
                loading={["queued", "processing"].includes(
                  videoInfo.youtubeUploadStatus
                )}
                onClick={() => onRetryYoutubeUpload(videoInfo)}
              >
                {t("ExportHistory.retry_upload")}
              </Button>
            )}
          </div>
        </div>
        <div style={{ content: "", clear: "both" }}></div>

        <div style={{ ...styles.container }}>
          <div style={{ ...styles.title }}>{t("ExportHistory.download")}</div>
          <div style={styles.description}>
            <a
              href="javascript:void(0)"
              onClick={() =>
                fileUtils.downloadFile(
                  videoInfo.commonsUrl
                    ? `${getVideoSrc(videoInfo)}?download`
                    : videoInfo.url
                )
              }
            >
              {t("ExportHistory.click_here")}
            </a>
          </div>
        </div>
        <div style={{ content: "", clear: "both" }}></div>

        {videoInfo && videoInfo.user && (
          <div style={{ ...styles.container }}>
            <div style={{ ...styles.title }}>{t("ExportHistory.user")}</div>
            <div style={styles.description}>
              <a
                target="_blank"
                href={`https://commons.wikimedia.org/wiki/User:${videoInfo.user.username}`}
              >
                {videoInfo.user.username}
              </a>
            </div>
          </div>
        )}
        <div style={{ content: "", clear: "both" }}></div>

        {videoInfo.vlcSubtitles && (
          <div style={{ ...styles.container }}>
            <div style={{ ...styles.title }}>
              {t("ExportHistory.subtitles")}
            </div>
            <div style={styles.description}>
              <a
                href="javascript:void(0)"
                onClick={() => fileUtils.downloadFile(videoInfo.vlcSubtitles)}
              >
                {t("ExportHistory.click_here")}
              </a>
            </div>
          </div>
        )}
        <div style={{ content: "", clear: "both" }}></div>
        <div style={styles.container}>
          <div style={styles.title}>{t("ExportHistory.authors")}</div>
          <div style={styles.description}>
            {t("ExportHistory.videowiki_foundation")},{" "}
            <a target="_blank" href={authorsSource}>
              {t("ExportHistory.authors_of_the_article")}
            </a>
          </div>
        </div>
        <div style={{ content: "", clear: "both" }}></div>

        <div style={styles.container}>
          <div style={styles.title}>{t("ExportHistory.licence")}</div>
          <div style={styles.description}>
            <a
              target="_blank"
              href="https://creativecommons.org/licenses/by-sa/4.0/"
            >
              Creative Commons 4.0
            </a>
          </div>
        </div>
        <div style={{ content: "", clear: "both" }}></div>

        <div style={styles.container}>
          <div style={styles.title}>Date</div>
          <div style={styles.description}>{date}</div>
        </div>
        <div style={{ content: "", clear: "both" }}></div>

        <div style={styles.container}>
          <div style={styles.title}>{t("ExportHistory.version")}</div>
          <div style={styles.description}>{videoInfo.version}</div>
        </div>
        <div style={{ content: "", clear: "both" }}></div>

        {videoInfo.lang && (
          <div style={styles.container}>
            <div style={styles.title}>{t("ExportHistory.language")}</div>
            <div style={styles.description}>
              {isoLangs[videoInfo.lang].name}
            </div>
          </div>
        )}
        <div style={{ content: "", clear: "both" }}></div>
      </div>
    );
  };

  const _render = () => {
    const { wikiSource } = querystring.parse(location.search.replace("?", ""));

    return (
      <div>
        <div>
          <div
            style={{
              textAlign: "center",
              border: "2px solid  #a09c9c",
              padding: 40,
              marginBottom: 20,
              display: "flex",
            }}
          >
            <h3 style={{ flex: 5, margin: 0, textAlign: "left" }}>
              <Link
                to={`/${language}/videowiki/${paramsTitle}?wikiSource=${wikiSource}`}
              >
                {t("ExportProgress.back_to_article")}
              </Link>
            </h3>
            <h3
              style={{
                flex: 10,
                margin: 0,
                textAlign: "left",
                wordBreak: "break-all",
              }}
            >
              {t("Editor.export_history")}: {paramsTitle}
            </h3>
          </div>
        </div>
        {videosHistory && videosHistory.videos.length === 0 && (
          <h1 style={{ textAlign: "center", marginTop: 120, marginLeft: -50 }}>
            {t("ExportHistory.no_videos_found")}
          </h1>
        )}
        <Grid>
          {videosHistory.videos.map((video) => (
            <Grid.Row key={video._id}>
              <Grid.Column computer={11} tablet={11} mobile={16}>
                {video.article && (
                  <Editor
                    mode="editor"
                    showReferences
                    headerOptions={{
                      showBackButton: true,
                      showNavigateToArticle: true,
                    }}
                    article={video.article}
                    title={video.article.title}
                    fetchArticleVideoState=""
                  />
                )}
              </Grid.Column>

              <Grid.Column computer={5} tablet={5} only="computer tablet">
                <div style={{ height: "100%" }}>
                  <div style={{ height: "30%", marginTop: "3%" }}>
                    <video
                      className="history-video"
                      controls
                      width={"100%"}
                      height={"100%"}
                      crossOrigin="anonymous"
                      preload={"false"}
                    >
                      <source src={getVideoSrc(video)} />
                      {video.vttSubtitles && (
                        <track
                          src={video.vttSubtitles}
                          kind="subtitles"
                          srcLang={video.article.langCode}
                          label={video.article.lang.toUpperCase()}
                        />
                      )}
                    </video>
                  </div>
                  <div style={{ height: "70%", position: "relative" }}>
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0.7rem",
                        width: "100%",
                      }}
                    >
                      {_renderFileInfo(video)}
                    </div>
                  </div>
                </div>
              </Grid.Column>
              <Grid.Column mobile={16} only="mobile">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    marginTop: 20,
                  }}
                >
                  <video
                    src={getVideoSrc(video)}
                    controls
                    width={"100%"}
                    height={"100%"}
                    preload={"false"}
                  />
                  <div style={{ position: "relative", width: "100%" }}>
                    {_renderFileInfo(video)}
                  </div>
                </div>
              </Grid.Column>
            </Grid.Row>
          ))}
        </Grid>
      </div>
    );
  };

  const { fetchVideosHistoryState } = videosHistory;

  useEffect(() => {
    const title = paramsTitle as string;
    const wikiSource = querystring.parse(location.search.replace("?", ""))
      .wikiSource as string;
    dispatch(fetchVideosHistory({ title, wikiSource: wikiSource as string }));
    websockets.subscribeToEvent(
      websockets.websocketsEvents.UPLOAD_YOUTUBE_FINISH(
        `${title}_${wikiSource}`
      ),
      (data) => {
        dispatch(fetchVideosHistory({ title, wikiSource }));
      }
    );
    return () => {
      websockets.unsubscribeFromEvent(
        websockets.websocketsEvents.UPLOAD_YOUTUBE_FINISH(
          `${title}_${wikiSource}`
        )
      );
    };
  }, [paramsTitle]);

  return (
    <StateRenderer
      componentState={fetchVideosHistoryState}
      loaderImage="/img/view-loader.gif"
      loaderMessage={t("ExportHistory.loading_videos")}
      errorMessage={t("ExportHistory.loading_videos_error")}
      onRender={() => _render()}
    />
  );
};

export default VideosHistory;
