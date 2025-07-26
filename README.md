# 🍕 Pizza Delivery Full-Stack Web Application

A complete, production-ready pizza delivery web application built with modern technologies. Features a beautiful customer interface and a comprehensive admin panel for managing orders, pizzas, and analytics.

## ✨ Features

### 🛍️ Customer Features
- **Modern UI/UX** - Beautiful, responsive design inspired by Swiggy/Zomato
- **Browse Menu** - View pizzas with images, descriptions, and prices
- **Smart Filtering** - Filter by category, search by name
- **Shopping Cart** - Add, remove, and update quantities
- **Order Management** - Place orders with delivery details
- **Real-time Tracking** - Live order status updates
- **Customer Accounts** - Sign up, login, order history
- **Multiple Addresses** - Save and manage delivery addresses
- **Online Payments** - Secure payment integration (Razorpay)
- **PWA Support** - Installable app with offline capabilities

### 🛠️ Admin Features
- **Secure Admin Panel** - JWT authentication
- **Dashboard Analytics** - Revenue, orders, popular items
- **Pizza Management** - CRUD operations with image upload
- **Order Management** - View and update order statuses
- **Customer Management** - View customer details and orders
- **Coupon System** - Create and manage discount codes
- **Real-time Updates** - Live notifications and status changes

## 🚀 Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Toastify** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Image storage
- **Socket.IO** - Real-time features
- **Razorpay** - Payment gateway

## 📦 Installation

### Prerequisites
- Node.js (>= 16.0.0)
- npm or yarn
- MongoDB (local or Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/pizza-delivery-app.git
cd pizza-delivery-app
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/pizza-delivery
JWT_SECRET=your_jwt_secret_here
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
```

### 4. Start the Application

#### Development Mode
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

#### Production Mode
```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd backend
npm start
```

## 🔐 Default Admin Credentials

After starting the server for the first time, a default admin user is automatically created:

- **Email:** `admin@pizza.com`
- **Password:** `admin123`

⚠️ **Important:** Change the default password after first login!

## 📱 Usage

### Customer Interface
1. Open `http://localhost:3000`
2. Browse the pizza menu
3. Add items to cart
4. Proceed to checkout
5. Enter delivery details
6. Complete payment
7. Track your order

### Admin Panel
1. Go to `http://localhost:3000/admin/login`
2. Login with admin credentials
3. Access dashboard, manage pizzas, orders, etc.

## 🗄️ Database Seeding

The application automatically seeds:
- Default admin user
- Sample pizzas
- Default coupons

To manually seed data:
```bash
cd backend
npm run seed:admin
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get admin profile

### Pizzas
- `GET /api/pizzas` - Get all pizzas
- `POST /api/pizzas` - Create pizza (admin)
- `PUT /api/pizzas/:id` - Update pizza (admin)
- `DELETE /api/pizzas/:id` - Delete pizza (admin)

### Orders
- `GET /api/orders` - Get orders (admin)
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status

### Customers
- `POST /api/customer/register` - Customer registration
- `POST /api/customer/login` - Customer login
- `GET /api/customer/profile` - Get customer profile

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Backend (Railway/Render/Heroku)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Get connection string
3. Update `MONGODB_URI` in environment variables

## 📊 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pizza-delivery
JWT_SECRET=your_super_secret_jwt_key
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=production
PORT=5000
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons from [React Icons](https://react-icons.github.io/react-icons/)
- UI inspiration from Swiggy, Zomato, and Skiper
- Payment integration with Razorpay
- Image hosting with Cloudinary

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Made with ❤️ for pizza lovers everywhere! 🍕**
