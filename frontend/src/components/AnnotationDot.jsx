import React, { useState } from 'react';

const AnnotationDot = ({ x, y, onClick, index }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsPressed(true);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsPressed(false);
    onClick();
  };


  const handleClick = (e) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <div
      className={`annotation-dot ${isPressed ? 'scale-125' : ''}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${index * 0.2}s`,
      }}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="button"
      tabIndex={0}
      aria-label={`Product annotation ${index + 1}`}
    >
      <div className="absolute inset-0 bg-white rounded-full opacity-80" />
      <div className="absolute inset-1 bg-black rounded-full flex items-center justify-center">
        <div className="w-1 h-1 bg-white rounded-full" />
      </div>
    </div>
  );
};

export default AnnotationDot; 