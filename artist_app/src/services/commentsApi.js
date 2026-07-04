import { apiSlice } from './apiSlice';

export const commentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query({
      query: ({ type, targetId }) => `/comments/${type}/${targetId}`,
      providesTags: (result, error, { targetId }) => [{ type: 'Comment', id: targetId }],
    }),
    addComment: builder.mutation({
      query: ({ type, targetId, content, parentId }) => ({
        url: `/comments/${type}/${targetId}`,
        method: 'POST',
        body: { content, parentId },
      }),
      invalidatesTags: (result, error, { targetId }) => [{ type: 'Comment', id: targetId }],
    }),
    updateComment: builder.mutation({
      query: ({ type, commentId, content, targetId }) => ({
        url: `/comments/${type}/${commentId}`,
        method: 'PUT',
        body: { content },
      }),
      invalidatesTags: (result, error, { targetId }) => [{ type: 'Comment', id: targetId }],
    }),
    deleteComment: builder.mutation({
      query: ({ type, commentId, targetId }) => ({
        url: `/comments/${type}/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { targetId }) => [{ type: 'Comment', id: targetId }],
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentsApi;
