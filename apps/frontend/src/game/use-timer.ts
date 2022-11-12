

import { useState, useEffect } from 'react';

const timerWorker = new Worker(
  new URL('./timer.worker.ts', import.meta.url),
);

export const useTimer = (enabled: boolean) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    timerWorker.postMessage('start');

    timerWorker.onmessage = ({data}) => {
        setElapsedSeconds(data);
    };

    return () => timerWorker.postMessage('stop');
  }, [enabled, setElapsedSeconds]);

  return elapsedSeconds;
};