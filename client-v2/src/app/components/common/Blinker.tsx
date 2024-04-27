import { useEffect, useState } from "react";

interface IBlinkerProps {
  blink: boolean;
  onStop: () => void;
  onStart: () => void;
  primary: string;
  secondary: string;
  interval: number;
  repeat: number;
  children: React.ReactNode;
}

const Blinker = (props: IBlinkerProps) => {
  const [count, setCount] = useState(0);
  const [interval, setIntervalId] = useState<any>(null);
  const [color, setColor] = useState(props.primary);

  const blink = () => {
    if (props.repeat === -1 || count < props.repeat) {
      setColor(props.secondary);
      setTimeout(() => {
        setColor(props.primary);
        setCount((count) => count + 1);
      }, props.interval / 2);
    } else if (props.repeat !== -1 && count >= props.repeat) {
      stopBlinking();
    }
  };

  const startBlinking = () => {
    if (!interval) {
      const interval = setInterval(() => {
        blink();
      }, props.interval);

      props.onStart();
      setIntervalId(interval);
    }
  };

  const stopBlinking = () => {
    if (interval) {
      clearInterval(interval);
      props.onStop();
      setCount(0);
      setIntervalId(null);
    }
  };

  useEffect(() => {
    if (props.blink && !interval) {
      startBlinking();
    } else if (!props.blink && interval) {
      stopBlinking();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [props.blink, interval]);

  return <span style={{ backgroundColor: color }}>{props.children}</span>;
};

export default Blinker;
