import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const createPaymentOrder = createAsyncThunk(
  'payment/createOrder',
  async ({ orderId, amount }, { rejectWithValue, getState }) => {
    try {
      const token = getState().customer.token;
      const response = await axios.post(`${API_URL}/payments/create-order`, {
        orderId,
        amount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create payment order');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payment/verify',
  async (paymentData, { rejectWithValue, getState }) => {
    try {
      const token = getState().customer.token;
      const response = await axios.post(`${API_URL}/payments/verify`, paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Payment verification failed');
    }
  }
);

export const processRefund = createAsyncThunk(
  'payment/refund',
  async ({ orderId, amount, reason }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_URL}/payments/refund`, {
        orderId,
        amount,
        reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Refund processing failed');
    }
  }
);

const initialState = {
  paymentOrder: null,
  loading: false,
  error: null,
  verificationLoading: false,
  verificationError: null,
  refundLoading: false,
  refundError: null,
  paymentStatus: 'idle', // idle, processing, success, failed
  currentOrder: null
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
      state.verificationError = null;
      state.refundError = null;
    },
    setPaymentOrder: (state, action) => {
      state.paymentOrder = action.payload;
    },
    clearPaymentOrder: (state) => {
      state.paymentOrder = null;
    },
    setPaymentStatus: (state, action) => {
      state.paymentStatus = action.payload;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    resetPaymentState: (state) => {
      state.paymentOrder = null;
      state.loading = false;
      state.error = null;
      state.verificationLoading = false;
      state.verificationError = null;
      state.refundLoading = false;
      state.refundError = null;
      state.paymentStatus = 'idle';
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Payment Order
      .addCase(createPaymentOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.paymentStatus = 'processing';
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentOrder = action.payload;
        state.paymentStatus = 'processing';
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.paymentStatus = 'failed';
      })
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.verificationLoading = true;
        state.verificationError = null;
        state.paymentStatus = 'processing';
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.verificationLoading = false;
        state.paymentStatus = 'success';
        state.paymentOrder = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationError = action.payload;
        state.paymentStatus = 'failed';
      })
      // Process Refund
      .addCase(processRefund.pending, (state) => {
        state.refundLoading = true;
        state.refundError = null;
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.refundLoading = false;
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.refundLoading = false;
        state.refundError = action.payload;
      });
  }
});

export const {
  clearPaymentError,
  setPaymentOrder,
  clearPaymentOrder,
  setPaymentStatus,
  setCurrentOrder,
  clearCurrentOrder,
  resetPaymentState
} = paymentSlice.actions;

// Selectors
export const selectPaymentOrder = (state) => state.payment.paymentOrder;
export const selectPaymentLoading = (state) => state.payment.loading;
export const selectPaymentError = (state) => state.payment.error;
export const selectVerificationLoading = (state) => state.payment.verificationLoading;
export const selectVerificationError = (state) => state.payment.verificationError;
export const selectRefundLoading = (state) => state.payment.refundLoading;
export const selectRefundError = (state) => state.payment.refundError;
export const selectPaymentStatus = (state) => state.payment.paymentStatus;
export const selectCurrentOrder = (state) => state.payment.currentOrder;

export default paymentSlice.reducer; 