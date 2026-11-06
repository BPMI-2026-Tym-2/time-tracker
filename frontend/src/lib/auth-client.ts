import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields, oneTapClient } from 'better-auth/client/plugins';

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

export const authClient = createAuthClient({
  baseURL: `${apiUrl}/auth`,
  plugins: [
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
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
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
  ],
  fetchOptions: {
    credentials: 'include',
  },
});
