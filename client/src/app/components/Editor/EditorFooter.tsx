import { Button, Icon } from "semantic-ui-react";
import moment from "moment";

import VoiceSpeedController from "./VoiceSpeedController";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface IEditorFooterProps {
  currentSlideIndex: number;
  totalSlideCount: number;
  onSlideBack: () => void;
  onSlideForward: () => void;
  togglePlay: () => void;
  isPlaying: boolean;
  toggleSidebar: () => void;
  title: string;
  hideSidebarToggle: boolean;
  onSpeedChange: (value: number) => void;
  updatedAt: string;
  uploadState: string;
  onCCToggle?: () => void;
}

const EditorFooter = (props: IEditorFooterProps) => {
  const { t } = useTranslation();

  const _renderPlayIcon = () => {
    const { isPlaying } = props;

    const icon = isPlaying ? "pause" : "play";

    return <Icon name={icon} />;
  };

  const _renderToggleButton = () => {
    return props.hideSidebarToggle ? null : (
      <Button
        basic
        icon
        className="c-editor__footer-sidebar c-editor__toolbar-publish"
        onClick={() => props.toggleSidebar()}
      >
        <Icon name="content" />
      </Button>
    );
  };

  const {
    onSlideBack,
    onSlideForward,
    togglePlay,
    currentSlideIndex,
    totalSlideCount,
    updatedAt,
    uploadState,
  } = props;
  const date = moment(updatedAt);

  return (
    <div className="c-editor__footer">
      {_renderToggleButton()}

      <Button
        basic
        icon
        className="c-editor__toolbar-publish"
        onClick={() => props.onCCToggle?.()}
      >
        <Icon name="cc" />
      </Button>
      <VoiceSpeedController
        onSpeedChange={(value) => props.onSpeedChange(value)}
      />
      <span className="c-editor__footer-controls">
        <Button
          basic
          icon
          className="c-editor__toolbar-publish"
          onClick={() =>
            uploadState !== "loading"
              ? onSlideBack()
              : toast.info("An upload is already in progress, please hold")
          }
          disabled={currentSlideIndex === 0}
        >
          <Icon name="step backward" />
        </Button>
        <Button
          basic
          icon
          className="c-editor__toolbar-publish"
          onClick={() => togglePlay()}
        >
          {_renderPlayIcon()}
        </Button>
        <Button
          basic
          icon
          className="c-editor__toolbar-publish"
          onClick={() =>
            uploadState !== "loading"
              ? onSlideForward()
              : toast.info("An upload is already in progress, please hold")
          }
          disabled={currentSlideIndex + 1 === totalSlideCount}
        >
          <Icon name="step forward" />
        </Button>
      </span>
      <span className="c-editor__last-updated">
        {`${t("Editor.last_updated")}: ${date.format(
          "DD MMMM YYYY"
        )} ${date.format("hh:mm")}`}
      </span>
    </div>
  );
};

export default EditorFooter;
