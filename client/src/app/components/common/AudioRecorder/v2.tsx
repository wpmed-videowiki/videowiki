import React, { useEffect, useState } from "react";
// import NotificationService from '../../utils/NotificationService';
import { Button, Icon } from "semantic-ui-react";
import moment from "moment";
import RecordRTC from "recordrtc";
import { formatTime } from "../../../utils/helpers";

// shim for AudioContext when it's not avb.
const anyWindow = window as any;
window.URL =
  window.URL || window.webkitURL || anyWindow.mozURL || anyWindow.msURL;
const AudioContext = window.AudioContext || anyWindow.webkitAudioContext;
const anyNavigator = navigator as any;

let audioContext: any = null;
let gumStream: any = null;
let rec: any = null;

function getBrowserUserMedia() {
  let userMediaFunc;
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    userMediaFunc = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices
    );
  } else {
    userMediaFunc = (
      anyNavigator.getUserMedia ||
      anyNavigator.webkitGetUserMedia ||
      anyNavigator.mozGetUserMedia ||
      anyNavigator.msGetUserMedia
    ).bind(navigator);
  }
  return userMediaFunc;
}

function getRemainingMS(startTime, maxDuration) {
  let remainingMS: any = null;
  const endTime = moment(startTime).add(maxDuration, "seconds");
  remainingMS = endTime.diff(moment());
  return remainingMS;
}

let getUserMedia;

try {
  getUserMedia = getBrowserUserMedia();
} catch (e) {
  alert("Error initilizing mic recorder");
}

interface IAudioRecorderV2Props {
  record?: boolean;
  onStop?: (blob?: any) => void;
  maxDuration?: number;
  loading: boolean;
  disabled: boolean;
  showLabel: boolean;
  onStart: () => void;
}

const AudioRecorderV2 = (data: IAudioRecorderV2Props) => {
  const props = {
    record: false,
    onStop: () => {},
    maxDuration: 0,
    ...data,
  };
  const [state, setState] = useState<any>({
    stream: null,
    recording: false,
    blob: null,
    waveData: { data: [], lineTo: 0 },
    startTime: null,
    remainingMS: null,
  });

  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, []);

  const toggleRecord = () => {
    if (state.recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    console.log("starting record");

    const constraints = { audio: true, video: false };
    if (rec) {
      const startTime = Date.now();

      setState((state) => ({
        ...state,
        recording: true,
        startTime,
        remainingMS: getRemainingMS(startTime, props.maxDuration),
      }));
      rec.startRecording();
      props.onStart();
      return;
    }

    if (getUserMedia) {
      getUserMedia(constraints)
        .then((stream) => {
          console.log(
            "getUserMedia() success, stream created, initializing Recorder.js ..."
          );
          gumStream = stream;

          rec = RecordRTC(stream, {
            type: "audio",
            mimeType: "audio/wav",
            recorderType: RecordRTC.StereoAudioRecorder,
            timeSlice: 100,
            ondataavailable: (blob) => {
              if (state.recording) {
                let remainingMS: any = null;
                if (state.recording && props.maxDuration && state.startTime) {
                  remainingMS = getRemainingMS(
                    state.startTime,
                    props.maxDuration
                  );
                  if (remainingMS <= 200) {
                    stopRecording();
                  }
                }
                // this.setState({ remainingMS });
                // Update remaining time if only 1 second passed or remaining ms is  <= 200
                if (
                  !state.remainingMS ||
                  state.remainingMS - remainingMS > 1000 ||
                  remainingMS <= 200
                ) {
                  setState((state) => ({ ...state, remainingMS }));
                }
              }
            },
          });

          // start the recording process
          // this.rec.init(stream);
          const startTime = Date.now();

          setState((state) => ({
            ...state,
            recording: true,
            startTime: startTime,
            remainingMS: getRemainingMS(startTime, props.maxDuration),
          }));
          rec.startRecording();
          // this.rec.start();
          props.onStart();
        })
        .catch((err) => {
          console.log(err);
          alert(
            "Something went wrong, Please make sure you're using the latest version of your browser"
          );
          props.onStop();
        });
    } else {
      // NotificationService.info('Your browser doesn\'t support audio recording')
    }
  };

  const stopMediaStream = () => {
    if (rec) {
      rec.destroy();
      gumStream.getAudioTracks().forEach((track) => track.stop());
      gumStream = null;
      rec = null;
    }
  };

  const stopRecording = (cancel?: boolean) => {
    // tell the recorder to stop the recording
    setState((state) => ({
      ...state,
      waveData: null,
      recording: false,
      startTime: null,
      remainingMS: null,
    }));
    if (rec) {
      rec.stopRecording(() => {
        let blob = rec.getBlob();
        console.log("Cancel is", cancel);
        props.onStop(cancel ? null : blob);
        stopMediaStream();
      });
    }
  };

  const cancelRecording = () => {
    stopRecording(true);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        marginRight: 10,
      }}
    >
      <Button
        icon
        circular
        // ="left"
        loading={props.loading}
        disabled={props.disabled}
        onClick={toggleRecord.bind(this)}
        color={state.recording ? "red" : "green"}
      >
        {!state.recording ? <Icon name="microphone" /> : <Icon name="stop" />}
        {props.showLabel && !state.recording ? "Record" : ""}
        {/* {!this.state.recording ? ' Record' : ' Stop'} */}
      </Button>
      {state.recording && (
        <Button primary basic onClick={cancelRecording.bind(this)}>
          Cancel
        </Button>
      )}
      {props.maxDuration && state.startTime && state.remainingMS !== null ? (
        <div style={{ margin: 10 }}>{formatTime(state.remainingMS)}</div>
      ) : null}
    </div>
  );
};

export default AudioRecorderV2;
