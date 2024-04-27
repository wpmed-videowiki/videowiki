import { useEffect, useState } from "react";
import { Timer, Progress } from "react-soundplayer/components";
import { withCustomAudio } from "react-soundplayer/addons";
import "react-soundplayer/styles/buttons.css";
import "react-soundplayer/styles/icons.css";
import "react-soundplayer/styles/progress.css";
import "react-soundplayer/styles/volume.css";

// export default withCustomAudio(ProgressSoundPlayer);

interface IProgressSoundPlayerProps {
  resolveUrl: string;
  clientId: string;
  streamUrl: string;
  soundCloudAudio: any;
  isPlaying: boolean;
  onAudioLoad: () => void;
  currentTime: number;
  onSeekEnd: (currentTime: number) => void;
}

const ProgressSoundPlayer = (props: IProgressSoundPlayerProps) => {
  const [mounted, setMounted] = useState(false);

  // todo: check this
  useEffect(() => {
    if (props.soundCloudAudio) {
      if (props.isPlaying) {
        props.soundCloudAudio.play();
      } else {
        props.soundCloudAudio.pause();
      }
    }
  }, [props.isPlaying]);
  useEffect(() => {
    setMounted(true);
    if (props.soundCloudAudio) {
      props.soundCloudAudio.on("seeked", () => {
        if (mounted) {
          props.onSeekEnd(props.currentTime);
        }
      });
      props.soundCloudAudio.on("loadedmetadata", () => {
        props.onAudioLoad();
        if (props.isPlaying) {
          props.soundCloudAudio.play();
        }
      });
    }

    return () => {
      if (props.soundCloudAudio && props.soundCloudAudio.stop) {
        props.soundCloudAudio.stop();
      }
      if (props.soundCloudAudio && props.soundCloudAudio.unbindAll) {
        props.soundCloudAudio.unbindAll();
      }
    };
  }, []);

  return (
    <div className="bg-darken-1 red mb3 rounded">
      <div>
        <div className="ml2">
          <Timer
            className="h6 mr1 regular"
            {...props}
            key={`progress-player-time-${props.streamUrl}`}
          />
        </div>
        <div className="flex flex-center">
          {/* <PlayButton
              className="flex-none h5 button button-transparent button-grow rounded"
              {...this.props}
              key={`progress-player-play-${this.props.streamUrl}`}
            />
            <VolumeControl
              className="flex flex-center mr2"
              buttonClassName="flex-none h5 button button-transparent button-grow rounded"
              {...this.props}
            /> */}
          <Progress
            className="rounded"
            style={{ marginTop: "1.5rem" }}
            innerClassName="rounded-left"
            {...props}
            key={`progress-playe-progressr-${props.streamUrl}`}
          />
        </div>
      </div>
    </div>
  );
};

export default withCustomAudio(ProgressSoundPlayer);
