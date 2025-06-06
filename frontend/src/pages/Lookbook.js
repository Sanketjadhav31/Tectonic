import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { lookbookAPI, productAPI } from '../services/api';

const Lookbook = () => {
  const [looks, setLooks] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all unique products
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState({});
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
      // Clear all timeouts - fix for ref dependency warning
      const currentTimeouts = observerTimeouts.current;
      Object.values(currentTimeouts).forEach(timeout => {
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
      
      // Extract all unique product IDs from all looks
      const allProductIds = [];
      fetchedLooks?.forEach(look => {
        if (look.productIds) {
          look.productIds.forEach(productId => {
            // Convert ObjectId to string if necessary
            const idString = typeof productId === 'object' && productId._id ? productId._id : 
                           typeof productId === 'object' && productId.toString ? productId.toString() : 
                           productId;
            
            if (!allProductIds.includes(idString)) {
              allProductIds.push(idString);
            }
          });
        }
      });
      
      console.log('Found product IDs:', allProductIds);
      
      // Fetch all products
      const products = [];
      for (const productId of allProductIds) {
        try {
          // Ensure productId is a string
          const idString = typeof productId === 'object' ? productId.toString() : productId;
          const product = await productAPI.getProduct(idString);
          if (product) {
            products.push(product);
          }
        } catch (err) {
          console.warn('Failed to fetch product:', productId, err);
        }
      }
      
      console.log('Fetched products:', products);
      setAllProducts(products);
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

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Update all videos
    Object.values(videoRefs.current).forEach(video => {
      if (video) {
        video.muted = !isMuted;
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
    <>
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
                  onClick={() => toggleVideoPause(lookIndex)}
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
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x600?text=Image+Not+Found';
                  }}
                />
              )}

              {/* Annotation Dots - Instagram style product tags */}
              {look.productIds && look.productIds.map((productId, idx) => {
                // Sample positions - in real app, these would come from database
                const samplePositions = [
                  { top: '25%', left: '30%' },
                  { top: '45%', left: '70%' },
                  { top: '65%', left: '25%' },
                  { top: '80%', left: '60%' }
                ];
                const position = samplePositions[idx % samplePositions.length];
                
                return (
                  <div
                    key={`annotation-${lookIndex}-${productId}-${idx}`}
                    className="absolute w-6 h-6 bg-white bg-opacity-90 rounded-full border-2 border-teal-400 flex items-center justify-center cursor-pointer z-30 animate-pulse hover:scale-110 transition-transform"
                    style={{ top: position.top, left: position.left }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShopNow(productId);
                    }}
                  >
                    <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                  </div>
                );
              })}

              {/* Video Controls (only for videos) */}
              {look.contentType === 'video' && (
                <>
                  {/* Mute button */}
                  <button onClick={toggleMute} className="mute-btn">
                    {isMuted ? '🔇' : '🔊'}
                  </button>

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

              {/* Scroll indicator */}
              {lookIndex < looks.length - 1 && (
                <div className="scroll-indicator">
                  <div className="scroll-arrow">↑</div>
                  <div>Swipe up</div>
                </div>
              )}
            </div>

            {/* Products for THIS specific look - positioned absolutely within this look container */}
            <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-4 pb-2">
              <div className="flex overflow-x-auto space-x-2 px-3">
                {allProducts.length > 0 ? (
                  allProducts.map((product, index) => (
                    <ProductCard
                      key={`look-${lookIndex}-product-${product._id}-${index}`}
                      product={product}
                      onShopNow={handleShopNow}
                    />
                  ))
                ) : (
                  <div className="text-white text-xs p-2">
                    Loading products...
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// Product Card Component - SMALLER - Now receives product directly
const ProductCard = ({ product, onShopNow }) => {
  if (!product) return null;

  return (
    <div className="product-card">
      <img 
        src={product.imageUrl} 
        alt={product.name}
        className="product-image"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/80x48?text=Product';
        }}
      />
      <div className="product-info">
        <h4 className="product-name">{product.name}</h4>
        <p className="product-price">€{product.price}</p>
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