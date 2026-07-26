import { apiSlice } from './apiSlice';

export const discoveryApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    searchArtists: builder.query({
      query: (params) => ({
        url: '/hiring_app/artists/search',
        params: params, // Pass params directly to axios/fetch query params
      }),
      providesTags: ['Profile'],
    }),
    getArtistDetails: builder.query({
      query: (id) => `/hiring_app/artists/${id}`,
      providesTags: ['Profile'],
    }),
    inviteArtist: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/hiring_app/artists/${id}/invite`,
        method: 'POST',
        body,
      }),
    }),
    blockArtist: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/hiring_app/artists/${id}/block`,
        method: 'POST',
        body: { reason },
      }),
    }),
    reportArtist: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/hiring_app/artists/${id}/report`,
        method: 'POST',
        body: { reason },
      }),
    }),
  }),
});

export const {
  useSearchArtistsQuery,
  useLazySearchArtistsQuery,
  useGetArtistDetailsQuery,
  useInviteArtistMutation,
  useBlockArtistMutation,
  useReportArtistMutation,
} = discoveryApi;
