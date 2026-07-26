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
    searchHiringAgencies: builder.query({
      query: (params) => ({
        url: '/artist_app/discover/hiring-agencies',
        params: params,
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
  useSearchHiringAgenciesQuery,
  useLazySearchHiringAgenciesQuery,
  useGetArtistDetailsQuery,
} = discoveryApi;
