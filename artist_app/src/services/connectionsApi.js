import { apiSlice } from './apiSlice';

export const connectionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchUsers: builder.query({
      query: (searchTerm) => `/connections/search/users?q=${searchTerm}`,
      providesTags: ['Connections'],
    }),
    getPublicProfile: builder.query({
      query: (username) => `/connections/profile/${username}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, arg) => [{ type: 'Connections', id: arg }],
    }),
    getFollowers: builder.query({
      query: (userId) => `/connections/${userId}/followers`,
      transformResponse: (res) => res.data,
      providesTags: (result, error, arg) => [{ type: 'Connections', id: 'Followers' }],
    }),
    getFollowing: builder.query({
      query: (userId) => `/connections/${userId}/following`,
      transformResponse: (res) => res.data,
      providesTags: (result, error, arg) => [{ type: 'Connections', id: 'Following' }],
    }),
    followUser: builder.mutation({
      query: (userId) => ({
        url: `/connections/follow/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Connections', id: 'Following' },
        { type: 'Connections', id: arg },
        'Profile'
      ],
    }),
    unfollowUser: builder.mutation({
      query: (userId) => ({
        url: `/connections/unfollow/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Connections', id: 'Following' },
        { type: 'Connections', id: arg },
        'Profile'
      ],
    }),
  }),
});

export const {
  useSearchUsersQuery,
  useLazySearchUsersQuery,
  useGetPublicProfileQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = connectionsApi;
