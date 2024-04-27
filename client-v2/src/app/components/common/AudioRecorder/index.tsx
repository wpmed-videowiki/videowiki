import React, { useEffect, useState } from "react";
// TODO: Find replacement
// import WaveStream from "react-wave-stream";
import Recorder from "recorder-js";
import { NotificationManager } from "react-notifications";
// shim for AudioContext when it's not avb.
const anyWindow = window as any;
window.URL =
  window.URL || window.webkitURL || anyWindow.mozURL || anyWindow.msURL;
const AudioContext = window.AudioContext || anyWindow.webkitAudioContext;

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
    const anyNavigator = navigator as any;
    userMediaFunc = (
      anyNavigator.getUserMedia ||
      anyNavigator.webkitGetUserMedia ||
      anyNavigator.mozGetUserMedia ||
      anyNavigator.msGetUserMedia
    ).bind(navigator);
  }
  return userMediaFunc;
}

const getUserMedia = getBrowserUserMedia();

interface IAudioRecorderProps {
  record: boolean;
  onStop: (data?: any) => void;
}

const AudioRecorder = (props: IAudioRecorderProps) => {
  const [state, setState] = useState<any>({
    stream: null,
    recording: false,
    blob: null,
    waveData: { data: [], lineTo: 0 },
  });

  const startRecording = () => {
    console.log("starting record");

    const constraints = { audio: true, video: false };

    if (getUserMedia) {
      getUserMedia(constraints)
        .then((stream) => {
          console.log(
            "getUserMedia() success, stream created, initializing Recorder.js ..."
          );
          audioContext = new AudioContext();
          console.log("audio context", audioContext);
          /*  assign to gumStream for later use  */
          gumStream = stream;
          /* use the stream */
          rec = new Recorder(audioContext, {
            numChannels: 1,
            onAnalysed: (waveData) => {
              if (props.record) {
                setState((state) => ({ ...state, waveData }));
              }
            },
          });

          // start the recording process
          rec.init(stream);
          setState((state) => ({ ...state, recording: true }));
          rec.start();
        })
        .catch((err) => {
          alert(
            "Something went wrong, Please make sure you're using the latest version of your browser"
          );
          props.onStop();
        });
    } else {
      NotificationManager.info("Your browser doesn't support audio recording");
    }
  };

  const stopRecording = () => {
    // tell the recorder to stop the recording
    rec.stop().then(({ blob }) => {
      props.onStop(blob);
      setState((state) => ({ ...state, waveData: null, recording: false }));
    });

    // stop microphone access
    gumStream.getAudioTracks().forEach((track) => track.stop());
  };

  useEffect(() => {
    if (props.record !== state.recording) {
      if (props.record) {
        startRecording();
      } else {
        stopRecording();
      }
    }
  }, [props.record, state.recording]);
  return (
    <div>
      {/* {state.waveData && (
        <WaveStream
          {...state.waveData}
          backgroundColor="#2185d0"
          strokeColor="#000000"
        />
      )} */}
      TOOD: Find replacement for wave stream
    </div>
  );
};
