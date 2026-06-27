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

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQuery,
  tagTypes: ['User', 'Audition', 'Profile'],
  endpoints: (builder) => ({}),
});
