import { useEffect, useState } from "react";
import { Grid, Popup, Icon } from "semantic-ui-react";
// import Range from "rc-slider/lib/Range";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import ProgressSoundPlayer from "../common/ProgressSoundPlayer";
import { getUrlMediaType } from "../../utils/helpers";
import { VIDEO_PLAYER_THUMBNAIL_IMAGE } from "../../../constants";
import { useDebounce } from "use-debounce";

let SoundPlayerRef: any = null;

function filterLastItem(arr) {
  const newArr = arr.slice();
  newArr.pop();
  return newArr;
}

function mapValues(arr) {
  const consumed: any[] = [];
  const values: any[] = [];
  arr.forEach((item, index) => {
    let v;
    if (index === arr.length - 1) {
      v = 100 - item;
    } else {
      v = arr[index + 1] - item;
    }
    values.push(v);
    consumed.push(v);
  });
  return values;
}

function formatTime(time: number) {
  return Number.parseFloat((time / 1000).toString()).toPrecision(2);
}

function calculatePercentageFromDuration(totalDuration, durations) {
  const percentages: any[] = [];
  durations.forEach((duration, index) => {
    const percentage = (duration / totalDuration) * 100;
    if (index === 0) {
      percentages.push(percentage);
    } else {
      percentages.push(percentages[index - 1] + percentage);
    }
  });
  return percentages;
}

function calculateDurationFromPercentage(totalDuration, percentages) {
  const durations: any[] = [];
  percentages.forEach((percentage) => {
    const duration = (percentage * totalDuration) / 100;
    durations.push(duration);
  });
  return durations;
}

const TRACK_STYLES = { backgroundColor: "red", height: 100 };
const HANDLE_STYLES = {
  backgroundColor: "#2185d0",
  height: 100,
  border: "none",
  borderRadius: 0,
  marginTop: 0,
};
const RAIL_STYLES = { backgroundColor: "black", height: 100 };

interface IEditorTimelineProps {
  currentSlide: any;
  currentSlideIndex: number;
  onDurationsChange: (slide: any, durations: any) => void;
  isPlaying: boolean;
  onAudioLoad: () => void;
  onPlayComplete: () => void;
  onSeekEnd: (data: any) => void;
}

