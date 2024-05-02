import { TransitionGroup, CSSTransition } from "react-transition-group";

import SlideShow from "../../common/SlideShow";
import One from "./One";
import Two from "./Two";
import Three from "./Three";
import Four from "./Four";
import Five from "./Five";

import AudioPlayer from "../AudioPlayer";
import { useCallback, useMemo } from "react";

let media: any[] = [];
let playingMedia = null;
let layoutStartSlide = 0;
let chosenLayout: any = 1;

const defaultComponent = (
  <div className="c-editor__content-video-viewer">
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

interface IViewerProps {
  slides: any[];
  currentSlideIndex: number;
  isPlaying: boolean;
  showDescription: boolean;
  onSlidePlayComplete: (e?: any) => void;
  playbackSpeed: number;
  onSubMediaSlideChange: (e?: any) => void;
  currentSubmediaIndex: number;
  onAudioLoad: (e: any) => void;
  muted: boolean;
  defaultSlideStartTime: number;
  layout: string | number;
}
const Viewer = (props: IViewerProps) => {
  /*
    Selects a layout between 2, 3, 4 and 5 slides randomly.
    If the number of slides are less than 6, return the number of slides as layout
    or 2, whichever is higher.
  */
  const _chooseLayout = () => {
    const { slides } = props;
    if (props.layout === "random") {
      if (slides.length <= 5) {
        return slides.length > 1 ? slides.length : 2;
      } else {
        return Math.floor(Math.random() * 4) + 2;
      }
    } else {
      return props.layout;
    }
  };

  const showItem = useCallback(
    (item, isActive) => {
      if (!item) return;

      const { media } = item;
      // const media = item.media?.slice().map(m => ({...m}))
      let component;
      const mediaArray: any[] = [];
      if (media && media.length > 0) {
        if (isActive) {
          media.forEach((mitem, index) => {
            const array = mitem.url.split(".");
            const format = array[array.length - 1];
            switch (format) {
              case "mp4":
              case "ogg":
              case "ogv":
              case "webm":
                const playing =
                  props.isPlaying && props.currentSubmediaIndex === index;
                mediaArray.push({ ...mitem, playing });
                break;
              default:
                mediaArray.push({ ...mitem });
                break;
            }
          });
        } else {
          const array = media[0].url.split(".");
          const format = array[array.length - 1];
          switch (format) {
            case "mp4":
            case "ogg":
            case "ogv":
            case "webm":
              mediaArray.push({ ...media[0], playing: false });
              break;
            default:
              mediaArray.push({ ...media[0] });
              break;
          }
        }

        component = (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <SlideShow
              slides={mediaArray}
              playing={props.isPlaying && isActive}
              isActive={isActive}
              key={`slideshow-${props.currentSlideIndex}`}
              defaultStartTime={props.defaultSlideStartTime}
              onSlideChange={props.onSubMediaSlideChange}
            />
          </div>
        );
      } else {
        component = defaultComponent;
      }

      return isActive ? (
        component
      ) : (
        <div className="outer-container">
          <div className="inner-container">
            <div className="overlay" />
            <div className="component-wrapper">{component}</div>
          </div>
        </div>
      );
    },
    [props.currentSlideIndex, props.isPlaying, props.currentSubmediaIndex]
  );

  const renderItems = useMemo(() => {
    const { currentSlideIndex, slides } = props;

    if (chosenLayout === 1) {
      media = [slides[currentSlideIndex]];
      layoutStartSlide = 0;
    } else {
      if (currentSlideIndex === 0) {
        layoutStartSlide = 0;
        media = slides.slice(
          currentSlideIndex,
          chosenLayout + currentSlideIndex
        );
      } else if (currentSlideIndex >= layoutStartSlide + chosenLayout) {
        chosenLayout = _chooseLayout();
        layoutStartSlide = currentSlideIndex;
        media = slides.slice(
          currentSlideIndex,
          chosenLayout + currentSlideIndex
        );
      } else if (currentSlideIndex < layoutStartSlide) {
        chosenLayout = _chooseLayout();
        layoutStartSlide = layoutStartSlide - chosenLayout;
        media = slides.slice(layoutStartSlide, layoutStartSlide + chosenLayout);
      }
    }

    // this.chosenLayout = 5;
    const current = currentSlideIndex - layoutStartSlide;

    let layout;
    switch (chosenLayout) {
      case 5:
        layout = (
          <Five
            media={media}
            current={current}
            renderItem={(item, isActive) => showItem(item, isActive)}
          />
        );
        break;
      case 4:
        layout = (
          <Four
            media={media}
            current={current}
            renderItem={(item, isActive) => showItem(item, isActive)}
          />
        );
        break;
      case 3:
        layout = (
          <Three
            media={media}
            current={current}
            renderItem={(item, isActive) => showItem(item, isActive)}
          />
        );
        break;
      case 1:
        layout = (
          <One
            media={media}
            key={`slide-layout-${currentSlideIndex}`}
            // current={current}
            renderItem={(item, isActive) => showItem(item, isActive)}
          />
        );
        break;
      default:
        layout = (
          <Two
            media={media}
            current={current}
            renderItem={(item, isActive) => showItem(item, isActive)}
          />
        );
    }
    return (
      <div key={chosenLayout} style={{ height: "100%" }}>
        {layout}
      </div>
    );
  }, [props.currentSlideIndex, props.slides, chosenLayout, showItem]);

  const {
    currentSlideIndex,
    slides,
    onSlidePlayComplete,
    isPlaying,
    playbackSpeed,
  } = props;
  const currentSlide = slides[currentSlideIndex];

  const { audio, text } = currentSlide;
  return (
    <div className="carousel">
      {/* <ReactCSSTransitionGroup
        transitionName="translate"
        transitionAppear={true}
        transitionLeave={false}
        transitionAppearTimeout={2000}
        transitionEnterTimeout={2000}
        transitionLeaveTimeout={0}
        className="carousel__slide"
      >
        {renderItems()}
      </ReactCSSTransitionGroup> */}
      {/* TODO: check this transition */}
      <CSSTransition
        in={true}
        appear={true}
        timeout={{ appear: 2000, enter: 2000, exit: 0 }}
      >
        <span className="carousel__slide">{renderItems}</span>
      </CSSTransition>
      <AudioPlayer
        description={text}
        showDescription={props.showDescription}
        audio={audio}
        onSlidePlayComplete={onSlidePlayComplete}
        isPlaying={isPlaying}
        muted={props.muted}
        onAudioLoad={props.onAudioLoad}
        showTextTransition={true}
        playbackSpeed={playbackSpeed}
      />
    </div>
  );
};

export default Viewer;
