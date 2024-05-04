import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Progress } from "semantic-ui-react";

import { fetchVideo, onClearVideo } from "../../../app/slices/videoSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import ProgressArrows from "../../../app/components/ProgressArrows";

const VideoConvertProgress = () => {
  const _sessionPoller = useRef<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { language } = useAppSelector((state) => state.ui);
  const { videoConvertProgress } = useAppSelector((state) => state.video);
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(onClearVideo());
    if (params.id) {
      dispatch(fetchVideo({ id: params.id }));
      _startPoller();
    }
    return () => {
      _stopPoller();
      dispatch(onClearVideo());
    };
  }, [params.id]);

  useEffect(() => {
    if (
      ["failed", "uploaded"].includes(videoConvertProgress.video.status) &&
      _sessionPoller.current
    ) {
      _stopPoller();
    } else if (
      !["failed", "uploaded"].includes(videoConvertProgress.video.status) &&
      !_sessionPoller.current
    ) {
      _startPoller();
    } else if (videoConvertProgress.video.status === "uploaded") {
      setUploadProgress(100);
      setTimeout(() => {
        _navigateToHistory();
      }, 3000);
    }
  }, [videoConvertProgress.video.status, _sessionPoller.current]);

  const _startPoller = () => {
    if (!_sessionPoller.current) {
      _sessionPoller.current = setInterval(() => {
        const { id } = params;
        dispatch(fetchVideo({ id: id as string }));
      }, 5000);
    }
  };

  const _stopPoller = () => {
    if (_sessionPoller.current) {
      clearInterval(_sessionPoller.current);
      _sessionPoller.current = null;
    }
  };

  const _navigateToHistory = () => {
    _stopPoller();
    setTimeout(() => {
      const { title, wikiSource } = videoConvertProgress.video;
      navigate(`/${language}/videos/history/${title}?wikiSource=${wikiSource}`);
      // Clear the video upload status
      dispatch(onClearVideo());
    }, 2000);
  };

  if (!videoConvertProgress.video) return <div>loading...</div>;

  const title = videoConvertProgress.video
    ? videoConvertProgress.video.title
    : "";
  const status = videoConvertProgress.video
    ? videoConvertProgress.video.status
    : "";

  let progress = 0;
  // check for the latest available progress percentage
  if (videoConvertProgress.video.wrapupVideoProgress) {
    progress = videoConvertProgress.video.wrapupVideoProgress;
  } else if (videoConvertProgress.video.combiningVideosProgress) {
    progress = videoConvertProgress.video.combiningVideosProgress;
  } else if (videoConvertProgress.video.textReferencesProgress) {
    progress = videoConvertProgress.video.textReferencesProgress;
  } else {
    progress = videoConvertProgress.video.conversionProgress;
  }

  progress = Math.floor(progress);

  return (
    <div className="u-page-center" style={{ marginTop: "7em" }}>
      {title && status !== "failed" && (
        <h2>{`Exporting Videowiki Article for ${title
          .split("_")
          .join(" ")} to Video`}</h2>
      )}
      {status === "failed" && (
        <h2>
          Something went wrong while exporting the article. please try again
          <br />
          <br />
          <Link
            to={`/${language}/videowiki/${videoConvertProgress.video.title}?wikiSource=${videoConvertProgress.video.wikiSource}`}
          >
            Back to article
          </Link>
        </h2>
      )}
      {status !== "failed" && (
        <Progress
          className="c-app-conversion-progress"
          percent={progress}
          progress
          indicating
        />
      )}
      {status !== "failed" && (
        <ProgressArrows
          stage1={videoConvertProgress.video.conversionProgress || 0}
          stage2={videoConvertProgress.video.textReferencesProgress || 0}
          stage3={videoConvertProgress.video.combiningVideosProgress || 0}
          stage4={videoConvertProgress.video.wrapupVideoProgress || 0}
        />
      )}
      <div>
        {status === "queued" && (
          <span>
            Your video is currently queued to be exported. please wait
          </span>
        )}
        {/* {status === 'progress' && (
            <span>{`Exporting - ${progress}% exported`}</span>
          )} */}
        {status === "converted" && (
          <span>Exported Successfully! Uploading to Commons...</span>
        )}
        {status === "uploaded" && <span>Uploaded Successfully!</span>}
      </div>
      {status === "converted" && (
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 30 }}
        >
          <Progress
            style={{ width: 500, marginLeft: "-1rem" }}
            percent={uploadProgress}
            progress
            indicating
          />
        </div>
      )}
      {/* {['failed', 'converted', 'uploaded'].indexOf(status) === -1 && (
          <div>
            <strong>Quick Fact: </strong>
            It takes 8-10 minutes to export an article. So get some <img className="c-app-coffee" src="https://s3.eu-central-1.amazonaws.com/vwpmedia/statics/coffee.png" /> <img className="c-app-coffee" src="https://s3.eu-central-1.amazonaws.com/vwpmedia/statics/coffee.png" /> until then.
          </div>
        )} */}
    </div>
  );
};

export default VideoConvertProgress;
