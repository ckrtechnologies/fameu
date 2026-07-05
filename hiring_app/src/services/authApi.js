import { apiSlice } from './apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendOtp: builder.mutation({
      query: (credentials) => ({
        url: '/auth/send-otp',
        method: 'POST',
        body: credentials,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (credentials) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: credentials,
      }),
    }),
    setRole: builder.mutation({
      query: (roleData) => ({
        url: '/auth/set-role',
        method: 'POST',
        body: roleData,
      }),
    }),
    deleteAccount: builder.mutation({
      query: () => ({
        url: '/auth/delete-account',
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useSetRoleMutation,
  useDeleteAccountMutation,
} = authApi;
