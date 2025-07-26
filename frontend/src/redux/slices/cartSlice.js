import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { pizza, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.pizza._id === pizza._id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          pizza,
          quantity,
          price: pizza.price
        });
      }

      // Recalculate totals
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    removeFromCart: (state, action) => {
      const pizzaId = action.payload;
      state.items = state.items.filter(item => item.pizza._id !== pizzaId);

      // Recalculate totals
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    updateQuantity: (state, action) => {
      const { pizzaId, quantity } = action.payload;
      const item = state.items.find(item => item.pizza._id === pizzaId);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.pizza._id !== pizzaId);
        } else {
          item.quantity = quantity;
        }

        // Recalculate totals
        state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
    },

    incrementQuantity: (state, action) => {
      const pizzaId = action.payload;
      const item = state.items.find(item => item.pizza._id === pizzaId);

      if (item) {
        item.quantity += 1;
        state.itemCount += 1;
        state.total += item.price;
      }
    },

    decrementQuantity: (state, action) => {
      const pizzaId = action.payload;
      const item = state.items.find(item => item.pizza._id === pizzaId);

      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
          state.itemCount -= 1;
          state.total -= item.price;
        } else {
          // Remove item if quantity becomes 0
          state.items = state.items.filter(item => item.pizza._id !== pizzaId);
          state.itemCount -= 1;
          state.total -= item.price;
        }
      }
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  incrementQuantity,
  decrementQuantity,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartItemCount = (state) => state.cart.itemCount;
export const selectCartIsEmpty = (state) => state.cart.items.length === 0;
export const selectCartOpen = (state) => state.ui.cartOpen;

// Calculate delivery fee and tax
export const selectDeliveryFee = (state) => 2.99;
export const selectTax = (state) => state.cart.total * 0.08; // 8% tax
export const selectGrandTotal = (state) => {
  const subtotal = state.cart.total;
  const deliveryFee = 2.99;
  const tax = subtotal * 0.08;
  return subtotal + deliveryFee + tax;
};

export default cartSlice.reducer; 