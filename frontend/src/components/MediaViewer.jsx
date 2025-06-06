import React, { useState, useEffect, useCallback, useRef } from 'react';
import ProgressBar from './ProgressBar';
import AnnotationDot from './AnnotationDot';
import ProductCard from './ProductCard';
import { lookbookAPI } from '../services/api';

const MediaViewer = ({ media, currentIndex, onNext, onPrevious, isPaused, onMediaLoad }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [progressReset, setProgressReset] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoRef = useRef(null);

  const currentMedia = media[currentIndex];
  const isVideo = currentMedia?.url?.includes('.mp4') || 
                   currentMedia?.url?.includes('.webm') || 
                   currentMedia?.url?.includes('.mov');

  useEffect(() => {
    setProgressReset(true);
    setIsLoading(true);
    setHasError(false);
    const timer = setTimeout(() => setProgressReset(false), 50);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Auto-play was prevented:", error);
          });
        }
      }
    }
  }, [isPaused, currentIndex]);

  const handleAnnotationClick = async (annotation) => {
    try {
      console.log('=== ANNOTATION CLICK DEBUG ===');
      console.log('Full annotation object:', JSON.stringify(annotation, null, 2));
      console.log('Product ID:', annotation.productId);
      console.log('Product ID type:', typeof annotation.productId);
      console.log('Product ID length:', annotation.productId?.length);
      console.log('Product ID constructor:', annotation.productId?.constructor?.name);
      console.log('Is string?:', typeof annotation.productId === 'string');
      console.log('Is object?:', typeof annotation.productId === 'object');
      
      if (!annotation.productId) {
        console.error('No product ID found in annotation');
        alert('No product ID found for this annotation');
        return;
      }
      
      // Convert to string if it's an object
      let productIdString;
      if (typeof annotation.productId === 'object' && annotation.productId._id) {
        productIdString = annotation.productId._id;
        console.log('Converted object to string:', productIdString);
      } else if (typeof annotation.productId === 'object' && annotation.productId.toString) {
        productIdString = annotation.productId.toString();
        console.log('Used toString():', productIdString);
      } else {
        productIdString = annotation.productId;
      }
      
      console.log('Final product ID for API call:', productIdString);
      console.log('Making API call to:', `/api/products/${productIdString}`);
      
      const product = await lookbookAPI.getProductById(productIdString);
      console.log('Product fetched successfully:', product);
      setSelectedProduct(product);
    } catch (error) {
      console.error('=== API ERROR DETAILS ===');
      console.error('Error fetching product:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      // Show user-friendly error
      alert(`Error loading product: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleProgressComplete = useCallback(() => {
    if (!isVideo && !isPaused) {
      onNext();
    }
  }, [isVideo, isPaused, onNext]);

  const handleVideoEnded = () => {
    if (!isPaused) {
      onNext();
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsVideoMuted(!isVideoMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
    }
  };

  const handleMediaClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const centerX = rect.width / 2;
    
    if (x < centerX) {
      onPrevious();
    } else {
      onNext();
    }
  };

  const handleMediaLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onMediaLoad?.();
  };

  const handleMediaError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!currentMedia) return null;

  return (
    <div className="media-container">
      {/* Progress Bar for Images */}
      {!isVideo && !hasError && (
        <ProgressBar 
          duration={5000}
          isActive={!isPaused && !isLoading}
          onComplete={handleProgressComplete}
          reset={progressReset}
          isPaused={isPaused}
        />
      )}

      {/* Video Progress Bar */}
      {isVideo && !hasError && (
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${videoProgress}%` }}
          />
        </div>
      )}
      
      <div className="relative w-full h-full" onClick={handleMediaClick}>
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
            <div className="text-white text-lg">Loading...</div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center z-10">
            <div className="text-white text-lg mb-4">Failed to load media</div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-white text-black px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        )}

        {/* Media Content */}
        {isVideo ? (
          <video
            ref={videoRef}
            src={currentMedia.url}
            className="look-video"
            autoPlay
            muted={isVideoMuted}
            onEnded={handleVideoEnded}
            onTimeUpdate={handleVideoTimeUpdate}
            onLoadedData={handleMediaLoad}
            onError={handleMediaError}
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={currentMedia.url}
            alt="Fashion look"
            className="look-image"
            onLoad={handleMediaLoad}
            onError={handleMediaError}
          />
        )}

        {/* Annotations for images */}
        {!isVideo && !hasError && currentMedia.annotations?.map((annotation, index) => (
          <AnnotationDot
            key={index}
            index={index}
            x={annotation.x}
            y={annotation.y}
            onClick={() => handleAnnotationClick(annotation)}
          />
        ))}

        {/* Video controls */}
        {isVideo && !hasError && (
          <div className="absolute bottom-24 right-6 flex space-x-2 z-20">
            <button
              onClick={toggleMute}
              className="action-icon text-base"
            >
              {isVideoMuted ? '🔇' : '🔊'}
            </button>
          </div>
        )}
      </div>

      {/* Product Card Modal */}
      {selectedProduct && (
        <ProductCard
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default MediaViewer; 