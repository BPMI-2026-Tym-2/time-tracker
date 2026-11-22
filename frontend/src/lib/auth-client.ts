import { createAuthClient } from 'better-auth/react';
import {
  adminClient,
  inferAdditionalFields,
  oneTapClient,
  organizationClient,
} from 'better-auth/client/plugins';

import { publicEnv } from '@/lib/env';

export const authClient = createAuthClient({
  baseURL: `${publicEnv.apiUrl}`,
  basePath: '/api/auth',
  plugins: [
    adminClient(),
    inferAdditionalFields({
      user: {
        surname: {
          type: 'string',
          required: true,
          input: true,
        },
      },
    }),
    oneTapClient({
      clientId: publicEnv.googleClientId,
      // Optional client configuration:
      autoSelect: false,
      cancelOnTapOutside: true,
      context: 'signin',
      additionalOptions: {
        // Any extra options for the Google initialize method
      },
      // Configure prompt behavior and exponential backoff:
      promptOptions: {
        baseDelay: 1000, // Base delay in ms (default: 1000)
        maxAttempts: 5, // Maximum number of attempts before triggering onPromptNotification (default: 5)
      },
    }),
    organizationClient(),
  ],
  fetchOptions: {
    credentials: 'include',
  },
});
