import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: false,
  cartOpen: false,
  modalOpen: false,
  modalType: null,
  modalData: null,
  theme: 'light',
  notifications: [],
  loadingStates: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openSidebar: (state) => {
      state.sidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.sidebarOpen = false;
    },
    toggleCart: (state) => {
      state.cartOpen = !state.cartOpen;
    },
    openCart: (state) => {
      state.cartOpen = true;
    },
    closeCart: (state) => {
      state.cartOpen = false;
    },
    openModal: (state, action) => {
      state.modalOpen = true;
      state.modalType = action.payload.type;
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.modalOpen = false;
      state.modalType = null;
      state.modalData = null;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setLoadingState: (state, action) => {
      const { key, isLoading } = action.payload;
      state.loadingStates[key] = isLoading;
    },
    clearLoadingState: (state, action) => {
      delete state.loadingStates[action.payload];
    },
    clearAllLoadingStates: (state) => {
      state.loadingStates = {};
    },
  },
});

export const {
  toggleSidebar,
  openSidebar,
  closeSidebar,
  toggleCart,
  openCart,
  closeCart,
  openModal,
  closeModal,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  setLoadingState,
  clearLoadingState,
  clearAllLoadingStates,
} = uiSlice.actions;

// Selectors
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectCartOpen = (state) => state.ui.cartOpen;
export const selectModalOpen = (state) => state.ui.modalOpen;
export const selectModalType = (state) => state.ui.modalType;
export const selectModalData = (state) => state.ui.modalData;
export const selectTheme = (state) => state.ui.theme;
export const selectNotifications = (state) => state.ui.notifications;
export const selectLoadingStates = (state) => state.ui.loadingStates;

// Helper selector to check if any specific loading state is active
export const selectIsLoading = (key) => (state) => state.ui.loadingStates[key] || false;

export default uiSlice.reducer; 