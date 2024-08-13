import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { TransitionGroup, CSSTransition } from "react-transition-group";

const REFRESH_INTERVAL = 30;
const FADE_DURATION = 0.75;
const ZOOM_EFFECT_CLASSES = ["zoom-t-l", "zoom-t-r", "zoom-b-l", "zoom-b-r"];
let mounted = false;
let playingVideoRef: any = null;

interface ISlideShowProps {
  showIndex?: boolean;
  showArrows?: boolean;
  playing?: boolean;
  enableKeyboard?: boolean;
  repeat?: boolean;
  useDotIndex?: boolean;
  slideInterval?: number;
  defaultIndex?: number;
  effect?: string;
  slides?: any[];
  children?: any[];
  height?: string;
  width?: string;
  onSlideChange?: (slide: any) => void;
  resetOnFinish?: boolean;
  defaultStartTime?: number;
  isActive?: boolean;
  currentTime: number;
}

const SlideshowV2 = (data: ISlideShowProps = { currentTime: 0 }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const renderSlide = (slide) => {
    const array = slide.url.split(".");
    const format = array[array.length - 1];
    switch (format) {
      case "mp4":
      case "ogg":
      case "ogv":
      case "webm":
        return (
          <ReactPlayer
            url={slide.url}
            width="100%"
            height="100%"
            playing={slide.playing}
            volume={0}
            // key={`mutlimedia-slide-${slide.url}`}
            style={{ width: "100%", height: "100%" }}
            ref={(ref) => {
              playingVideoRef = ref;
            }}
          />
        );
      default:
        return (
          <div
            className="carousel__image_wrapper"
            // key={`mutlimedia-slide-${slide.url}`}
          >
            {/* TODO: check this transition */}
            <span className="carousel__image">
              {!slide.fullWidth && (
                <img src={slide.url} alt="" className="blurred_background" />
              )}
              <img
                src={slide.url}
                alt=""
                className={`${slide.fullWidth ? "stretch" : ""}`}
                style={{ height: "100%", zIndex: 1 }}
              />
            </span>
          </div>
        );
    }
  };
  const generateRenderedSlides = (slides) => {
    const renderedSlides: any[] = [];
    slides.forEach((slide, slideIndex) => {
      const array = slide.url.split(".");
      const format = array[array.length - 1];
      switch (format) {
        case "mp4":
        case "ogg":
        case "ogv":
        case "webm":
          renderedSlides.push({
            component: (
              <ReactPlayer
                url={slide.url}
                width="100%"
                height="100%"
                playing={slide.playing}
                volume={0}
                // key={`mutlimedia-slide-${slide.url}`}
                style={{ width: "100%", height: "100%" }}
                ref={(ref) => {
                  if (currentSlide === slideIndex) {
                    playingVideoRef = ref;
                  }
                }}
              />
            ),
            time: slide.time,
            url: slide.url,
          });
          break;
        default:
          renderedSlides.push({
            component: (
              <div
                className="carousel__image_wrapper"
                // key={`mutlimedia-slide-${slide.url}`}
              >
                {/* TODO: check this transition */}
                <span className="carousel__image">
                  {!slide.fullWidth && (
                    <img
                      src={slide.url}
                      alt=""
                      className="blurred_background"
                    />
                  )}
                  <img
                    src={slide.url}
                    alt=""
                    className={`${slide.fullWidth ? "stretch" : ""}`}
                    style={{ height: "100%", zIndex: 1 }}
                  />
                </span>
              </div>
            ),
            time: slide.time,
            url: slide.url,
          });
          break;
      }
    });
    return renderedSlides;
  };

  const renderedSlides = generateRenderedSlides(data.slides);
  const slideShowSlides = renderedSlides.map((slide, i) => {
    let showingEffect = "";

    return (
      <li
        className={`slide showing-fade ${data.effect} ${showingEffect}`}
        key={`mutlimedia-slide-${slide.url}-${i}`}
      >
        {slide.component}
      </li>
    );
  });

  useEffect(() => {
    let activeSlide = 0;
    let acc = 0;
    for (let index = 0; index < data.slides!.length; index++) {
      const slide = data.slides![index];
      if (data.currentTime >= acc && data.currentTime < acc + slide.time) {
        activeSlide = index;
        break;
      }
      acc += slide.time;
    }
    if (activeSlide !== currentSlide) {
      setCurrentSlide(activeSlide);
      data.onSlideChange?.(activeSlide);
    }
  }, [data.slides, data.currentTime, setCurrentSlide, currentSlide]);

  const currentMediaItem = data.slides![currentSlide];
  return (
    <div
      style={{
        position: "absolute",
        height: "100%",
        width: "100%",
      }}
    >
      <div className="slideshow-container">
        <ul className="slides">
          {currentMediaItem && <li className="slide showing-fade">{renderSlide(currentMediaItem)}</li>}
        </ul>
      </div>
    </div>
  );
};

export default SlideshowV2;
