import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';

import { API_URL_ANDROID, API_URL_IOS } from '@env';

export const BASE_URL = Platform.OS === 'android' 
  ? API_URL_ANDROID 
  : API_URL_IOS;

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: async (headers, { getState }) => {
    // 1. Try to get token from Redux state first (it's instantaneous)
    const token = getState().auth?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
      return headers;
    }

    // 2. Fallback to Keychain if not in state (e.g. initial app load)
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials && credentials.password) {
        headers.set('authorization', `Bearer ${credentials.password}`);
      }
    } catch (error) {
      console.error('Keychain access error', error);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    const { logout } = require('../store/slices/authSlice');
    api.dispatch(logout());
  }
  
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Audition', 'Profile', 'Chat', 'ChatMessages', 'Connections', 'Notifications', 'Comment'],
  endpoints: (builder) => ({}),
});
