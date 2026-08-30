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
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin_panel/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/admin_panel/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Analytics'],
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
    getKYCDocuments: builder.query({
      query: (params = {}) => ({
        url: '/admin_panel/kyc',
        params,
      }),
      providesTags: ['KYC'],
    }),
    getPendingKYC: builder.query({
      query: () => '/admin_panel/kyc/pending',
      providesTags: ['KYC'],
    }),
    updateKYCStatus: builder.mutation({
      query: ({ id, status, rejection_reason }) => ({
        url: `/admin_panel/kyc/${id}/status`,
        method: 'PUT',
        body: { status, rejection_reason },
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
    reactivateAudition: builder.mutation({
      query: (id) => ({
        url: `/admin_panel/auditions/${id}/reactivate`,
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
    deleteFraudReport: builder.mutation({
      query: (id) => ({
        url: `/admin_panel/fraud-reports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FraudReport'],
    }),

    // Notifications (NMS)
    getNotificationHistory: builder.query({
      query: () => '/admin_panel/notifications/history',
      providesTags: ['Notification'],
    }),
    sendNotification: builder.mutation({
      query: (body) => ({
        url: '/admin_panel/notifications/send',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notification'],
    }),

    // Messaging
    getConversations: builder.query({
      query: () => '/admin_panel/conversations',
      providesTags: ['Conversation'],
    }),
    getConversationMessages: builder.query({
      query: (id) => `/admin_panel/conversations/${id}/messages`,
      providesTags: (result, error, id) => [{ type: 'Message', id }],
    }),

    // Support Tickets
    getSupportTickets: builder.query({
      query: () => '/support/tickets',
      providesTags: ['Support'],
    }),
    updateSupportTicketStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/support/tickets/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Support'],
    }),

    // Banners
    getBanners: builder.query({
      query: () => 'banners?all=true',
      providesTags: ['Banner'],
    }),
    createBanner: builder.mutation({
      query: (data) => ({
        url: 'banners',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Banner'],
    }),
    updateBanner: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `banners/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Banner'],
    }),
    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `banners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banner'],
    }),
    uploadBannerImage: builder.mutation({
      query: (formData) => ({
        url: 'banners/upload',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifySessionQuery,
  useGetAnalyticsQuery,
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBlacklistUserMutation,
  useRemoveBlacklistMutation,
  useGetKYCDocumentsQuery,
  useGetPendingKYCQuery,
  useUpdateKYCStatusMutation,
  useGetAuditionsQuery,
  useFlagAuditionMutation,
  useSuspendAuditionMutation,
  useReactivateAuditionMutation,
  useDeleteAuditionMutation,
  useGetApplicationsQuery,
  useGetFraudReportsQuery,
  useResolveFraudReportMutation,
  useDeleteFraudReportMutation,
  useGetNotificationHistoryQuery,
  useSendNotificationMutation,
  useGetConversationsQuery,
  useGetConversationMessagesQuery,
  useGetSupportTicketsQuery,
  useUpdateSupportTicketStatusMutation,
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useUploadBannerImageMutation,
} = adminApi;
