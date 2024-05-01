import React, { useEffect, useMemo, useState } from "react";
import ReactPlayer from "react-player";
import { TransitionGroup, CSSTransition } from "react-transition-group";

const REFRESH_INTERVAL = 30;
const FADE_DURATION = 0.75;
const ZOOM_EFFECT_CLASSES = ["zoom-t-l", "zoom-t-r", "zoom-b-l", "zoom-b-r"];
let globalConsumedTime = 0;
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
}

const Slideshow = (data: ISlideShowProps = {}) => {
  const props = {
    showIndex: false,
    repeat: false,
    showArrows: true,
    playing: true,
    enableKeyboard: true,
    useDotIndex: false,
    slideInterval: 2000,
    defaultIndex: 0,
    effect: "fade",
    slides: [],
    height: "100%",
    width: "100%",
    onSlideChange: () => {},
    resetOnFinish: false,
    defaultStartTime: 0,
    ...data,
  };
  // this.state = ;
  // this.consumedTime = 0;
  const [state, setState] = useState<any>({
    currentSlide: props.defaultIndex,
    slideInterval: props.slideInterval,
    effect: props.effect,
    slides: props.slides.length > 0 ? props.slides : props.children,
    fade: "in",
    intervalId: null,
    defaultStartTime: props.defaultStartTime,
    playing: props.playing,
  });

  useEffect(() => {
    // mounted = true;
    if (props.playing) runSlideShow((props.slides[0] as any).time);
    return () => {
      // mounted = false;
      stopSlideShow();
    };
  }, []);

  // TODO: Check this
  useEffect(() => {
    if (state.playing !== props.playing) {
      if (props.playing && props.isActive) {
        restartSlideshow();
        console.log("============= Restart slide show");
      } else {
        stopSlideShow();
      }
      setState((state) => ({ ...state, playing: props.playing }));
    }
  }, [state.playing, props.playing, props.isActive]);

  useEffect(() => {
    if (props.isActive && props.defaultStartTime !== state.defaultStartTime) {
      onDefaultStartTimeChange(props.defaultStartTime);
      console.log(
        "============= Default start time change",
        props.defaultStartTime,
        state.defaultStartTime,
        props.isActive
      );
    }
  }, [props.defaultStartTime, state.defaultStartTime, props.isActive]);

  const onDefaultStartTimeChange = (newStartTime) => {
    // if (!mounted) return;
    stopSlideShow();
    let currentSlide = 0;
    let consumedTime = newStartTime;
    for (let slideIndex = 0; slideIndex < props.slides.length; slideIndex++) {
      const slide = props.slides[slideIndex];
      if (consumedTime - slide.time > 0) {
        consumedTime -= slide.time;
        currentSlide = slideIndex;
      } else {
        currentSlide = slideIndex;
        break;
      }
    }
    globalConsumedTime = consumedTime;
    setState((state) => ({
      ...state,
      currentSlide,
      defaultStartTime: newStartTime,
    }));
    setTimeout(() => {
      props.onSlideChange(currentSlide);
      if (
        (props.slides[currentSlide] as any).type === "video" &&
        playingVideoRef
      ) {
        if ((props.slides[currentSlide] as any).playing) {
          playingVideoRef?.getInternalPlayer().pause();
        }
        if (playingVideoRef?.getInternalPlayer()) {
          playingVideoRef.getInternalPlayer().currentTime =
            globalConsumedTime / 1000;
        }

        if ((props.slides[currentSlide] as any).playing) {
          setTimeout(() => {
            playingVideoRef.getInternalPlayer().play();
          }, 50);
        }
      }
      if (props.playing) {
        restartSlideshow();
      }
    }, 100);
  };

  const runSlideShow = (interval) => {
    // if (!mounted) return;
    if (!interval) return;
    // Run the slide transition after "interval" amount of time
    setTimeout(autoSlideshow, interval);
    console.log("============= Run slide show");
    const intervalId = setInterval(() => {
      if (props.playing) {
        globalConsumedTime = globalConsumedTime + REFRESH_INTERVAL;
        if (
          state.fade === "in" &&
          (props.slides[state.currentSlide] as any).time - globalConsumedTime <=
            FADE_DURATION * 1000
        ) {
          setState((state) => ({ ...state, fade: "out" }));
          console.log("State update", globalConsumedTime);
        }
      }
    }, REFRESH_INTERVAL);
    console.log("Setting interval", intervalId);
    setState((state) => ({
      ...state,
      intervalId,
    }));
  };

  const stopSlideShow = () => {
    setState((state) => {
      console.log("============= Stop slide show", state.intervalId);
      clearInterval(state.intervalId);
      return {
        ...state,
        intervalId: null,
      };
    });
  };

  const restartSlideshow = () => {
    if (state.intervalId) {
      stopSlideShow();
    }
    const { currentSlide } = state;
    const { slides } = props;
    if (
      globalConsumedTime &&
      slides[currentSlide] &&
      globalConsumedTime < slides[currentSlide].time - REFRESH_INTERVAL
    ) {
      runSlideShow(slides[currentSlide].time - globalConsumedTime);
    } else if (props.slides[state.currentSlide]) {
      globalConsumedTime = 0;
      runSlideShow(props.slides[state.currentSlide].time);
    }
  };

  const autoSlideshow = () => {
    if (state.currentSlide === props.slides.length - 1 && !props.repeat) {
      // if (this.props.resetOnFinish) {
      //   this.setState({ currentSlide: 0 }, () => {
      //     this.props.onSlideChange(0);
      //   });
      // }
      return stopSlideShow();
    }
    if (!props.playing) return;
    const currentSlide = (state.currentSlide + 1) % props.slides.length;
    console.log("============= Auto slide show", currentSlide);
    setState((state) => ({
      ...state,
      currentSlide,
      fade: "in",
    }));
    setTimeout(() => {
      props.onSlideChange(currentSlide);
      stopSlideShow();
      globalConsumedTime = 0;
      runSlideShow(props.slides[currentSlide].time);
    });
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
                  if (state.currentSlide === slideIndex) {
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
                <CSSTransition
                  in={true}
                  timeout={{ enter: 5000, exit: 0, appear: 20000 }}
                >
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
                </CSSTransition>
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

  const getZoomEffectClass = () => {
    const index = Math.floor(Math.random() * ZOOM_EFFECT_CLASSES.length);
    return ZOOM_EFFECT_CLASSES[index];
  };

  const renderedSlides = generateRenderedSlides(props.slides);
  const slideEffect = state.effect === undefined ? "fade" : props.effect;
  const slideShowSlides = renderedSlides.map((slide, i) => {
    let showingEffect = "";
    if (state.currentSlide === i) {
      if (state.fade === "in") {
        showingEffect = `showing-${slideEffect}`;
      } else if (state.fade === "out") {
        showingEffect = `showing-${slideEffect}-out`;
      }
    }
    return (
      <li
        className={`slide ${props.effect} ${showingEffect}`}
        key={`mutlimedia-slide-${slide.url}-${i}`}
      >
        {slide.component}
      </li>
    );
  });

  return (
    <div
      style={{
        position: "absolute",
        height: props.height || "100%",
        width: props.width || "100%",
      }}
    >
      <div className="slideshow-container">
        <ul className="slides">{slideShowSlides}</ul>
      </div>
    </div>
  );
};

export default Slideshow;
