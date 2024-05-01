interface IProgressArrowsProps {
  stage1: number;
  stage2: number;
  stage3: number;
  stage4: number;
}

const ProgressArrows = (props: IProgressArrowsProps) => {
  const calculateWhite = (percentage) => {
    if (parseInt(percentage) === 100) return -5;
    return 100 - parseInt(percentage);
  };

  const calculateGreen = (percentage) => {
    if (parseInt(percentage) === 100) return 0;
    return 100 - parseInt(percentage) + 5;
  };

  return (
    <div className="c-app-arrows-container">
      <div className="c-app-arrow">
        <div className="c-app-arrow-text">
          <h3>Stage 1</h3>
          <p>
            Converting individual slides into
            <br /> videos
          </p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="320px" height="350px">
          <defs>
            <linearGradient
              id="PadGradient_1"
              x1={`${calculateWhite(props.stage1)}%`}
              x2={`${calculateGreen(props.stage1)}%`}
              gradientTransform="rotate(90)"
            >
              <stop offset="0%" stopColor="white" />
              <stop offset="100%" stopColor="green" />
            </linearGradient>
          </defs>
          <g>
            <title>Stage 1</title>
            <path
              stroke="green"
              transform="rotate(90 156.99749755859378,94.00320434570314) "
              d="m64.497498,93.629991l92.500003,-155.12679l92.500003,155.12679l-46.250005,0l0,155.873231l-92.499997,0l0,-155.873231l-46.250005,0z"
              strokeWidth="1"
              fill="url(#PadGradient_1)"
            />
          </g>
        </svg>
      </div>

      <div className="c-app-arrow">
        <div className="c-app-arrow-text">
          <h3>Stage 2</h3>
          <p>Adding Text References to videos</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="320px" height="350px">
          <defs>
            <linearGradient
              id="PadGradient_2"
              x1={`${calculateWhite(props.stage2)}%`}
              x2={`${calculateGreen(props.stage2)}%`}
              gradientTransform="rotate(90)"
            >
              <stop offset="0%" stopColor="white" />
              <stop offset="100%" stopColor="green" />
            </linearGradient>
          </defs>
          <g>
            <title>Stage 2</title>
            <path
              stroke="green"
              transform="rotate(90 156.99749755859378,94.00320434570314) "
              d="m64.497498,93.629991l92.500003,-155.12679l92.500003,155.12679l-46.250005,0l0,155.873231l-92.499997,0l0,-155.873231l-46.250005,0z"
              strokeWidth="1"
              fill="url(#PadGradient_2)"
            />
          </g>
        </svg>
      </div>
      <div className="c-app-arrow">
        <div className="c-app-arrow-text">
          <h3>Stage 3</h3>
          <p>
            Combining all video files into one
            <br /> file
          </p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="320px" height="350px">
          <defs>
            <linearGradient
              id="PadGradient_3"
              x1={`${calculateWhite(props.stage3)}%`}
              x2={`${calculateGreen(props.stage3)}%`}
              gradientTransform="rotate(90)"
            >
              <stop offset="0%" stopColor="white" />
              <stop offset="100%" stopColor="green" />
            </linearGradient>
          </defs>
          <g>
            <title>Stage 3</title>
            <path
              stroke="green"
              transform="rotate(90 156.99749755859378,94.00320434570314) "
              d="m64.497498,93.629991l92.500003,-155.12679l92.500003,155.12679l-46.250005,0l0,155.873231l-92.499997,0l0,-155.873231l-46.250005,0z"
              strokeWidth="1"
              fill="url(#PadGradient_3)"
            />
          </g>
        </svg>
      </div>
      <div className="c-app-arrow">
        <div className="c-app-arrow-text">
          <h3>Stage 4</h3>
          <p>Wrapping up and uploading final video</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="320px" height="350px">
          <defs>
            <linearGradient
              id="PadGradient_4"
              x1={`${calculateWhite(props.stage4)}%`}
              x2={`${calculateGreen(props.stage4)}%`}
              gradientTransform="rotate(90)"
            >
              <stop offset="0%" stopColor="white" />
              <stop offset="100%" stopColor="green" />
            </linearGradient>
          </defs>
          <g>
            <title>Stage 4</title>
            <path
              stroke="green"
              transform="rotate(90 156.99749755859378,94.00320434570314) "
              d="m64.497498,93.629991l92.500003,-155.12679l92.500003,155.12679l-46.250005,0l0,155.873231l-92.499997,0l0,-155.873231l-46.250005,0z"
              strokeWidth="1"
              fill="url(#PadGradient_4)"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default ProgressArrows;
