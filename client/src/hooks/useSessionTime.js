import { useState, useEffect } from 'react';

/**
 * Custom Hook: useSessionTime
 * Manages a live session timer with real-time date and time updates.
 * Demonstrates useEffect() lifecycle subscription and interval cleanup.
 */
export function useSessionTime(updateInterval = 1000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setNow(new Date());
    }, updateInterval);

    // Cleanup interval when component unmounts
    return () => {
      clearInterval(timerId);
    };
  }, [updateInterval]);

  const currentDate = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const currentTime = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return {
    now,
    currentDate,
    currentTime,
  };
}

export default useSessionTime;
