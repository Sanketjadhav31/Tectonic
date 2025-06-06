const mongoose = require('mongoose');
const Look = require('./models/Look');
const Product = require('./models/Product');

const sampleProducts = [
  {
    name: "Classic White Sneakers",
    price: 129.99,
    description: "Comfortable and stylish white leather sneakers perfect for any casual outfit. Features premium leather construction and cushioned sole for all-day comfort.",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Vintage Denim Jacket",
    price: 89.99,
    description: "Classic blue denim jacket with a vintage wash. Perfect for layering and adding a casual touch to any outfit. Made from high-quality cotton denim.",
    imageUrl: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Black Crossbody Bag",
    price: 65.99,
    description: "Elegant black leather crossbody bag with adjustable strap. Perfect for everyday use with multiple compartments for organization.",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Oversized Sunglasses",
    price: 45.99,
    description: "Trendy oversized sunglasses with UV protection. Classic black frame suitable for any face shape and provides excellent sun protection.",
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Slim Fit Black Jeans",
    price: 79.99,
    description: "High-quality black denim jeans with a comfortable slim fit. Made from stretch denim for all-day comfort and perfect silhouette.",
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Minimalist Watch",
    price: 199.99,
    description: "Elegant minimalist watch with genuine leather strap. Features a clean design perfect for both casual and formal occasions.",
    imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Knit Sweater",
    price: 95.99,
    description: "Cozy knit sweater made from premium wool blend. Perfect for layering in cooler weather with a comfortable relaxed fit.",
    imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Baseball Cap",
    price: 29.99,
    description: "Classic baseball cap with adjustable strap. Made from durable cotton with embroidered logo detailing.",
    imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  }
];

// MIXED CONTENT LOOKS - Each look has either video OR image randomly
const sampleLooks = [
  {
    title: "Casual Streetwear",
    contentType: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    productIds: [] // Will be populated with actual IDs
  },
  {
    title: "Urban Chic",
    contentType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    productIds: [] // Will be populated with actual IDs
  },
  {
    title: "Minimalist Style",
    contentType: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    productIds: [] // Will be populated with actual IDs
  },
  {
    title: "Cozy Winter",
    contentType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    productIds: [] // Will be populated with actual IDs
  },
  {
    title: "Summer Vibes",
    contentType: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    productIds: [] // Will be populated with actual IDs
  },
  {
    title: "Evening Elegance",
    contentType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    productIds: [] // Will be populated with actual IDs
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/lookbook', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Look.deleteMany({});

    console.log('Cleared existing data');

    // Insert products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${insertedProducts.length} products`);
    console.log('Product IDs:');
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ID: ${product._id}`);
    });

    // Assign products to looks - BETTER MIX for horizontal scrolling showcase
    // Look 1: Casual Streetwear - Multiple (4 products) - Good horizontal scroll
    sampleLooks[0].productIds = [
      insertedProducts[0]._id.toString(), // Sneakers
      insertedProducts[1]._id.toString(), // Denim jacket
      insertedProducts[7]._id.toString(), // Cap
      insertedProducts[2]._id.toString()  // Bag
    ];

    // Look 2: Urban Chic - Multiple (3 products)
    sampleLooks[1].productIds = [
      insertedProducts[3]._id.toString(), // Sunglasses
      insertedProducts[4]._id.toString(), // Jeans
      insertedProducts[5]._id.toString()  // Watch
    ];

    // Look 3: Minimalist Style - Single product
    sampleLooks[2].productIds = [
      insertedProducts[5]._id.toString()  // Watch only
    ];

    // Look 4: Cozy Winter - Multiple (2 products)
    sampleLooks[3].productIds = [
      insertedProducts[6]._id.toString(), // Knit sweater
      insertedProducts[7]._id.toString()  // Cap
    ];

    // Look 5: Summer Vibes - Multiple (5 products) - Maximum horizontal scroll
    sampleLooks[4].productIds = [
      insertedProducts[3]._id.toString(), // Sunglasses
      insertedProducts[0]._id.toString(), // Sneakers
      insertedProducts[2]._id.toString(), // Bag
      insertedProducts[4]._id.toString(), // Jeans
      insertedProducts[6]._id.toString()  // Sweater
    ];

    // Look 6: Evening Elegance - Single product
    sampleLooks[5].productIds = [
      insertedProducts[1]._id.toString()  // Denim jacket only
    ];

    // Insert looks
    const insertedLooks = await Look.insertMany(sampleLooks);
    console.log(`Inserted ${insertedLooks.length} looks`);

    console.log('Database seeded successfully!');
    console.log('\nAvailable mixed content looks:');
    insertedLooks.forEach((look, index) => {
      console.log(`${index + 1}. ${look.title} - Type: ${look.contentType}, Products: ${look.productIds.length}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase(); 