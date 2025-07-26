const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import the seed function
const { seedAdmin } = require('../config/seedAdmin');

/**
 * Standalone script to seed admin user
 * Run this script with: node scripts/seedAdmin.js
 */
const runSeedScript = async () => {
  try {
    console.log('🚀 Starting admin seeding script...');

    // Connect to database
    console.log('📡 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ Connected to MongoDB: ${mongoose.connection.host}`);

    // Run the seed function
    const result = await seedAdmin();

    if (result.success) {
      console.log('✅ Admin seeding completed successfully!');
      console.log('📋 Result:', result.message);
    } else {
      console.error('❌ Admin seeding failed:', result.message);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Script error:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script if this file is executed directly
if (require.main === module) {
  runSeedScript();
}

module.exports = { runSeedScript }; 