const express = require('express');
const router = express.Router();
const { getAllLooks, getLookById } = require('../controllers/lookController');

// GET /api/looks - Get all looks
router.get('/', getAllLooks);

// GET /api/looks/:id - Get look by ID
router.get('/:id', getLookById);

module.exports = router; 