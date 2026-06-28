import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';

import { API_URL_ANDROID, API_URL_IOS } from '@env';

const BASE_URL = Platform.OS === 'android' 
  ? API_URL_ANDROID 
  : API_URL_IOS;

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: async (headers) => {
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
  tagTypes: ['User', 'Audition', 'Profile', 'Chat', 'ChatMessages', 'Connections'],
  endpoints: (builder) => ({}),
});
