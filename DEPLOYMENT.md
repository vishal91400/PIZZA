# 🚀 Deployment Guide

This guide will help you deploy your Pizza Delivery Web App to production platforms.

## 📋 Prerequisites

- Node.js 16+ installed
- Git repository set up
- MongoDB Atlas account
- Cloudinary account
- Vercel account (for frontend)
- Railway/Render/Heroku account (for backend)

## 🗄️ Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Cluster:**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a free cluster
   - Set up database access (username/password)
   - Set up network access (IP whitelist: 0.0.0.0/0 for production)

2. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

## ☁️ Image Storage Setup (Cloudinary)

1. **Create Cloudinary Account:**
   - Go to [Cloudinary](https://cloudinary.com)
   - Sign up for a free account
   - Get your Cloud Name, API Key, and API Secret

2. **Configure Upload Preset:**
   - Go to Settings > Upload
   - Create a new upload preset
   - Set it to "Unsigned" for frontend uploads

## 🎨 Frontend Deployment (Vercel)

### Option 1: Vercel CLI

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
cd frontend
vercel
```

3. **Configure Environment Variables:**
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Add:
     ```
     REACT_APP_API_URL=https://your-backend-url.com/api
     REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
     ```

### Option 2: Vercel Dashboard

1. **Connect Repository:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. **Configure Build Settings:**
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

3. **Set Environment Variables:**
   - Add the same environment variables as above

## ⚙️ Backend Deployment

### Option 1: Railway

1. **Deploy to Railway:**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Select the `backend` directory

2. **Set Environment Variables:**
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   PORT=5000
   NODE_ENV=production
   ```

### Option 2: Render

1. **Deploy to Render:**
   - Go to [Render](https://render.com)
   - Create a new Web Service
   - Connect your GitHub repository
   - Set root directory to `backend`

2. **Configure Service:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Set environment variables as above

### Option 3: Heroku

1. **Install Heroku CLI:**
```bash
npm install -g heroku
```

2. **Deploy:**
```bash
cd backend
heroku create your-pizza-app-backend
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

3. **Set Environment Variables:**
```bash
heroku config:set MONGODB_URI=your_mongodb_atlas_connection_string
heroku config:set JWT_SECRET=your_super_secret_jwt_key
heroku config:set CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
heroku config:set CLOUDINARY_API_KEY=your_cloudinary_api_key
heroku config:set CLOUDINARY_API_SECRET=your_cloudinary_api_secret
heroku config:set NODE_ENV=production
```

## 🔧 Environment Variables Reference

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pizza-delivery?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000
NODE_ENV=production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
REACT_APP_APP_NAME=Pizza Delivery
REACT_APP_APP_VERSION=1.0.0
```

## 🚀 Post-Deployment Steps

1. **Initialize the System:**
   - Visit: `https://your-backend-url.com/api/admin/initialize`
   - This creates the default admin account and sample pizzas

2. **Default Admin Credentials:**
   - Email: `admin@pizza.com`
   - Password: `admin123`
   - **Change these immediately after first login!**

3. **Test the Application:**
   - Frontend: `https://your-frontend-url.vercel.app`
   - Admin Panel: `https://your-frontend-url.vercel.app/admin`
   - API: `https://your-backend-url.com/api`

## 🔒 Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secret
- [ ] Enable HTTPS (automatic on Vercel/Railway/Render)
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Set up Cloudinary upload restrictions

## 📊 Monitoring & Analytics

### Vercel Analytics
- Enable Vercel Analytics in your project dashboard
- Monitor performance and user behavior

### Backend Monitoring
- Railway/Render/Heroku provide built-in monitoring
- Set up error tracking with services like Sentry

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

## 🆘 Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Update CORS configuration in backend
   - Add your frontend URL to allowed origins

2. **MongoDB Connection:**
   - Check connection string format
   - Verify IP whitelist in MongoDB Atlas

3. **Image Upload Issues:**
   - Verify Cloudinary credentials
   - Check upload preset configuration

4. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Support:
- Check platform-specific documentation
- Review application logs in your deployment platform
- Test locally before deploying

## 🎉 Success!

Your Pizza Delivery Web App is now live and ready to serve customers! 🍕

Remember to:
- Monitor your application regularly
- Keep dependencies updated
- Backup your database regularly
- Test new features in staging before production 