import { ROUTES } from './routes';

const linking = {
  prefixes: ['fameuhiring://', 'https://fameu.in/hiring/'],
  config: {
    screens: {
      [ROUTES.DRAWER]: {
        screens: {
          [ROUTES.TABS]: {
            screens: {
              [ROUTES.DASHBOARD]: 'dashboard',
              [ROUTES.MY_AUDITIONS]: 'my-auditions',
              [ROUTES.INBOX]: 'inbox',
              [ROUTES.APPLICANTS]: 'applicants',
              [ROUTES.PROFILE]: 'profile',
            },
          },
        },
      },
      [ROUTES.AUDITION_DETAILS]: 'auditions/:auditionId',
      [ROUTES.ARTIST_PROFILE_SCREEN]: 'artists/:artistId',
      [ROUTES.CHAT_SCREEN]: 'chat/:conversationId',
      [ROUTES.ALL_APPLICANTS]: 'all-applicants',
      [ROUTES.NOTIFICATIONS]: 'notifications',
    },
  },
};

export default linking;
