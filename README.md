# 📱 Fashion Lookbook Web App

A mobile-first fashion lookbook application built with the MERN stack that showcases fashion looks through images and videos with interactive product annotations.

## 🌟 Features

### ✅ **Complete Feature Implementation**

#### 🔄 **Look Preview Navigation**
- **⏱ Auto-play Images**: 5-second timer with visual progress bar
- **▶️ Auto-play Videos**: Full video playback with mute/unmute controls
- **👉 Tap Navigation**: Left/right tap for media navigation within looks
- **👆 Swipe Navigation**: Up/down swipe for different looks
- **⏸ Touch & Hold**: Pause auto-progression by touching and holding

#### 🎯 **Product Annotations**
- **🟢 Interactive Dots**: Positioned at (x,y) coordinates on images
- **🛍 Product Popups**: Click dots to see product cards with details
- **💄 Product Info**: Name, price, image, and "Shop Now" button
- **✨ Visual Effects**: Animated dots with pulse and ping effects

#### 📦 **Product Detail Page (PDP)**
- **🧥 Full Product Info**: Complete product details and descriptions
- **🔙 Back Navigation**: Smooth navigation back to lookbook
- **🛒 Shopping Features**: Quantity selector, size options, reviews
- **📱 Mobile Optimized**: Touch-friendly interface with animations

#### 📱 **Mobile-First UI**
- **📐 Responsive Layout**: Mobile-first with desktop support
- **↔️ Touch Optimized**: All interactions designed for touch
- **🎨 Modern Design**: Clean, minimalist interface with smooth animations
- **⚡ Performance**: Optimized loading and smooth transitions

## 🏗️ Tech Stack

- **Frontend**: React.js 19, Tailwind CSS, React Router, React Swipeable
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Styling**: Tailwind CSS with custom animations and mobile-first design
- **State Management**: React Hooks with optimized performance

## 📁 Enhanced Project Structure

```
lookbook-app/
├── backend/
│   ├── models/
│   │   ├── Look.js          # Look schema with images/videos/annotations
│   │   └── Product.js       # Product schema with full details
│   ├── routes/
│   │   ├── looks.js         # Look-related API endpoints
│   │   └── products.js      # Product-related API endpoints
│   ├── controllers/
│   │   ├── lookController.js # Look business logic
│   │   └── productController.js # Product business logic
│   ├── config/
│   │   └── db.js            # MongoDB connection setup
│   ├── sample-data.js       # Enhanced database seeding
│   └── index.js             # Express server with middleware
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MediaViewer.js     # Enhanced media display with controls
│   │   │   ├── ProgressBar.js     # Precise timing component
│   │   │   ├── AnnotationDot.js   # Interactive annotation dots
│   │   │   └── ProductCard.js     # Mobile-optimized product modal
│   │   ├── pages/
│   │   │   ├── Lookbook.js        # Main lookbook with gestures
│   │   │   └── ProductDetail.js   # Enhanced product page
│   │   ├── services/
│   │   │   └── api.js             # API service with error handling
│   │   ├── App.js              # Router setup
│   │   └── index.css           # Complete Tailwind setup
│   ├── public/
│   │   └── index.html          # Mobile-optimized HTML
│   ├── package.json            # All necessary dependencies
│   ├── tailwind.config.js      # Custom animations and utilities
│   └── postcss.config.js       # PostCSS configuration
├── package.json               # Root package.json with scripts
├── .gitignore                # Comprehensive gitignore
└── README.md                 # This documentation
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn**

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd lookbook-app

# Install all dependencies (root, backend, frontend)
npm run install-deps
```

### 2. Database Setup

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod

# Seed with sample data
cd backend
node sample-data.js
```

**Option B: MongoDB Atlas**
```bash
# Set MONGODB_URI in backend/.env
cd backend
echo "MONGODB_URI=your_atlas_connection_string" > .env
node sample-data.js
```

### 3. Start Development Servers

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start individually:
npm run server   # Backend only (port 5000)
npm run client   # Frontend only (port 3000)
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000 (should show "Lookbook API is running!")

## 📱 Usage Guide & Features

### 🎮 **Navigation Controls**
| Action | Gesture | Result |
|--------|---------|--------|
| **Swipe Up** | Finger swipe up | Go to next look |
| **Swipe Down** | Finger swipe down | Go to previous look |
| **Swipe Left/Right** | Finger swipe horizontally | Navigate media within look |
| **Tap Left** | Tap left side of screen | Previous media |
| **Tap Right** | Tap right side of screen | Next media |
| **Touch & Hold** | Long press anywhere | Pause auto-progression |
| **Tap Dots** | Tap annotation dots | View product details |

### ⌨️ **Keyboard Shortcuts** (Desktop)
- **Arrow Keys**: Navigate media and looks
- **Spacebar**: Pause/resume auto-progression

### 🎯 **Interactive Features**
1. **Auto-Progressive Media**: Images advance every 5 seconds with visual progress
2. **Video Playback**: Full video support with mute/unmute controls
3. **Product Annotations**: Interactive dots reveal product information
4. **Product Cards**: Mobile-optimized popups with product details
5. **Product Detail Pages**: Complete shopping experience with reviews and features

### 📊 **Sample Data Included**
- **4 Fashion Looks**: Different styles (Casual, Urban, Minimalist, Cozy)
- **8 Products**: Sneakers, jackets, bags, accessories, etc.
- **Mixed Media**: Images and videos with product annotations
- **Working URLs**: High-quality Unsplash images and sample videos

## 🛠️ API Endpoints

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/` | GET | Health check | API status message |
| `/api/looks` | GET | Get all looks | Array of looks with populated products |
| `/api/looks/:id` | GET | Get specific look | Single look with populated products |
| `/api/products/:id` | GET | Get product details | Single product with full information |

