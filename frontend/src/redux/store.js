import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import pizzaReducer from './slices/pizzaSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import uiReducer from './slices/uiSlice';
import customerReducer from './slices/customerSlice';
import paymentReducer from './slices/paymentSlice';
import couponReducer from './slices/couponSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart', 'customer']
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);
const persistedCartReducer = persistReducer(persistConfig, cartReducer);
const persistedCustomerReducer = persistReducer(persistConfig, customerReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    pizza: pizzaReducer,
    cart: persistedCartReducer,
    order: orderReducer,
    ui: uiReducer,
    customer: persistedCustomerReducer,
    payment: paymentReducer,
    coupon: couponReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 