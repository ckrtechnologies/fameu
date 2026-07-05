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
      query: (formData) => ({
        url: '/artist_app/profile/upload',
        method: 'POST',
        body: formData,
        // FormData is used, RTK Query will automatically set the correct headers (e.g. multipart/form-data)
      }),
      invalidatesTags: ['Profile'],
    }),
    checkUsername: builder.query({
      query: (username) => `/artist_app/profile/check-username/${username}`,
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetProfessionsQuery,
  useUpsertProfileMutation,
  useUpdateCategoryMutation,
  useUploadMediaMutation,
  useLazyCheckUsernameQuery,
} = profileApi;
