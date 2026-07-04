import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { apiSlice } from '../services/apiSlice';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';

const appReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authReducer,
  chat: chatReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'auth/logout/fulfilled') {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
