const Admin = require('../models/Admin');

/**
 * Seed default admin user
 * Creates a default admin user if one doesn't exist
 */
const seedAdmin = async () => {
  try {
    console.log('🔍 Checking for default admin user...');

    // Check if admin with email "admin@pizza.com" already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@pizza.com' });

    if (existingAdmin) {
      console.log('✅ Default admin user already exists');
      return {
        success: true,
        message: 'Default admin user already exists',
        admin: {
          id: existingAdmin._id,
          name: existingAdmin.name,
          email: existingAdmin.email,
          role: existingAdmin.role
        }
      };
    }

    // Create default admin user
    console.log('📝 Creating default admin user...');
    const defaultAdmin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@pizza.com',
      password: 'admin123', // Will be automatically hashed by the pre-save middleware
      role: 'super_admin',
      permissions: [
        'manage_pizzas',
        'manage_orders',
        'view_analytics',
        'manage_admins',
        'manage_settings'
      ],
      isActive: true
    });

    console.log('✅ Default admin user created successfully');
    console.log('📧 Email: admin@pizza.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');

    return {
      success: true,
      message: 'Default admin user created successfully',
      admin: {
        id: defaultAdmin._id,
        name: defaultAdmin.name,
        email: defaultAdmin.email,
        role: defaultAdmin.role
      }
    };

  } catch (error) {
    console.error('❌ Error seeding default admin:', error);
    return {
      success: false,
      message: 'Failed to seed default admin user',
      error: error.message
    };
  }
};

/**
 * Initialize all seed data
 * This function can be extended to seed other data as needed
 */
const initializeSeedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Seed admin user
    const adminResult = await seedAdmin();

    if (adminResult.success) {
      console.log('✅ Database seeding completed successfully');
    } else {
      console.error('❌ Database seeding failed:', adminResult.message);
    }

    return adminResult;

  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    return {
      success: false,
      message: 'Database seeding failed',
      error: error.message
    };
  }
};

module.exports = {
  seedAdmin,
  initializeSeedData
}; 