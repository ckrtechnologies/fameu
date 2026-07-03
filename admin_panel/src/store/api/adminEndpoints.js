import { apiSlice } from './apiSlice';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/admin_panel/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    verifySession: builder.query({
      query: () => '/admin_panel/auth/me',
    }),

    // Analytics
    getAnalytics: builder.query({
      query: () => '/admin_panel/analytics',
      providesTags: ['Analytics'],
    }),

    // Users & Blacklist
    getUsers: builder.query({
      query: (role = 'all') => `/admin_panel/users?role=${role}`,
      providesTags: ['User'],
    }),
    getUserDetails: builder.query({
      query: (id) => `/admin_panel/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    blacklistUser: builder.mutation({
      query: (body) => ({
        url: '/admin_panel/blacklist',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    removeBlacklist: builder.mutation({
      query: (id) => ({
        url: `/admin_panel/blacklist/user/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // KYC
    getPendingKYC: builder.query({
      query: () => '/admin_panel/kyc/pending',
      providesTags: ['KYC'],
    }),
    updateKYCStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin_panel/kyc/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['KYC'],
    }),

    // Auditions
    getAuditions: builder.query({
      query: () => '/admin_panel/auditions',
      providesTags: ['Audition'],
    }),
    flagAudition: builder.mutation({
      query: (id) => ({
        url: `/admin_panel/auditions/${id}/flag`,
        method: 'PUT',
      }),
      invalidatesTags: ['Audition'],
    }),
    suspendAudition: builder.mutation({
      query: (id) => ({
        url: `/admin_panel/auditions/${id}/suspend`,
        method: 'PUT',
      }),
      invalidatesTags: ['Audition'],
    }),
    deleteAudition: builder.mutation({
      query: (id) => ({
        url: `/admin_panel/auditions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Audition'],
    }),

    // Applications
    getApplications: builder.query({
      query: () => '/admin_panel/applications',
      providesTags: ['Application'],
    }),

    // Fraud Reports
    getFraudReports: builder.query({
      query: () => '/admin_panel/fraud-reports',
      providesTags: ['FraudReport'],
    }),
    resolveFraudReport: builder.mutation({
      query: ({ id, action_taken }) => ({
        url: `/admin_panel/fraud-reports/${id}/action`,
        method: 'PUT',
        body: { action_taken, status: 'resolved' },
      }),
      invalidatesTags: ['FraudReport'],
    }),

    // Payments
    getPayments: builder.query({
      query: () => '/admin_panel/payments',
      providesTags: ['Payment'],
    }),

    // CMS
    getCMS: builder.query({
      query: () => '/admin_panel/cms',
      providesTags: ['CMS'],
    }),
    updateCMS: builder.mutation({
      query: (body) => ({
        url: '/admin_panel/cms',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['CMS'],
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifySessionQuery,
  useGetAnalyticsQuery,
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useBlacklistUserMutation,
  useRemoveBlacklistMutation,
  useGetPendingKYCQuery,
  useUpdateKYCStatusMutation,
  useGetAuditionsQuery,
  useFlagAuditionMutation,
  useSuspendAuditionMutation,
  useDeleteAuditionMutation,
  useGetApplicationsQuery,
  useGetFraudReportsQuery,
  useResolveFraudReportMutation,
  useGetPaymentsQuery,
  useGetCMSQuery,
  useUpdateCMSMutation,
} = adminApi;
