import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(token = null) {
    if (this.socket && this.isConnected) {
      return;
    }

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

    this.socket = io(socketUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    // Order status updates
    this.socket.on('order-status-updated', (data) => {
      this.notifyListeners('order-status-updated', data);
    });

    // New order created
    this.socket.on('new-order-created', (data) => {
      this.notifyListeners('new-order-created', data);
    });

    // Order confirmed
    this.socket.on('order-confirmed', (data) => {
      this.notifyListeners('order-confirmed', data);
    });

    // Payment status updates
    this.socket.on('payment-status-updated', (data) => {
      this.notifyListeners('payment-status-updated', data);
    });

    // Delivery updates
    this.socket.on('delivery-updated', (data) => {
      this.notifyListeners('delivery-updated', data);
    });

    // Dashboard updates (admin)
    this.socket.on('dashboard-updated', (data) => {
      this.notifyListeners('dashboard-updated', data);
    });

    // Customer notifications
    this.socket.on('notification', (data) => {
      this.notifyListeners('notification', data);
    });

    // Global notifications
    this.socket.on('global-notification', (data) => {
      this.notifyListeners('global-notification', data);
    });
  }

  // Subscribe to order tracking
  subscribeToOrder(orderId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe-to-order', orderId);
    }
  }

  // Unsubscribe from order tracking
  unsubscribeFromOrder(orderId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('unsubscribe-from-order', orderId);
    }
  }

  // Subscribe to delivery tracking
  subscribeToDelivery(orderId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe-to-delivery', orderId);
    }
  }

  // Subscribe to admin dashboard
  subscribeToDashboard() {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe-to-dashboard');
    }
  }

  // Subscribe to customer notifications
  subscribeToNotifications() {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe-to-notifications');
    }
  }

  // Add event listener
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  // Remove event listener
  removeEventListener(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  // Notify all listeners for an event
  notifyListeners(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // Emit custom event
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService; 