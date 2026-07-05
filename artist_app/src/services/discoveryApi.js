import { apiSlice } from './apiSlice';

export const discoveryApi = apiSlice.injectEndpoints({
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
  }),
});

export const {
  useSearchArtistsQuery,
  useLazySearchArtistsQuery,
  useGetArtistDetailsQuery,
} = discoveryApi;
