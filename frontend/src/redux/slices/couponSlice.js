import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const validateCoupon = createAsyncThunk(
  'coupon/validate',
  async ({ code, subtotal, items }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/coupons/validate`, {
        code,
        subtotal,
        items
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Coupon validation failed');
    }
  }
);

export const getCoupons = createAsyncThunk(
  'coupon/getCoupons',
  async (params, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch coupons');
    }
  }
);

export const createCoupon = createAsyncThunk(
  'coupon/create',
  async (couponData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_URL}/coupons`, couponData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create coupon');
    }
  }
);

export const updateCoupon = createAsyncThunk(
  'coupon/update',
  async ({ id, couponData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(`${API_URL}/coupons/${id}`, couponData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update coupon');
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  'coupon/delete',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`${API_URL}/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete coupon');
    }
  }
);

export const toggleCouponStatus = createAsyncThunk(
  'coupon/toggle',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_URL}/coupons/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to toggle coupon status');
    }
  }
);

export const getCouponStats = createAsyncThunk(
  'coupon/getStats',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/coupons/stats/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch coupon statistics');
    }
  }
);

const initialState = {
  // Customer side
  appliedCoupon: null,
  validationLoading: false,
  validationError: null,

  // Admin side
  coupons: [],
  couponsLoading: false,
  couponsError: null,
  stats: null,
  statsLoading: false,
  statsError: null,

  // CRUD operations
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
  toggleLoading: false,
  toggleError: null
};

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    clearCouponError: (state) => {
      state.validationError = null;
      state.couponsError = null;
      state.statsError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.toggleError = null;
    },
    clearAppliedCoupon: (state) => {
      state.appliedCoupon = null;
    },
    setAppliedCoupon: (state, action) => {
      state.appliedCoupon = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Validate Coupon
      .addCase(validateCoupon.pending, (state) => {
        state.validationLoading = true;
        state.validationError = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.validationLoading = false;
        state.appliedCoupon = action.payload;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.validationLoading = false;
        state.validationError = action.payload;
      })
      // Get Coupons
      .addCase(getCoupons.pending, (state) => {
        state.couponsLoading = true;
        state.couponsError = null;
      })
      .addCase(getCoupons.fulfilled, (state, action) => {
        state.couponsLoading = false;
        state.coupons = action.payload.coupons;
      })
      .addCase(getCoupons.rejected, (state, action) => {
        state.couponsLoading = false;
        state.couponsError = action.payload;
      })
      // Create Coupon
      .addCase(createCoupon.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.createLoading = false;
        state.coupons.unshift(action.payload);
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      // Update Coupon
      .addCase(updateCoupon.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.coupons.findIndex(coupon => coupon._id === action.payload._id);
        if (index !== -1) {
          state.coupons[index] = action.payload;
        }
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // Delete Coupon
      .addCase(deleteCoupon.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.coupons = state.coupons.filter(coupon => coupon._id !== action.payload);
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })
      // Toggle Coupon Status
      .addCase(toggleCouponStatus.pending, (state) => {
        state.toggleLoading = true;
        state.toggleError = null;
      })
      .addCase(toggleCouponStatus.fulfilled, (state, action) => {
        state.toggleLoading = false;
        const index = state.coupons.findIndex(coupon => coupon._id === action.payload.id);
        if (index !== -1) {
          state.coupons[index].isActive = action.payload.isActive;
        }
      })
      .addCase(toggleCouponStatus.rejected, (state, action) => {
        state.toggleLoading = false;
        state.toggleError = action.payload;
      })
      // Get Coupon Stats
      .addCase(getCouponStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getCouponStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(getCouponStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      });
  }
});

export const { clearCouponError, clearAppliedCoupon, setAppliedCoupon } = couponSlice.actions;

// Selectors
export const selectAppliedCoupon = (state) => state.coupon.appliedCoupon;
export const selectValidationLoading = (state) => state.coupon.validationLoading;
export const selectValidationError = (state) => state.coupon.validationError;
export const selectCoupons = (state) => state.coupon.coupons;
export const selectCouponsLoading = (state) => state.coupon.couponsLoading;
export const selectCouponsError = (state) => state.coupon.couponsError;
export const selectCouponStats = (state) => state.coupon.stats;
export const selectStatsLoading = (state) => state.coupon.statsLoading;
export const selectStatsError = (state) => state.coupon.statsError;
export const selectCreateLoading = (state) => state.coupon.createLoading;
export const selectCreateError = (state) => state.coupon.createError;
export const selectUpdateLoading = (state) => state.coupon.updateLoading;
export const selectUpdateError = (state) => state.coupon.updateError;
export const selectDeleteLoading = (state) => state.coupon.deleteLoading;
export const selectDeleteError = (state) => state.coupon.deleteError;
export const selectToggleLoading = (state) => state.coupon.toggleLoading;
export const selectToggleError = (state) => state.coupon.toggleError;

export default couponSlice.reducer; 