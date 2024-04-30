import { useState } from "react";
import { Button } from "semantic-ui-react";

interface IVoiceSpeedControllerProps {
  onSpeedChange: (value: number) => void;
}
const VoiceSpeedController = (props: IVoiceSpeedControllerProps) => {
  const [showOptions, setShowOptions] = useState(false);

  const _showOptions = () => {
    setShowOptions(true);
  };

  const _setSpeed = (value) => {
    props.onSpeedChange(value);
    setShowOptions(false);
  };

  const _renderVoiceSpeedButton = () => {
    return !showOptions ? (
      <Button
        basic
        className="c-editor__toolbar-publish"
        onClick={_showOptions}
      >
        Voice Speed
      </Button>
    ) : null;
  };

  const _renderOptions = () => {
    return showOptions ? (
      <div>
        <Button
          basic
          className="c-editor__toolbar-publish c-editor__toolbar-speed--control"
          onClick={() => _setSpeed(0.5)}
        >
          0.5x
        </Button>
        <Button
          basic
          className="c-editor__toolbar-publish c-editor__toolbar-speed--control"
          onClick={() => _setSpeed(1)}
        >
          1x
        </Button>
        <Button
          basic
          className="c-editor__toolbar-publish c-editor__toolbar-speed--control"
          onClick={() => _setSpeed(1.25)}
        >
          1.25x
        </Button>
        <Button
          basic
          className="c-editor__toolbar-publish c-editor__toolbar-speed--control"
          onClick={() => _setSpeed(1.5)}
        >
          1.5x
        </Button>
        <Button
          basic
          className="c-editor__toolbar-publish c-editor__toolbar-speed--control"
          onClick={() => _setSpeed(2)}
        >
          2x
        </Button>
      </div>
    ) : null;
  };

  return (
    <div>
      {_renderVoiceSpeedButton()}
      {_renderOptions()}
    </div>
  );
};

export default VoiceSpeedController;
