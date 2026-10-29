import type { IncomingHttpHeaders } from 'node:http';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from './auth.config.js';

export function getSession(headers: IncomingHttpHeaders) {
  return auth.api.getSession({
    headers: fromNodeHeaders(headers),
  });
}
