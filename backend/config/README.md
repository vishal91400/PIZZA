# Database Seeding Configuration

This directory contains database seeding functionality for the Pizza Delivery App.

## Files

- `seedAdmin.js` - Contains functions to seed default admin user
- `README.md` - This documentation file

## Default Admin User

The system automatically creates a default admin user with the following credentials:

- **Email:** `admin@pizza.com`
- **Password:** `admin123`
- **Role:** `super_admin`
- **Permissions:** All permissions (manage_pizzas, manage_orders, view_analytics, manage_admins, manage_settings)

## How It Works

### Automatic Seeding (Recommended)

The default admin user is automatically created when the server starts:

1. Server connects to MongoDB
2. `initializeSeedData()` function is called
3. System checks if admin with email `admin@pizza.com` exists
4. If not found, creates the default admin user
5. Password is automatically hashed using bcrypt

### Manual Seeding

You can also run the seeding script manually:

```bash
# Using npm script
npm run seed:admin

# Or directly
node scripts/seedAdmin.js
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Change Default Password:** Always change the default password (`admin123`) after first login
2. **Production Environment:** In production, consider removing or disabling automatic seeding
3. **Environment Variables:** Ensure your `.env` file has proper `JWT_SECRET` configured

## Login Process

The default admin can login using the existing `/api/auth/login` endpoint:

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@pizza.com",
  "password": "admin123"
}
```

## Extending Seeding

To add more seed data, modify the `initializeSeedData()` function in `seedAdmin.js`:

```javascript
const initializeSeedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Seed admin user
    const adminResult = await seedAdmin();
    
    // Add more seeding functions here
    // const pizzaResult = await seedPizzas();
    // const couponResult = await seedCoupons();
    
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
```

## Troubleshooting

### Common Issues

1. **"Admin already exists"** - This is normal if the admin was already created
2. **"Database connection failed"** - Check your `MONGODB_URI` in `.env`
3. **"Password hashing error"** - Ensure bcryptjs is properly installed

### Logs

The seeding process provides detailed console logs:

```
🔍 Checking for default admin user...
✅ Default admin user already exists
```

or

```
🔍 Checking for default admin user...
📝 Creating default admin user...
✅ Default admin user created successfully
📧 Email: admin@pizza.com
🔑 Password: admin123
⚠️  Please change the password after first login!
``` 