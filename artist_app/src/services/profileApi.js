import { apiSlice } from './apiSlice';

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfessions: builder.query({
      query: () => '/professions',
      providesTags: ['Profile'],
    }),
    getProfile: builder.query({
      query: () => '/artist_app/profile/',
      providesTags: ['Profile'],
    }),
    getProfileVisitors: builder.query({
      query: () => '/connections/profile/visitors',
      providesTags: ['ProfileVisitors'],
    }),
    upsertProfile: builder.mutation({
      query: (profileData) => ({
        url: '/artist_app/profile/upsert',
        method: 'POST',
        body: profileData,
      }),
      invalidatesTags: ['Profile'],
    }),
    updateCategory: builder.mutation({
      query: (categoryData) => ({
        url: '/artist_app/profile/category',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Profile'],
    }),
    uploadMedia: builder.mutation({
      queryFn: async (formData, api) => {
        try {
          const token = api.getState().auth?.token;
          const { BASE_URL } = require('./apiSlice');
          const response = await fetch(`${BASE_URL}/artist_app/profile/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          const data = await response.json();
          if (!response.ok) {
            return { error: data };
          }
          return { data };
        } catch (error) {
          return { error: { error: error.message || 'Upload failed' } };
        }
      },
      invalidatesTags: ['Profile'],
    }),
    uploadGenericFile: builder.mutation({
      queryFn: async (formData, api) => {
        try {
          const token = api.getState().auth?.token;
          const { BASE_URL } = require('./apiSlice');
          const response = await fetch(`${BASE_URL}/artist_app/profile/upload-file`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          const data = await response.json();
          if (!response.ok) {
            return { error: data };
          }
          return { data };
        } catch (error) {
          return { error: { error: error.message || 'Upload failed' } };
        }
      },
    }),
    checkUsername: builder.query({
      query: (username) => `/artist_app/profile/check-username/${username}`,
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetProfileQuery,
  useGetProfileVisitorsQuery,
  useGetProfessionsQuery,
  useUpsertProfileMutation,
  useUpdateCategoryMutation,
  useUploadMediaMutation,
  useUploadGenericFileMutation,
  useLazyCheckUsernameQuery,
} = profileApi;
