import { apiSlice } from './apiSlice';

export const discoverApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query({
      query: (params) => ({
        url: '/artist_app/discover/feed',
        params,
      }),
      providesTags: ['Audition'],
    }),
    getAuditionDetails: builder.query({
      query: (id) => `/artist_app/discover/${id}`,
      providesTags: (result, error, id) => [{ type: 'Audition', id }],
    }),
    applyToAudition: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/artist_app/discover/${id}/apply`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Audition', id }, 'Audition'],
    }),
    getMyApplications: builder.query({
      query: () => '/artist_app/discover/my-applications/list',
      providesTags: ['Audition'],
    }),
    toggleBookmark: builder.mutation({
      query: (id) => ({
        url: `/artist_app/discover/${id}/bookmark`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Audition', id }],
    }),
    checkIn: builder.mutation({
      query: (id) => ({
        url: `/artist_app/discover/${id}/check-in`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Audition', id }],
    }),
  }),
});

export const {
  useGetFeedQuery,
  useGetAuditionDetailsQuery,
  useApplyToAuditionMutation,
  useGetMyApplicationsQuery,
  useToggleBookmarkMutation,
  useCheckInMutation,
} = discoverApi;
