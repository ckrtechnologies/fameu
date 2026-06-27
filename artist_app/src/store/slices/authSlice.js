import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as Keychain from 'react-native-keychain';

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        // Here we could ideally verify the token, but for now just restore it
        // We will assume the token is in credentials.password and user data might need to be fetched separately,
        // or we store user in AsyncStorage and token in Keychain. 
        // For simplicity, we just restore the token flag.
        return { token: credentials.password, user: { id: credentials.username } };
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
    await Keychain.resetGenericPassword();
    return null;
  }
);

const initialState = {
  isAuthenticated: false,
  token: null,
  user: null,
  loading: true, // initial load state
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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
      });
  },
});

export const { setCredentials } = authSlice.actions;
export default authSlice.reducer;
