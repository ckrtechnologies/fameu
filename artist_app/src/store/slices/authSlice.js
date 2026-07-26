import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as Keychain from 'react-native-keychain';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV();

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        let user = { id: credentials.username };
        const storedUser = storage.getString('auth_user');
        if (storedUser) {
          try {
            user = JSON.parse(storedUser);
          } catch (e) {
            console.error('Failed to parse stored user', e);
          }
        }
        return { token: credentials.password, user };
      }
      return rejectWithValue('No credentials found');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await Keychain.resetGenericPassword();
    } catch (e) {
      console.log('Error clearing keychain', e);
    }
    storage.clearAll();
    return null;
  }
);

const initialState = {
  isAuthenticated: false,
  token: null,
  user: null,
  loading: true, // initial load state
  isBlacklisted: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setBlacklisted: (state, action) => {
      state.isBlacklisted = action.payload;
    },
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = !!token;
      
      // Store asynchronously
      if (token && user) {
        Keychain.setGenericPassword(user.id, token).catch(err => 
          console.error('Failed to save to keychain', err)
        );
        storage.set('auth_user', JSON.stringify(user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.loading = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.loading = false;
      })
      .addCase(logout.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.loading = false;
      });
  },
});

export const { setCredentials, setBlacklisted } = authSlice.actions;
export default authSlice.reducer;
