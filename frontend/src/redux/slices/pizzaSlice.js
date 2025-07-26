import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Async thunks
export const fetchPizzas = createAsyncThunk(
  'pizza/fetchPizzas',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.popular) params.append('popular', filters.popular);

      const response = await axios.get(`${API_URL}/pizzas?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch pizzas');
    }
  }
);

export const fetchPizzaById = createAsyncThunk(
  'pizza/fetchPizzaById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/pizzas/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch pizza');
    }
  }
);

export const createPizza = createAsyncThunk(
  'pizza/createPizza',
  async (pizzaData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const formData = new FormData();

      Object.keys(pizzaData).forEach(key => {
        if (key === 'toppings' && Array.isArray(pizzaData[key])) {
          formData.append(key, pizzaData[key].join(','));
        } else {
          formData.append(key, pizzaData[key]);
        }
      });

      const response = await axios.post(`${API_URL}/pizzas`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create pizza');
    }
  }
);

export const updatePizza = createAsyncThunk(
  'pizza/updatePizza',
  async ({ id, pizzaData }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const formData = new FormData();

      Object.keys(pizzaData).forEach(key => {
        if (key === 'toppings' && Array.isArray(pizzaData[key])) {
          formData.append(key, pizzaData[key].join(','));
        } else {
          formData.append(key, pizzaData[key]);
        }
      });

      const response = await axios.put(`${API_URL}/pizzas/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update pizza');
    }
  }
);

export const deletePizza = createAsyncThunk(
  'pizza/deletePizza',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      await axios.delete(`${API_URL}/pizzas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete pizza');
    }
  }
);

export const togglePizzaAvailability = createAsyncThunk(
  'pizza/toggleAvailability',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.patch(`${API_URL}/pizzas/${id}/toggle-availability`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to toggle availability');
    }
  }
);

const initialState = {
  pizzas: [],
  currentPizza: null,
  loading: false,
  error: null,
  filters: {
    category: 'all',
    search: '',
    popular: false
  }
};

const pizzaSlice = createSlice({
  name: 'pizza',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: 'all',
        search: '',
        popular: false
      };
    },
    clearCurrentPizza: (state) => {
      state.currentPizza = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Pizzas
      .addCase(fetchPizzas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPizzas.fulfilled, (state, action) => {
        state.loading = false;
        state.pizzas = action.payload.data;
      })
      .addCase(fetchPizzas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Pizza by ID
      .addCase(fetchPizzaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPizzaById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPizza = action.payload.data;
      })
      .addCase(fetchPizzaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Pizza
      .addCase(createPizza.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPizza.fulfilled, (state, action) => {
        state.loading = false;
        state.pizzas.unshift(action.payload.data);
      })
      .addCase(createPizza.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Pizza
      .addCase(updatePizza.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePizza.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pizzas.findIndex(pizza => pizza._id === action.payload.data._id);
        if (index !== -1) {
          state.pizzas[index] = action.payload.data;
        }
        if (state.currentPizza && state.currentPizza._id === action.payload.data._id) {
          state.currentPizza = action.payload.data;
        }
      })
      .addCase(updatePizza.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Pizza
      .addCase(deletePizza.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePizza.fulfilled, (state, action) => {
        state.loading = false;
        state.pizzas = state.pizzas.filter(pizza => pizza._id !== action.payload);
        if (state.currentPizza && state.currentPizza._id === action.payload) {
          state.currentPizza = null;
        }
      })
      .addCase(deletePizza.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Availability
      .addCase(togglePizzaAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(togglePizzaAvailability.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pizzas.findIndex(pizza => pizza._id === action.payload.data._id);
        if (index !== -1) {
          state.pizzas[index] = action.payload.data;
        }
        if (state.currentPizza && state.currentPizza._id === action.payload.data._id) {
          state.currentPizza = action.payload.data;
        }
      })
      .addCase(togglePizzaAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setFilters, clearFilters, clearCurrentPizza } = pizzaSlice.actions;

// Selectors
export const selectPizzas = (state) => state.pizza.pizzas;
export const selectCurrentPizza = (state) => state.pizza.currentPizza;
export const selectPizzaLoading = (state) => state.pizza.loading;
export const selectPizzaError = (state) => state.pizza.error;
export const selectPizzaFilters = (state) => state.pizza.filters;

// Filtered pizzas selector
export const selectFilteredPizzas = (state) => {
  const { pizzas } = state.pizza;
  const { category, search, popular } = state.pizza.filters;

  return pizzas.filter(pizza => {
    const matchesCategory = category === 'all' || pizza.category === category;
    const matchesSearch = !search ||
      pizza.name.toLowerCase().includes(search.toLowerCase()) ||
      pizza.description.toLowerCase().includes(search.toLowerCase());
    const matchesPopular = !popular || pizza.isPopular;

    return matchesCategory && matchesSearch && matchesPopular;
  });
};

// Popular pizzas selector
export const selectPopularPizzas = (state) =>
  state.pizza.pizzas.filter(pizza => pizza.isPopular);

// Available pizzas selector
export const selectAvailablePizzas = (state) =>
  state.pizza.pizzas.filter(pizza => pizza.isAvailable);

export default pizzaSlice.reducer; 