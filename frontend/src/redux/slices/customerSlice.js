import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const registerCustomer = createAsyncThunk(
  'customer/register',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/customer/register`, customerData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

export const loginCustomer = createAsyncThunk(
  'customer/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/customer/login`, credentials);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

export const getCustomerProfile = createAsyncThunk(
  'customer/getProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().customer.token;
      const response = await axios.get(`${API_URL}/customer/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch profile');
    }
  }
);

export const updateCustomerProfile = createAsyncThunk(
  'customer/updateProfile',
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const token = getState().customer.token;
      const response = await axios.put(`${API_URL}/customer/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update profile');
    }
  }
);

export const getCustomerOrders = createAsyncThunk(
  'customer/getOrders',
  async (params, { rejectWithValue, getState }) => {
    try {
      const token = getState().customer.token;
      const response = await axios.get(`${API_URL}/customer/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch orders');
    }
  }
);

export const reorderFromHistory = createAsyncThunk(
  'customer/reorder',
  async (orderId, { rejectWithValue, getState }) => {
    try {
      const token = getState().customer.token;
      const response = await axios.post(`${API_URL}/customer/reorder/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reorder');
    }
  }
);

export const addCustomerAddress = createAsyncThunk(
  'customer/addAddress',
  async (addressData, { rejectWithValue, getState }) => {
    try {
      const token = getState().customer.token;
      const response = await axios.post(`${API_URL}/customer/addresses`, addressData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add address');
    }
  }
);

export const updateCustomerAddress = createAsyncThunk(
  'customer/updateAddress',
  async ({ addressId, addressData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().customer.token;
      const response = await axios.put(`${API_URL}/customer/addresses/${addressId}`, addressData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update address');
    }
  }
);

export const removeCustomerAddress = createAsyncThunk(
  'customer/removeAddress',
  async (addressId, { rejectWithValue, getState }) => {
    try {
      const token = getState().customer.token;
      const response = await axios.delete(`${API_URL}/customer/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { addressId, addresses: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to remove address');
    }
  }
);

const initialState = {
  customer: null,
  token: localStorage.getItem('customerToken'),
  isAuthenticated: false,
  loading: false,
  error: null,
  orders: [],
  ordersLoading: false,
  ordersError: null,
  addresses: [],
  addressesLoading: false,
  addressesError: null
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.ordersError = null;
      state.addressesError = null;
    },
    logout: (state) => {
      state.customer = null;
      state.token = null;
      state.isAuthenticated = false;
      state.orders = [];
      state.addresses = [];
      localStorage.removeItem('customerToken');
    },
    setCustomer: (state, action) => {
      state.customer = action.payload;
      state.isAuthenticated = true;
    },
    updateCustomerData: (state, action) => {
      if (state.customer) {
        state.customer = { ...state.customer, ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload.customer;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('customerToken', action.payload.token);
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload.customer;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.addresses = action.payload.customer.addresses || [];
        localStorage.setItem('customerToken', action.payload.token);
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Profile
      .addCase(getCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload;
        state.addresses = action.payload.addresses || [];
      })
      .addCase(getCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload;
      })
      .addCase(updateCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Orders
      .addCase(getCustomerOrders.pending, (state) => {
        state.ordersLoading = true;
        state.ordersError = null;
      })
      .addCase(getCustomerOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload.orders;
      })
      .addCase(getCustomerOrders.rejected, (state, action) => {
        state.ordersLoading = false;
        state.ordersError = action.payload;
      })
      // Add Address
      .addCase(addCustomerAddress.pending, (state) => {
        state.addressesLoading = true;
        state.addressesError = null;
      })
      .addCase(addCustomerAddress.fulfilled, (state, action) => {
        state.addressesLoading = false;
        state.addresses = action.payload;
        if (state.customer) {
          state.customer.addresses = action.payload;
        }
      })
      .addCase(addCustomerAddress.rejected, (state, action) => {
        state.addressesLoading = false;
        state.addressesError = action.payload;
      })
      // Update Address
      .addCase(updateCustomerAddress.pending, (state) => {
        state.addressesLoading = true;
        state.addressesError = null;
      })
      .addCase(updateCustomerAddress.fulfilled, (state, action) => {
        state.addressesLoading = false;
        state.addresses = action.payload;
        if (state.customer) {
          state.customer.addresses = action.payload;
        }
      })
      .addCase(updateCustomerAddress.rejected, (state, action) => {
        state.addressesLoading = false;
        state.addressesError = action.payload;
      })
      // Remove Address
      .addCase(removeCustomerAddress.pending, (state) => {
        state.addressesLoading = true;
        state.addressesError = null;
      })
      .addCase(removeCustomerAddress.fulfilled, (state, action) => {
        state.addressesLoading = false;
        state.addresses = action.payload.addresses;
        if (state.customer) {
          state.customer.addresses = action.payload.addresses;
        }
      })
      .addCase(removeCustomerAddress.rejected, (state, action) => {
        state.addressesLoading = false;
        state.addressesError = action.payload;
      });
  }
});

export const { clearError, logout, setCustomer, updateCustomerData } = customerSlice.actions;

// Selectors
export const selectCustomer = (state) => state.customer.customer;
export const selectCustomerToken = (state) => state.customer.token;
export const selectCustomerIsAuthenticated = (state) => state.customer.isAuthenticated;
export const selectCustomerLoading = (state) => state.customer.loading;
export const selectCustomerError = (state) => state.customer.error;
export const selectCustomerOrders = (state) => state.customer.orders;
export const selectCustomerOrdersLoading = (state) => state.customer.ordersLoading;
export const selectCustomerOrdersError = (state) => state.customer.ordersError;
export const selectCustomerAddresses = (state) => state.customer.addresses;
export const selectCustomerAddressesLoading = (state) => state.customer.addressesLoading;
export const selectCustomerAddressesError = (state) => state.customer.addressesError;

export default customerSlice.reducer; 