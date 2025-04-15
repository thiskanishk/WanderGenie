import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import reducers (only import tripsReducer for now since it's the only one we've created)
import tripsReducer from './slices/tripsSlice';

// Define auth reducer with basic structure
const authInitialState = {
  token: null,
  user: {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  },
  isLoading: false,
  error: null,
};

const authReducer = (state = authInitialState, action: any) => {
  switch (action.type) {
    default:
      return state;
  }
};

// Set up persistence configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'trips'], // Only persist these reducers
};

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  trips: tripsReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for redux-persist
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 