### 📝 **Sample API Response**

```javascript
// GET /api/looks
[
  {
    "_id": "...",
    "title": "Casual Streetwear",
    "images": [
      {
        "url": "https://images.unsplash.com/...",
        "annotations": [
          {
            "x": 30,
            "y": 85,
            "productId": {
              "_id": "...",
              "name": "Classic White Sneakers",
              "price": 129.99,
              "description": "...",
              "imageUrl": "..."
            }
          }
        ]
      }
    ],
    "videos": [{"url": "..."}]
  }
]
```

## 🎨 Design Features

### 📱 **Mobile-First Approach**
- **Touch-Optimized**: All interactions designed for mobile
- **Gesture Support**: Native swipe and touch gestures
- **Safe Areas**: Respects device safe areas (notches, home indicators)
- **Performance**: Optimized for mobile devices

### ✨ **Visual Elements**
- **Smooth Animations**: 60fps animations and transitions
- **Progress Indicators**: Visual feedback for timing and navigation
- **Loading States**: Elegant loading animations
- **Error Handling**: User-friendly error messages with retry options

### 🎭 **Custom Animations**
- **Annotation Dots**: Pulse and ping effects
- **Product Cards**: Slide-up animations
- **Progress Bars**: Smooth linear progression
- **Navigation**: Smooth transitions between looks

## 🗃️ Database Schema

### 📁 **Look Model**
```javascript
{
  title: String,           // Look title (e.g., "Casual Streetwear")
  images: [{
    url: String,           // Image URL
    annotations: [{
      x: Number,           // X coordinate (0-100%)
      y: Number,           // Y coordinate (0-100%)
      productId: ObjectId  // Reference to Product
    }]
  }],
  videos: [{
    url: String            // Video URL
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 📁 **Product Model**
```javascript
{
  name: String,            // Product name
  price: Number,           // Product price
  description: String,     // Product description
  imageUrl: String,        // Product image URL
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Development

### 🎨 **Customization Options**
- **Timing**: Adjust image duration in `ProgressBar.js`
- **Styling**: Modify `tailwind.config.js` for design changes
- **Animations**: Update CSS in `index.css` for custom animations
- **Gestures**: Configure swipe sensitivity in `Lookbook.js`

### 🧪 **Adding New Content**
1. **New Products**: Add to `sampleProducts` array in `sample-data.js`
2. **New Looks**: Add to `sampleLooks` array with image URLs and annotations
3. **Annotations**: Use x,y coordinates (0-100%) for dot positioning
4. **Re-seed**: Run `node sample-data.js` to update database

### 🐛 **Debugging**
- **Backend Logs**: Check terminal for API errors
- **Frontend Console**: Open browser dev tools for client errors
- **Database**: Use MongoDB Compass to inspect data
- **Network**: Check Network tab for API request/response issues

## 📦 Deployment

### 🌐 **Frontend (Vercel)**
```bash
cd frontend
npm run build
# Connect to Vercel and deploy build folder
```

### 🚀 **Backend (Railway/Render)**
```bash
cd backend
# Deploy to Railway, Render, or similar service
# Set environment variable: MONGODB_URI
```

### 💾 **Database (MongoDB Atlas)**
- Create MongoDB Atlas cluster
- Update connection string in environment variables
- Run seeding script on production database

## 🧪 Testing

### ✅ **Feature Testing Checklist**
- [ ] Auto-progressive images (5-second timer)
- [ ] Video playback with mute/unmute
- [ ] Swipe navigation (up/down for looks)
- [ ] Tap navigation (left/right for media)
- [ ] Touch & hold to pause
- [ ] Annotation dots clickable
- [ ] Product cards display correctly
- [ ] Product detail page navigation
- [ ] Mobile responsiveness
- [ ] Loading states
- [ ] Error handling

### 📊 **Performance Testing**
- Images load efficiently
- Smooth 60fps animations
- Responsive touch interactions
- Fast API response times

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Unsplash**: High-quality fashion images
- **Google**: Sample video content
- **Tailwind CSS**: Utility-first styling framework
- **React Community**: Excellent ecosystem and tools

---

## 🚀 **Ready to Run!**

This implementation includes all required features:
- ✅ Auto-progressive media with timing
- ✅ Video support with controls
- ✅ Touch and swipe navigation
- ✅ Interactive product annotations
- ✅ Product detail pages
- ✅ Mobile-first responsive design
- ✅ Sample data and working APIs
- ✅ Error handling and loading states

**Built with ❤️ for Tectonic Interview Challenge** 