const EditorTimeline = (props: IEditorTimelineProps) => {
  const [durationChangeData, setDurationChangeData] = useState<any>(null);

  const [debouncedDurationChange] = useDebounce(durationChangeData, 2000);

  const [state, updateState] = useState({
    value: [],
    mappedValues: [],
    marks: {},
    trackStyles: [],
    handleStyles: [],
    currentSlideIndex: props.currentSlideIndex,
  });
  const setState = (data) => {
    updateState((state) => ({ ...state, ...data }));
  };

  useEffect(() => {
    if (props.currentSlide) {
      setCurrentSlideTimeline(props.currentSlide);
    }
  }, []);

  useEffect(() => {
    if (debouncedDurationChange && debouncedDurationChange.length > 0) {
      props.onDurationsChange(debouncedDurationChange[0], debouncedDurationChange[1]);
    }
  }, [debouncedDurationChange]);

  useEffect(() => {
    if (state.currentSlideIndex !== props.currentSlideIndex) {
      props.onDurationsChange(props.currentSlide, state.mappedValues);
      setCurrentSlideTimeline(props.currentSlide);
    }
  }, [props.currentSlideIndex]);

  const setCurrentSlideTimeline = (slide) => {
    const { duration } = slide;
    let { media } = slide;
    media = filterLastItem(media);
    const mediaTimings = calculatePercentageFromDuration(
      duration,
      media.map((mItem) => mItem.time)
    );
    const value = [0, ...mediaTimings, 100];
    const mappedValues = calculateDurationFromPercentage(
      duration,
      mapValues(filterLastItem(value))
    );
    const marks = getMarks(value, duration);
    const trackStyles = slide.media.map(({ url, smallThumb }) => ({
      ...TRACK_STYLES,
      background: `url(${
        getUrlMediaType(url) === "video" && !smallThumb
          ? VIDEO_PLAYER_THUMBNAIL_IMAGE
          : smallThumb || url
      }) center center / contain no-repeat`,
    }));
    const handleStyles = [{ display: "none" }].concat(
      filterLastItem(slide.media).map((image, index) => HANDLE_STYLES)
    );
    handleStyles.push({ display: "none" });
    setState({ value, mappedValues, marks, trackStyles, handleStyles });
  };

  const onChange = (values) => {
    if (props.currentSlide.media && props.currentSlide.media.length > 1) {
      const mappedValues = calculateDurationFromPercentage(
        props.currentSlide.duration,
        mapValues(filterLastItem(values))
      );
      const marks = getMarks(values, props.currentSlide.duration);
      setState({ value: values, mappedValues, marks });
      setDurationChangeData([props.currentSlide, mappedValues]);
    }
  };

  const getMarks = (value, duration) => {
    if (!value) return;
    const marks = {};
    const valueSlice = value.slice();
    valueSlice.splice(0, 1);
    const mappedValues = calculateDurationFromPercentage(
      duration,
      mapValues(filterLastItem(value))
    );
    valueSlice.forEach((val, index) => {
      if (mappedValues[index]) {
        marks[val] = {
          label: `${formatTime(mappedValues[index])}s`,
          style: { top: -35, color: "black" },
        };
      }
    });
    return marks;
  };

  const getRailStyles = () => {
    return RAIL_STYLES;
  };

  const getStreamUrl = () => {
    if (!props.currentSlide || !props.currentSlide.audio) return "";
    return props.currentSlide.audio.indexOf("http") === -1
      ? `https:${props.currentSlide.audio}`
      : props.currentSlide.audio;
  };

  return (
    <div
      style={{
        padding: "2rem",
        paddingTop: "1rem",
        fontWeight: "bold",
        fontSize: "1.2rem",
        border: "1px solid #444",
        borderTop: 0,
        background: "#eee",
      }}
    >
      <Grid verticalAlign="middle" centered>
        <Grid.Row>
          <Grid.Column computer={4} mobile={4}>
            Timing
            <Popup
              trigger={<Icon name="info circle" className="pl1" />}
              content={
                <div>
                  <div>
                    Control the Timing of the slide's media by adjusting the
                    drag bar on the right to match the required position in the
                    bottom audio player
                  </div>
                </div>
              }
            />
          </Grid.Column>

          <Grid.Column computer={12} mobile={16}>
            <Grid.Row>
              <Grid.Column width={16}>
                {props.currentSlide && (
                  <ProgressSoundPlayer
                    key={`progress-player-stream-${getStreamUrl()}`}
                    streamUrl={getStreamUrl()}
                    ref={(ref) => (SoundPlayerRef = ref)}
                    preload={"auto"}
                    isPlaying={props.isPlaying}
                    onAudioLoad={props.onAudioLoad}
                    onStopTrack={props.onPlayComplete}
                    onSeekEnd={props.onSeekEnd}
                  />
                )}
              </Grid.Column>
              <Grid.Column width={16}>
                <Slider
                  range
                  key={`range-slider-${props.currentSlideIndex}`}
                  style={{ height: 100 }}
                  defaultValue={state.value}
                  value={state.value}
                  allowCross={false}
                  min={0}
                  dotStyle={{ display: "none" }}
                  marks={state.marks}
                  onChange={onChange}
                  trackStyle={state.trackStyles}
                  handleStyle={state.handleStyles}
                  railStyle={getRailStyles()}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};

// EditorTimeline.propTypes = {
//   currentSlide: PropTypes.object.isRequired,
//   currentSlideIndex: PropTypes.number.isRequired,
//   onDurationsChange: PropTypes.func,
//   isPlaying: PropTypes.bool.isRequired,
//   onAudioLoad: PropTypes.func,
//   onPlayComplete: PropTypes.func,
//   onSeekEnd: PropTypes.func,
// };

// EditorTimeline.defaultProps = {
//   onDurationsChange: () => {},
//   onAudioLoad: () => {},
//   onPlayComplete: () => {},
//   onSeekEnd: () => {},
// };

export default EditorTimeline;
