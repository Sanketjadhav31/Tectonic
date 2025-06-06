const Look = require('../models/Look');

// Get all looks
const getAllLooks = async (req, res) => {
  try {
    const looks = await Look.find().populate('images.annotations.productId');
    res.json(looks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get look by ID
const getLookById = async (req, res) => {
  try {
    const look = await Look.findById(req.params.id).populate('images.annotations.productId');
    if (!look) {
      return res.status(404).json({ message: 'Look not found' });
    }
    res.json(look);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllLooks,
  getLookById
}; 