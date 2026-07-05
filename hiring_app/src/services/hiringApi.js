import { apiSlice } from './apiSlice';

export const hiringApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCompanyProfile: builder.query({
      query: (userId) => '/hiring_app/company',
      providesTags: ['Profile'],
    }),
    getDashboardData: builder.query({
      query: () => '/hiring_app/dashboard',
      providesTags: ['Profile', 'Auditions', 'Applications', 'Dashboard'],
    }),
    upsertCompanyProfile: builder.mutation({
      query: (profileData) => ({
        url: '/hiring_app/company/upsert',
        method: 'POST',
        body: profileData,
      }),
      invalidatesTags: ['Profile'],
    }),
    uploadLogo: builder.mutation({
      query: (formData) => ({
        url: '/hiring_app/company/logo',
        method: 'POST',
        body: formData,
        // Let the browser/fetch automatically set Content-Type for FormData
      }),
      invalidatesTags: ['Profile'],
    }),
    uploadKycDocs: builder.mutation({
      query: (formData) => ({
        url: '/hiring_app/company/kyc',
        method: 'POST',
        body: formData,
        // Let the browser/fetch automatically set Content-Type for FormData
      }),
      invalidatesTags: ['Profile'],
    }),
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetCompanyProfileQuery,
  useUpsertCompanyProfileMutation,
  useUploadLogoMutation,
  useUploadKycDocsMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetDashboardDataQuery,
} = hiringApi;
