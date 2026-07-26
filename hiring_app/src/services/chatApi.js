import { apiSlice } from './apiSlice';
import { setConversations } from '../store/slices/chatSlice';

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInbox: builder.query({
      query: () => '/chat',
      providesTags: ['Chat'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setConversations(data.data || data));
        } catch (err) {
          // Pass
        }
      },
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
