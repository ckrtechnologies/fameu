import { apiSlice } from './apiSlice';

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInbox: builder.query({
      query: () => '/chat',
      providesTags: ['Chat'],
    }),
    getMessages: builder.query({
      query: (conversationId) => `/chat/${conversationId}/messages`,
      providesTags: (result, error, id) => [{ type: 'ChatMessages', id }],
    }),
    startConversation: builder.mutation({
      query: (data) => ({
        url: '/chat/start',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Chat'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInboxQuery,
  useGetMessagesQuery,
  useStartConversationMutation,
} = chatApi;
