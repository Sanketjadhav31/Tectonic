const express = require('express');
const router = express.Router();
const { getProductById } = require('../controllers/productController');

// GET /api/products/:id - Get product by ID
router.get('/:id', getProductById);

module.exports = router; 