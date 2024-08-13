import { useEffect, useRef, useState } from "react";
import $ from "jquery";
import ArticleSummary from "./ArticleSummary";
import { CSSTransition } from "react-transition-group";

interface IAudioPlayerProps {
  isPlaying: boolean;
  onSlidePlayComplete: () => void;
  audio: string;
  description: string;
  playbackSpeed: number;
  showTextTransition: boolean;
  muted: boolean;
  onAudioLoad?: (d?: any) => void;
  showDescription?: boolean;
  onTimeUpdate?: (d: number) => void;
}
const AudioPlayer = (data: IAudioPlayerProps) => {
  const audioPlayer = useRef<HTMLAudioElement>(null);
  const props = {
    onAudioLoad: () => {},
    showDescription: true,
    ...data,
  };

  const [state, updateState] = useState({
    linkHovered: false,
    selectedTitle: "",
    mousePosition: {
      x: 0,
      y: 0,
    },
    playerId: `a${parseInt((Math.random() * 100000000).toString())}`,
  });

  const setState = (data) => {
    updateState((state) => ({ ...state, ...data }));
  };

  useEffect(() => {
    if (audioPlayer.current) {
      audioPlayer.current.playbackRate = props.playbackSpeed;
    }
  }, [props.playbackSpeed]);

  useEffect(() => {
    if (audioPlayer.current) {
      if (props.isPlaying) {
        setTimeout(() => {
          audioPlayer.current
            ?.play()
            .then(() => {})
            .catch((err) => {
              console.log("error playing audio", err);
            });
        }, 100);
      } else {
        if (audioPlayer.current) {
          audioPlayer.current.pause();
        }
      }
    }
  }, [props.isPlaying]);

  const onAudioLoad = () => {
    if (audioPlayer.current) {
      audioPlayer.current.playbackRate = props.playbackSpeed;
    }
    props.onAudioLoad();
  };

  useEffect(() => {
    if (audioPlayer.current) {
      audioPlayer.current.playbackRate = props.playbackSpeed;
    }
    // registerLinksHoverAction();
  }, [audioPlayer.current, props.playbackSpeed]);

  useEffect(() => {
    registerLinksHoverAction();
  }, [props.description]);

  const registerLinksHoverAction = () => {
    const links = $(`.c-editor__content--description-text.${state.playerId} a`);
    links.off("mouseover");
    links.off("mouseleave");

    links.hover(
      (e) => {
        const title = e.target.getAttribute("href").replace("/wiki/", "");
        const mousePosition = {
          x: e.offsetX,
          y: e.offsetY,
        };
        if (!state.linkHovered) {
          setState({ linkHovered: true, selectedTitle: title, mousePosition });
        }
      },
      (e) => {
        resetState();
      }
    );
  };

  const resetState = () => {
    setState({ linkHovered: false, selectedTitle: "" });
  };

  const renderSummary = () => {
    if (!state.linkHovered) {
      return "";
    }

    return (
      <ArticleSummary
        position={state.mousePosition}
        title={state.selectedTitle}
      ></ArticleSummary>
    );
  };

  const { isPlaying, onSlidePlayComplete, description, muted } = props;
  let { audio } = props;
  if (
    process.env.NODE_ENV === "production" &&
    audio &&
    audio.indexOf("https") === -1
  ) {
    audio = `https:${audio}`;
  }

  useEffect(() => {
    if (audioPlayer.current) {
      const onTimeUpdate = () => {
        console.log("Time updated", audioPlayer.current?.currentTime);
        props.onTimeUpdate?.(audioPlayer.current?.currentTime || 0)
      }
      audioPlayer.current.addEventListener('timeupdate', onTimeUpdate)
      return () => audioPlayer.current?.removeEventListener('timeupdate', onTimeUpdate)
    }
    return () => {};
  }, [audioPlayer, props.onTimeUpdate]);

  return (
    <div className="c-editor__content--container">
      <div
        className="c-editor__content--description"
        style={{ visibility: props.showDescription ? "visible" : "hidden" }}
      >
        {audio && !muted && (
          <audio
            autoPlay={isPlaying}
            ref={audioPlayer}
            src={audio}
            onEnded={() => {
              onSlidePlayComplete();
              resetState();
            }}
            onLoadedData={() => onAudioLoad()}
          />
        )}
        {props.showTextTransition ? (
          // <ReactCSSTransitionGroup
          //   transitionName="slideup"
          //   transitionAppear={true}
          //   transitionLeave={false}
          //   transitionAppearTimeout={500}
          //   transitionEnterTimeout={500}
          //   transitionLeaveTimeout={0}
          // >
          //   <span className={`c-editor__content--description-text ${state.playerId}`}
          //     key={description}
          //     dangerouslySetInnerHTML={{ __html: description }}
          //   >
          //   </span>
          // </ReactCSSTransitionGroup>
          <CSSTransition
            in={true}
            appear={true}
            timeout={500}
            classNames="slideup"
          >
            <span
              className={`c-editor__content--description-text ${state.playerId}`}
              key={description}
              dangerouslySetInnerHTML={{ __html: description }}
            ></span>
          </CSSTransition>
        ) : (
          <span
            className={`c-editor__content--description-text ${state.playerId}`}
            key={description}
            dangerouslySetInnerHTML={{ __html: description }}
          ></span>
        )}
      </div>
      {renderSummary()}
    </div>
  );
};

export default AudioPlayer;
