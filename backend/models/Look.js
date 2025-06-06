const mongoose = require('mongoose');

const annotationSchema = new mongoose.Schema({
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
});

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  annotations: [annotationSchema]
});

const videoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  }
});

const lookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['video', 'image'],
    required: true
  },
  mediaUrl: {
    type: String,
    required: true
  },
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Look', lookSchema); 