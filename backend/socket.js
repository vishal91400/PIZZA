const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? ['https://your-frontend-domain.com']
        : ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        // Allow anonymous connections for public features
        socket.user = null;
        socket.userRole = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role === 'admin') {
        const Admin = require('./models/Admin');
        const user = await Admin.findById(decoded.id).select('-password');
        if (user && user.isActive) {
          socket.user = user;
          socket.userRole = 'admin';
        }
      } else if (decoded.role === 'customer') {
        const Customer = require('./models/Customer');
        const user = await Customer.findById(decoded.id).select('-password');
        if (user && user.isActive) {
          socket.user = user;
          socket.userRole = 'customer';
        }
      }

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.user = null;
      socket.userRole = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join admin room if admin
    if (socket.userRole === 'admin') {
      socket.join('admin-room');
      console.log(`Admin ${socket.user.email} joined admin room`);
    }

    // Join customer room if customer
    if (socket.userRole === 'customer') {
      socket.join(`customer-${socket.user.id}`);
      console.log(`Customer ${socket.user.email} joined customer room`);
    }

    // Handle order tracking subscription
    socket.on('subscribe-to-order', (orderId) => {
      socket.join(`order-${orderId}`);
      console.log(`User ${socket.id} subscribed to order ${orderId}`);
    });

    // Handle order tracking unsubscription
    socket.on('unsubscribe-from-order', (orderId) => {
      socket.leave(`order-${orderId}`);
      console.log(`User ${socket.id} unsubscribed from order ${orderId}`);
    });

    // Handle delivery tracking subscription
    socket.on('subscribe-to-delivery', (orderId) => {
      socket.join(`delivery-${orderId}`);
      console.log(`User ${socket.id} subscribed to delivery ${orderId}`);
    });

    // Handle admin dashboard subscription
    socket.on('subscribe-to-dashboard', () => {
      if (socket.userRole === 'admin') {
        socket.join('admin-dashboard');
        console.log(`Admin ${socket.user.email} subscribed to dashboard updates`);
      }
    });

    // Handle customer notifications subscription
    socket.on('subscribe-to-notifications', () => {
      if (socket.userRole === 'customer') {
        socket.join(`notifications-${socket.user.id}`);
        console.log(`Customer ${socket.user.email} subscribed to notifications`);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Function to emit order status update
const emitOrderStatusUpdate = (orderId, orderData) => {
  if (io) {
    io.to(`order-${orderId}`).emit('order-status-updated', {
      orderId,
      status: orderData.status,
      paymentStatus: orderData.paymentStatus,
      estimatedDeliveryTime: orderData.estimatedDeliveryTime,
      timestamp: new Date()
    });
  }
};

// Function to emit order created notification
const emitOrderCreated = (orderData) => {
  if (io) {
    // Notify admin room
    io.to('admin-room').emit('new-order-created', {
      orderId: orderData._id,
      orderNumber: orderData.orderNumber,
      customer: orderData.customer,
      total: orderData.total,
      timestamp: new Date()
    });

    // Notify specific customer
    io.to(`customer-${orderData.customer.id}`).emit('order-confirmed', {
      orderId: orderData._id,
      orderNumber: orderData.orderNumber,
      status: orderData.status,
      estimatedDeliveryTime: orderData.estimatedDeliveryTime,
      timestamp: new Date()
    });
  }
};

// Function to emit payment status update
const emitPaymentStatusUpdate = (orderId, paymentData) => {
  if (io) {
    io.to(`order-${orderId}`).emit('payment-status-updated', {
      orderId,
      paymentStatus: paymentData.paymentStatus,
      transactionId: paymentData.transactionId,
      timestamp: new Date()
    });
  }
};

// Function to emit delivery update
const emitDeliveryUpdate = (orderId, deliveryData) => {
  if (io) {
    io.to(`delivery-${orderId}`).emit('delivery-updated', {
      orderId,
      status: deliveryData.status,
      estimatedDeliveryTime: deliveryData.estimatedDeliveryTime,
      deliveryBoyLocation: deliveryData.deliveryBoyLocation,
      timestamp: new Date()
    });
  }
};

// Function to emit admin dashboard update
const emitDashboardUpdate = (dashboardData) => {
  if (io) {
    io.to('admin-dashboard').emit('dashboard-updated', {
      ...dashboardData,
      timestamp: new Date()
    });
  }
};

// Function to emit customer notification
const emitCustomerNotification = (customerId, notification) => {
  if (io) {
    io.to(`notifications-${customerId}`).emit('notification', {
      ...notification,
      timestamp: new Date()
    });
  }
};

// Function to emit global notification
const emitGlobalNotification = (notification) => {
  if (io) {
    io.emit('global-notification', {
      ...notification,
      timestamp: new Date()
    });
  }
};

// Function to get connected users count
const getConnectedUsersCount = () => {
  if (io) {
    return io.engine.clientsCount;
  }
  return 0;
};

// Function to get connected admins count
const getConnectedAdminsCount = () => {
  if (io) {
    const adminRoom = io.sockets.adapter.rooms.get('admin-room');
    return adminRoom ? adminRoom.size : 0;
  }
  return 0;
};

module.exports = {
  initializeSocket,
  emitOrderStatusUpdate,
  emitOrderCreated,
  emitPaymentStatusUpdate,
  emitDeliveryUpdate,
  emitDashboardUpdate,
  emitCustomerNotification,
  emitGlobalNotification,
  getConnectedUsersCount,
  getConnectedAdminsCount
}; 