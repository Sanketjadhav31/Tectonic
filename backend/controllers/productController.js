const Product = require('../models/Product');
const mongoose = require('mongoose');

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log('Requested product ID:', productId);
    
    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log('Invalid ObjectId format:', productId);
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    const product = await Product.findById(productId);
    console.log('Product found:', product ? 'Yes' : 'No');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProductById
}; 