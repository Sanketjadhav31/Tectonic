import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, onClose, position }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!product) return null;

  const handleShopNow = () => {
    navigate(`/product/${product._id}`);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-80 flex items-end justify-center z-50 p-0 transition-all duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`product-card w-full max-w-md mx-0 mb-0 rounded-t-3xl rounded-b-none transform transition-all duration-500 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ${product.price}
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="ml-4 p-2 text-gray-500 hover:text-gray-700 text-2xl leading-none transition-colors duration-200"
          >
            ×
          </button>
        </div>
        
        {/* Product Image */}
        <div className="relative mb-4 rounded-xl overflow-hidden bg-gray-100 shadow-lg">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-40 object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x200?text=Product+Image';
            }}
          />
        </div>
        
        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed line-clamp-2">
          {product.description}
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={handleShopNow}
            className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all duration-300 active:scale-95 transform shadow-lg"
          >
            Shop Now
          </button>
          
          <button 
            onClick={handleClose}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium hover:border-gray-400 transition-all duration-300"
          >
            Continue Browsing
          </button>
        </div>

        {/* Bottom Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 