import React, { useEffect, useState, useRef } from 'react';

const ProgressBar = ({ duration = 5000, isActive, onComplete, reset, isPaused }) => {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);

  useEffect(() => {
    if (reset) {
      setProgress(0);
      pausedTimeRef.current = 0;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [reset]);

  useEffect(() => {
    if (!isActive || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Resume or start progress
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current - pausedTimeRef.current;
      const newProgress = (elapsed / duration) * 100;
      
      if (newProgress >= 100) {
        setProgress(100);
        clearInterval(intervalRef.current);
        onComplete();
        return;
      }
      
      setProgress(newProgress);
    }, 16); // ~60fps

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, duration, onComplete]);

  useEffect(() => {
    if (isPaused && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isPaused]);

  return (
    <div className="progress-bar">
      <div 
        className="progress-fill"
        style={{ 
          width: `${Math.min(progress, 100)}%`,
          transition: isPaused ? 'none' : 'width 16ms linear'
        }}
      />
    </div>
  );
};

export default ProgressBar; 