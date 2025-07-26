import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Async thunks
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/orders`, orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create order');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/orders/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch order');
    }
  }
);

export const trackOrder = createAsyncThunk(
  'order/trackOrder',
  async (orderNumber, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/orders/track/${orderNumber}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to track order');
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (filters = {}, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const params = new URLSearchParams();

      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.sort) params.append('sort', filters.sort);

      const response = await axios.get(`${API_URL}/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'order/updateStatus',
  async ({ orderId, status, note }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(`${API_URL}/orders/${orderId}/status`,
        { status, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update order status');
    }
  }
);

export const fetchOrderStats = createAsyncThunk(
  'order/fetchOrderStats',
  async ({ period = '30d' }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/order-stats?period=${period}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch order statistics');
    }
  }
);

const initialState = {
  currentOrder: null,
  orders: [],
  orderStats: null,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    page: 1,
    limit: 10,
    sort: '-createdAt'
  },
  pagination: {
    total: 0,
    pages: 0,
    currentPage: 1
  }
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        page: 1,
        limit: 10,
        sort: '-createdAt'
      };
    },
    setOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(o => o._id === orderId);
      if (order) {
        order.status = status;
      }
      if (state.currentOrder && state.currentOrder._id === orderId) {
        state.currentOrder.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Track Order
      .addCase(trackOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Orders (Admin)
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          pages: action.payload.pages,
          currentPage: action.payload.page
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload.data;

        // Update in orders list
        const index = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }

        // Update current order if it's the same
        if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Order Stats
      .addCase(fetchOrderStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.loading = false;
        state.orderStats = action.payload.data;
      })
      .addCase(fetchOrderStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentOrder,
  setFilters,
  clearFilters,
  setOrderStatus,
} = orderSlice.actions;

// Selectors
export const selectCurrentOrder = (state) => state.order.currentOrder;
export const selectOrders = (state) => state.order.orders;
export const selectOrderStats = (state) => state.order.orderStats;
export const selectOrderLoading = (state) => state.order.loading;
export const selectOrderError = (state) => state.order.error;
export const selectOrderFilters = (state) => state.order.filters;
export const selectOrderPagination = (state) => state.order.pagination;

// Filtered orders selector
export const selectFilteredOrders = (state) => {
  const { orders } = state.order;
  const { status } = state.order.filters;

  if (status === 'all') return orders;
  return orders.filter(order => order.status === status);
};

// Orders by status selectors
export const selectPendingOrders = (state) =>
  state.order.orders.filter(order => order.status === 'Pending');

export const selectPreparingOrders = (state) =>
  state.order.orders.filter(order => order.status === 'Preparing');

export const selectOnTheWayOrders = (state) =>
  state.order.orders.filter(order => order.status === 'On The Way');

export const selectDeliveredOrders = (state) =>
  state.order.orders.filter(order => order.status === 'Delivered');

export default orderSlice.reducer; 