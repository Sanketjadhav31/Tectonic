import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { lookbookAPI, productAPI } from '../services/api';

const Lookbook = () => {
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState({});
  const [currentLookIndex, setCurrentLookIndex] = useState(0);
  const [videoPaused, setVideoPaused] = useState({});
  const [videoStates, setVideoStates] = useState({}); // Track video ready states
  
  const navigate = useNavigate();
  const videoRefs = useRef({});
  const lookRefs = useRef({});
  const observerTimeouts = useRef({}); // For debouncing

  useEffect(() => {
    fetchLooks();
  }, []);

  // Debounced video play function
  const playVideo = useCallback(async (lookIndex) => {
    const video = videoRefs.current[lookIndex];
    if (!video) return;

    try {
      // Only play if video is ready and not already playing
      if (video.readyState >= 2 && video.paused && !videoPaused[lookIndex]) {
        await video.play();
        setVideoStates(prev => ({ ...prev, [lookIndex]: 'playing' }));
      }
    } catch (error) {
      // Silently handle AbortError and other play interruptions
      if (error.name !== 'AbortError') {
        console.warn('Video play error:', error);
      }
    }
  }, [videoPaused]);

  // Debounced video pause function
  const pauseVideo = useCallback((lookIndex) => {
    const video = videoRefs.current[lookIndex];
    if (!video) return;

    try {
      if (!video.paused) {
        video.pause();
        setVideoStates(prev => ({ ...prev, [lookIndex]: 'paused' }));
      }
    } catch (error) {
      console.warn('Video pause error:', error);
    }
  }, []);

  useEffect(() => {
    // Set up intersection observer with debouncing
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const lookIndex = parseInt(entry.target.dataset.lookIndex);
          const look = looks[lookIndex];
          
          // Clear any existing timeout
          if (observerTimeouts.current[lookIndex]) {
            clearTimeout(observerTimeouts.current[lookIndex]);
          }

          // Debounce the intersection changes
          observerTimeouts.current[lookIndex] = setTimeout(() => {
            if (entry.isIntersecting) {
              setCurrentLookIndex(lookIndex);
              // Only play if it's a video
              if (look?.contentType === 'video') {
                playVideo(lookIndex);
              }
            } else {
              // Only pause if it's a video
              if (look?.contentType === 'video') {
                pauseVideo(lookIndex);
              }
            }
          }, 100); // 100ms debounce
        });
      },
      { 
        threshold: 0.7,
        rootMargin: '0px 0px -20px 0px' // Slight margin to prevent edge cases
      }
    );

    // Observe all look containers
    Object.values(lookRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
      // Clear all timeouts
      Object.values(observerTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [looks, playVideo, pauseVideo]);

  const fetchLooks = async () => {
    try {
      setLoading(true);
      const fetchedLooks = await lookbookAPI.getAllLooks();
      console.log('Fetched looks:', fetchedLooks);
      setLooks(fetchedLooks || []);
      setError(null);
    } catch (err) {
      setError('Failed to load looks. Please try again.');
      console.error('Error fetching looks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShopNow = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Fast navigation for media clicks - navigate to first product or show quick selection
  const handleMediaClick = (look, lookIndex, event) => {
    // Prevent default and stop propagation for faster response
    event.preventDefault();
    event.stopPropagation();

    // For videos, check if click is on control areas
    if (look.contentType === 'video') {
      const rect = event.target.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      
      // Check if click is on control areas (bottom 15% for controls, right 15% for mute)
      const isBottomControl = clickY > rect.height * 0.85;
      const isRightControl = clickX > rect.width * 0.85;
      const isTopLeftControl = clickY < rect.height * 0.15 && clickX < rect.width * 0.3; // Product count area
      
      if (isBottomControl || isRightControl || isTopLeftControl) {
        // Don't navigate, let video controls handle it
        if (!isTopLeftControl) {
          toggleVideoPause(lookIndex);
        }
        return;
      }
    }

    // Immediate navigation for faster response
    if (look.productIds && look.productIds.length > 0) {
      const productId = look.productIds[0]; // Always use first product for speed
      console.log('Fast navigation to product:', productId);
      
      // Navigate immediately without waiting
      navigate(`/product/${productId}`);
    }
  };

  // Fast mute toggle with visual feedback
  const toggleMute = (event) => {
    if (event) {
      event.stopPropagation(); // Prevent media click
    }
    
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Update all videos immediately
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.muted = newMutedState;
      }
    });
  };

  const toggleVideoPause = (lookIndex) => {
    const video = videoRefs.current[lookIndex];
    if (!video) return;

    if (video.paused || videoPaused[lookIndex]) {
      setVideoPaused(prev => ({ ...prev, [lookIndex]: false }));
      playVideo(lookIndex);
    } else {
      setVideoPaused(prev => ({ ...prev, [lookIndex]: true }));
      pauseVideo(lookIndex);
    }
  };

  const handleVideoProgress = (lookIndex, currentTime, duration) => {
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    setVideoProgress(prev => ({
      ...prev,
      [lookIndex]: progress
    }));
  };

  const handleVideoLoaded = (lookIndex) => {
    setVideoStates(prev => ({ ...prev, [lookIndex]: 'ready' }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mb-4"></div>
        <div className="text-white text-xl">Loading lookbook...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-4">
        <div className="text-xl mb-4 text-center">{error}</div>
        <button 
          onClick={fetchLooks}
          className="bg-teal-400 text-black px-6 py-3 rounded-lg hover:bg-teal-300 transition-colors font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!Array.isArray(looks) || looks.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white text-xl">No looks available</div>
      </div>
    );
  }

  return (
    <div className="video-feed">
      {looks.map((look, lookIndex) => (
        <div 
          key={look._id} 
          className="look-container"
          ref={el => lookRefs.current[lookIndex] = el}
          data-look-index={lookIndex}
        >
          {/* Look Header */}
          <div className="look-header">
            <h3 className="look-title">{look.title}</h3>
            {look.productIds && look.productIds.length > 0 && (
              <div className="text-xs text-white opacity-75 flex items-center">
                {look.productIds.length === 1 ? (
                  <span>👆 Tap to shop</span>
                ) : (
                  <span>👆 Tap to shop ({look.productIds.length} items)</span>
                )}
              </div>
            )}
          </div>

          {/* Media Container */}
          <div className="media-container">
            {look.contentType === 'video' ? (
              <video 
                ref={el => videoRefs.current[lookIndex] = el}
                src={look.mediaUrl} 
                className="media-element"
                loop
                muted={isMuted}
                playsInline
                preload="metadata"
                onClick={(e) => handleMediaClick(look, lookIndex, e)}
                onLoadedData={() => handleVideoLoaded(lookIndex)}
                onTimeUpdate={(e) => {
                  handleVideoProgress(lookIndex, e.target.currentTime, e.target.duration);
                }}
                onError={(e) => {
                  console.error('Video error:', e);
                  setVideoStates(prev => ({ ...prev, [lookIndex]: 'error' }));
                }}
                onWaiting={() => setVideoStates(prev => ({ ...prev, [lookIndex]: 'loading' }))}
                onCanPlay={() => setVideoStates(prev => ({ ...prev, [lookIndex]: 'ready' }))}
              />
            ) : (
              <img 
                src={look.mediaUrl} 
                alt={look.title}
                className="media-element"
                onClick={(e) => handleMediaClick(look, lookIndex, e)}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x600?text=Image+Not+Found';
                }}
              />
            )}

            {/* Video Controls (only for videos) */}
            {look.contentType === 'video' && (
              <>
                {/* Video progress bar */}
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${videoProgress[lookIndex] || 0}%` }}
                  />
                </div>

                {/* Play/Pause indicator */}
                {(videoPaused[lookIndex] || videoStates[lookIndex] === 'paused') && (
                  <div className="play-pause-indicator">
                    <div className="text-white text-4xl">▶️</div>
                  </div>
                )}

                {/* Loading indicator */}
                {videoStates[lookIndex] === 'loading' && (
                  <div className="play-pause-indicator">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </>
            )}

            {/* Global Mute button - appears on ALL content (videos and images) */}
            <button 
              onClick={(e) => toggleMute(e)} 
              className="mute-btn"
              style={{ zIndex: 50 }}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>

            {/* Product count indicator for multiple products */}
            {look.productIds && look.productIds.length > 1 && (
              <div className="absolute top-4 left-4 z-40 bg-black bg-opacity-60 backdrop-blur-lg text-white px-3 py-1 rounded-full text-sm">
                {look.productIds.length} items
              </div>
            )}

            {/* Scroll indicator */}
            {lookIndex < looks.length - 1 && (
              <div className="scroll-indicator">
                <div className="scroll-arrow">↑</div>
                <div>Swipe up</div>
              </div>
            )}
          </div>

          {/* Product Scroll Bar - SMALLER */}
          <div className="product-scroll-container">
            <div className="product-scroll">
              {look.productIds?.map((productId, index) => (
                <ProductCard
                  key={`${lookIndex}-${index}`}
                  productId={productId}
                  onShopNow={handleShopNow}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Product Card Component - Horizontal Layout like Screenshot
const ProductCard = ({ productId, onShopNow }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      console.log('ProductCard raw productId:', productId, 'Type:', typeof productId);
      
      if (!productId) {
        console.error('ProductCard: Product ID is null or undefined');
        return;
      }

      // Ensure productId is a string - handle ObjectId conversion
      let cleanProductId;
      if (typeof productId === 'object' && productId !== null) {
        if (productId.$oid) {
          cleanProductId = productId.$oid;
        } else if (productId.toString) {
          cleanProductId = productId.toString();
        } else {
          cleanProductId = String(productId);
        }
      } else {
        cleanProductId = String(productId);
      }
      
      console.log('ProductCard clean productId:', cleanProductId);
      
      // Validate MongoDB ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(cleanProductId)) {
        console.error('ProductCard: Invalid MongoDB ObjectId format:', cleanProductId);
        return;
      }
      
      const fetchedProduct = await productAPI.getProduct(cleanProductId);
      setProduct(fetchedProduct);
    } catch (err) {
      console.error('ProductCard: Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="product-card loading">
        <div className="animate-pulse bg-gray-300 product-image"></div>
        <div className="product-info">
          <div className="animate-pulse bg-gray-300 h-3 w-3/4 mb-1 rounded"></div>
          <div className="animate-pulse bg-gray-300 h-4 w-1/2 mb-2 rounded"></div>
          <div className="animate-pulse bg-gray-300 h-6 w-full rounded"></div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="product-card">
      <img 
        src={product.imageUrl} 
        alt={product.name}
        className="product-image"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/90x90?text=Product';
        }}
      />
      <div className="product-info">
        <div>
          <h4 className="product-name">{product.name}</h4>
          <p className="product-price">€{product.price}</p>
        </div>
        <button 
          onClick={() => onShopNow(product._id)}
          className="shop-btn"
        >
          SHOP
        </button>
      </div>
    </div>
  );
};

export default Lookbook; 