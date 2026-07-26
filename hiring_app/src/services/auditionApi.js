import { apiSlice } from './apiSlice';

export const auditionApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    uploadPdf: builder.mutation({
      query: (formData) => ({
        url: '/hiring_app/auditions/upload-pdf',
        method: 'POST',
        body: formData,
      }),
    }),
    uploadThumbnail: builder.mutation({
      query: (formData) => ({
        url: '/hiring_app/auditions/upload-thumbnail',
        method: 'POST',
        body: formData,
      }),
    }),
    createAudition: builder.mutation({
      query: (auditionData) => ({
        url: '/hiring_app/auditions',
        method: 'POST',
        body: auditionData,
      }),
      invalidatesTags: ['Audition', 'Auditions', 'Dashboard'],
    }),
    updateAudition: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/hiring_app/auditions/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Audition', id }, 'Audition', 'Auditions', 'Dashboard'],
    }),
    deleteAudition: builder.mutation({
      query: (id) => ({
        url: `/hiring_app/auditions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Audition', 'Auditions', 'Dashboard'],
    }),
    getMyAuditions: builder.query({
      query: () => '/hiring_app/auditions',
      providesTags: ['Audition'],
    }),
    getAuditionDetails: builder.query({
      query: (id) => `/hiring_app/auditions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Audition', id }],
    }),
    getApplicants: builder.query({
      query: (auditionId) => `/hiring_app/auditions/${auditionId}/applicants`,
      providesTags: (result, error, id) => [{ type: 'Audition', id }],
    }),
    getAllApplicants: builder.query({
      query: () => '/hiring_app/auditions/applicants/all',
      providesTags: ['Audition'],
    }),
    updateApplicationStatus: builder.mutation({
      query: ({ applicationId, status }) => ({
        url: `/hiring_app/auditions/applications/${applicationId}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { auditionId }) => [
        { type: 'Audition', id: auditionId }, 
        'Audition'
      ],
    }),
  }),
});

export const {
  useUploadPdfMutation,
  useUploadThumbnailMutation,
  useCreateAuditionMutation,
  useUpdateAuditionMutation,
  useDeleteAuditionMutation,
  useGetMyAuditionsQuery,
  useGetAuditionDetailsQuery,
  useGetApplicantsQuery,
  useGetAllApplicantsQuery,
  useUpdateApplicationStatusMutation,
} = auditionApi;
