import { useRef, useState } from "react";
import { Grid, Icon, Button } from "semantic-ui-react";
import AudioRecorder from "../common/AudioRecorder";
import AuthModal from "../common/AuthModal";
import { useTranslation } from "react-i18next";

interface IEditorAudioRecorderProps {
  recording?: boolean;
  isLoggedIn?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onStop?: (data?: any) => void;
  toggleRecording?: () => void;
  onDeleteAudio?: (position: any) => void;
  currentSlide?: any;
}

const EditorAudioRecorder = (data: IEditorAudioRecorderProps) => {
  const uploadRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();      
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const props = {
    recording: false,
    isLoggedIn: false,
    loading: false,
    disabled: false,
    onStop: () => {},
    toggleRecording: () => {},
    onDeleteAudio: () => {},
    currentSlide: {},
    ...data,
  };

  const toggleRecording = () => {
    if (props.isLoggedIn) {
      props.toggleRecording();
    } else {
      setIsLoginModalVisible(true);
    }
  };

  const onStop = (recordedBlob) => {
    props.onStop(recordedBlob);
  };

  const _renderLoginModal = () => {
    return (
      <AuthModal
        open={isLoginModalVisible}
        heading={"Only logged in users can record audio"}
        onClose={() => setIsLoginModalVisible(false)}
        target=""
      />
    );
  };

  const onDeleteAudio = (slidePosition) => {
    if (props.isLoggedIn) {
      props.onDeleteAudio(slidePosition);
    } else {
      setIsLoginModalVisible(true);
    }
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
        <Grid.Row style={{ display: "flex", alignItems: "center" }}>
          <Grid.Column computer={4} mobile={4}>
            {t('Editor.audio')}
            {/* <Popup trigger={<Icon name="info circle" className="pl1" />} content={
                <div>
                  <div>
                    Control the Timing of the slide's media by adjusting the drag bar on the right
                    to match the required position in the bottom audio player
                  </div>
                </div>
              }
              /> */}
          </Grid.Column>

          <Grid.Column computer={12} mobile={16}>
            <Grid.Row>
              <Grid style={{ display: "flex", alignItems: "center" }}>
                <Grid.Column width={16}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      minHeight: 120,
                    }}
                  >
                    <p style={{ padding: 0, margin: 0 }}>
                      <Button
                        icon
                        primary
                        // size="large"
                        iconPosition="left"
                        loading={props.loading}
                        disabled={props.disabled}
                        onClick={toggleRecording}
                      >
                        {!props.recording ? (
                          <Icon name="microphone" />
                        ) : (
                          <Icon name="stop" />
                        )}
                        {!props.recording ? " Record" : " Stop"}
                      </Button>
                    </p>
                    {!props.recording && !props.loading && (
                      <span>
                        <Button
                          // icon
                          // primary
                          // size="large"
                          basic
                          iconPosition="left"
                          loading={props.loading}
                          disabled={props.disabled}
                          onClick={() => uploadRef.current?.click()}
                        >
                          {!props.recording ? (
                            <Icon name="microphone" />
                          ) : (
                            <Icon name="stop" />
                          )}
                          {t("Editor.upload_file")}
                        </Button>
                        <input
                          onChange={(e) => {
                            onStop(e.target.files?.[0]);
                          }}
                          type="file"
                          accept=".webm, .mp3, .wav, .m4a"
                          style={{ display: "none" }}
                          ref={uploadRef}
                        />
                      </span>
                    )}
                    <div
                      className="c-export-human-voice__recorder-mic-container"
                      style={{
                        display: props.recording ? "block" : "none",
                      }}
                    >
                      <AudioRecorder
                        record={props.recording}
                        // className="c-export-human-voice__recorder-mic"
                        onStop={onStop}
                        // backgroundColor="#2185d0"
                        // strokeColor="#000000"
                      />
                    </div>
                    {props.currentSlide &&
                      props.currentSlide.audio &&
                      !props.recording &&
                      !props.loading && (
                        <div
                          style={{
                            marginLeft: 20,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <audio src={props.currentSlide.audio} controls />
                          <Icon
                            name="close"
                            className="c-export-human-voice__clear-record"
                            onClick={() =>
                              onDeleteAudio(props.currentSlide.position)
                            }
                          />
                        </div>
                      )}
                  </div>
                </Grid.Column>
              </Grid>
              {_renderLoginModal()}
            </Grid.Row>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};

export default EditorAudioRecorder;
