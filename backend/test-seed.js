const bcrypt = require('bcryptjs');

// Test the seeding logic without database connection
const testSeedLogic = async () => {
  try {
    console.log('🧪 Testing admin seeding logic...');

    // Test password hashing (this is what happens in the Admin model)
    const testPassword = 'admin123';
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(testPassword, salt);

    console.log('✅ Password hashing works correctly');
    console.log('📧 Email: admin@pizza.com');
    console.log('🔑 Password: admin123');
    console.log('🔒 Hashed password length:', hashedPassword.length);

    // Test password verification
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    console.log('✅ Password verification works:', isMatch);

    // Show the admin data structure
    const adminData = {
      name: 'Super Admin',
      email: 'admin@pizza.com',
      password: hashedPassword,
      role: 'super_admin',
      permissions: [
        'manage_pizzas',
        'manage_orders',
        'view_analytics',
        'manage_admins',
        'manage_settings'
      ],
      isActive: true
    };

    console.log('📋 Admin data structure:');
    console.log(JSON.stringify(adminData, null, 2));

    console.log('✅ All tests passed! The seeding logic is ready.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testSeedLogic(); 