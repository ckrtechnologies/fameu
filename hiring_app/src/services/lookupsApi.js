import { apiSlice } from './apiSlice';

export const lookupsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMasterLookups: builder.query({
      query: () => '/lookups',
      transformResponse: (response) => response?.data,
    }),
    getCities: builder.query({
      query: () => '/lookups/indian_cities',
      transformResponse: (response) => response?.data,
    }),
  }),
});

export const {
  useGetMasterLookupsQuery,
  useGetCitiesQuery,
} = lookupsApi;
