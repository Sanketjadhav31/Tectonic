import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lookbookAPI, productAPI } from '../services/api';

const Lookbook = () => {
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMediaIndexes, setCurrentMediaIndexes] = useState({});
  const [selectedProducts, setSelectedProducts] = useState({});
  const [isMuted, setIsMuted] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchLooks();
  }, []);

  const fetchLooks = async () => {
    try {
      setLoading(true);
      const fetchedLooks = await lookbookAPI.getAllLooks();
      console.log('Fetched looks:', fetchedLooks);
      setLooks(fetchedLooks || []);
      
      // Initialize media indexes for each look
      const indexes = {};
      fetchedLooks?.forEach((look, index) => {
        indexes[index] = 0;
      });
      setCurrentMediaIndexes(indexes);
      
      setError(null);
    } catch (err) {
      setError('Failed to load looks. Please try again.');
      console.error('Error fetching looks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDotClick = async (lookIndex, productId) => {
    try {
      const product = await productAPI.getProduct(productId);
      setSelectedProducts(prev => ({
        ...prev,
        [lookIndex]: product
      }));
    } catch (err) {
      console.error('Error fetching product:', err);
    }
  };

  const handleMediaNavigation = (lookIndex, direction) => {
    const look = looks[lookIndex];
    const totalMedia = (look.images?.length || 0) + (look.videos?.length || 0);
    const currentIndex = currentMediaIndexes[lookIndex] || 0;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex < totalMedia - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : totalMedia - 1;
    }
    
    setCurrentMediaIndexes(prev => ({
      ...prev,
      [lookIndex]: newIndex
    }));
  };

  const handleShopNow = (productId) => {
    navigate(`/product/${productId}`);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.muted = !isMuted;
    });
  };

  const getCurrentMedia = (look, mediaIndex) => {
    const images = look.images?.map(img => ({ 
      type: 'image', 
      src: img.url || img, 
      annotations: img.annotations || [] 
    })) || [];
    const videos = look.videos?.map(vid => ({ 
      type: 'video', 
      src: vid.url || vid, 
      annotations: [] 
    })) || [];
    
    const allMedia = [...images, ...videos];
    return allMedia[mediaIndex] || allMedia[0];
  };

  const getAllAnnotations = (look) => {
    const annotations = [];
    look.images?.forEach(img => {
      if (img.annotations) {
        annotations.push(...img.annotations);
      }
    });
    return annotations;
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
    <div className="instagram-feed">
      {looks.map((look, lookIndex) => {
        const currentMediaIndex = currentMediaIndexes[lookIndex] || 0;
        const currentMedia = getCurrentMedia(look, currentMediaIndex);
        const totalMedia = (look.images?.length || 0) + (look.videos?.length || 0);
        const isVideo = currentMedia?.type === 'video';
        const allAnnotations = getAllAnnotations(look);
        
        return (
          <div key={look._id} className="look-container">
            {/* Look Header */}
            <div className="look-header">
              <h3 className="look-title">{look.title}</h3>
              <div className="media-counter">
                {currentMediaIndex + 1} / {totalMedia}
              </div>
            </div>

            {/* Media Container */}
            <div className="media-container">
              {/* Media Display */}
              <div className="media-display">
                {currentMedia?.type === 'image' ? (
                  <img 
                    src={currentMedia.src} 
                    alt={look.title}
                    className="media-item"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x600?text=Image+Not+Found';
                    }}
                  />
                ) : (
                  <video 
                    src={currentMedia?.src} 
                    className="media-item"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    onError={(e) => {
                      console.error('Video error:', e);
                    }}
                  />
                )}

                {/* Navigation arrows for multiple media */}
                {totalMedia > 1 && (
                  <>
                    <button 
                      className="media-nav prev"
                      onClick={() => handleMediaNavigation(lookIndex, 'prev')}
                    >
                      ‹
                    </button>
                    <button 
                      className="media-nav next"
                      onClick={() => handleMediaNavigation(lookIndex, 'next')}
                    >
                      ›
                    </button>
                  </>
                )}

                {/* Mute button for videos */}
                {isVideo && (
                  <button onClick={toggleMute} className="mute-btn">
                    {isMuted ? '🔇' : '🔊'}
                  </button>
                )}

                {/* Annotation dots for images */}
                {!isVideo && currentMedia?.annotations?.map((annotation, dotIndex) => (
                  <button
                    key={dotIndex}
                    className="annotation-dot"
                    style={{
                      left: `${annotation.x}%`,
                      top: `${annotation.y}%`
                    }}
                    onClick={() => handleDotClick(lookIndex, annotation.productId)}
                  >
                    <div className="dot-tooltip">
                      Tap for product details
                    </div>
                  </button>
                ))}

                {/* Media dots indicator */}
                {totalMedia > 1 && (
                  <div className="media-dots">
                    {Array.from({ length: totalMedia }).map((_, index) => (
                      <button
                        key={index}
                        className={`media-dot ${index === currentMediaIndex ? 'active' : ''}`}
                        onClick={() => setCurrentMediaIndexes(prev => ({
                          ...prev,
                          [lookIndex]: index
                        }))}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Scroll Bar */}
              <div className="product-scroll-container">
                <div className="product-scroll">
                  {allAnnotations.map((annotation, index) => (
                    <ProductCard
                      key={index}
                      productId={annotation.productId}
                      isSelected={selectedProducts[lookIndex]?._id === annotation.productId}
                      onShopNow={handleShopNow}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Product Card Component
const ProductCard = ({ productId, isSelected, onShopNow }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const fetchedProduct = await productAPI.getProduct(productId);
      setProduct(fetchedProduct);
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="product-card loading">
        <div className="animate-pulse bg-gray-300 h-32 w-full rounded-t-lg"></div>
        <div className="p-3">
          <div className="animate-pulse bg-gray-300 h-4 w-3/4 mb-2 rounded"></div>
          <div className="animate-pulse bg-gray-300 h-6 w-1/2 rounded"></div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className={`product-card ${isSelected ? 'selected' : ''}`}>
      <img 
        src={product.imageUrl} 
        alt={product.name}
        className="product-image"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/200x150?text=Product';
        }}
      />
      <div className="product-info">
        <h4 className="product-name">{product.name}</h4>
        <p className="product-price">${product.price}</p>
        <button 
          onClick={() => onShopNow(product._id)}
          className="shop-btn"
        >
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default Lookbook; 