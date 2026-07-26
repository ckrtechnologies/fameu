import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Platform } from 'react-native';

import { API_URL_ANDROID, API_URL_IOS } from '@env';

export const BASE_URL = Platform.OS === 'android' 
  ? API_URL_ANDROID 
  : API_URL_IOS;

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: async (headers, { getState }) => {
    // 1. Try to get token from Redux state first
    const token = getState().auth?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error) {
    if (result.error.status === 401) {
      const { logout } = require('../store/slices/authSlice');
      api.dispatch({ type: 'api/resetApiState' }); // Reset API state on 401
      api.dispatch(logout());
    } else if (result.error.status === 403 && result.error.data?.error?.includes('suspended')) {
      const { setBlacklisted } = require('../store/slices/authSlice');
      api.dispatch(setBlacklisted(true));
    }
  }
  
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Audition', 'Auditions', 'Applications', 'Profile', 'Chat', 'ChatMessages', 'Connections', 'Notifications', 'Comment', 'Artists', 'Dashboard'],
  endpoints: (builder) => ({}),
});
