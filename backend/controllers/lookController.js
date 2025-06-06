const Look = require('../models/Look');

// Get all looks
const getAllLooks = async (req, res) => {
  try {
    const looks = await Look.find().populate('productIds');
    res.json(looks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get look by ID
const getLookById = async (req, res) => {
  try {
    const look = await Look.findById(req.params.id).populate('productIds');
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