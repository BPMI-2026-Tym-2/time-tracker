import { APIError, createAuthMiddleware, isAPIError } from 'better-auth/api';
import { findUserByEmail } from '../users/user.repository.js';
import { registrationMessages } from './auth.messages.js';
import { validateRegistration } from './auth.service.js';

function emailTakenError() {
  return new APIError('CONFLICT', {
    code: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL',
    message: registrationMessages.emailTaken,
  });
}

export const registrationHooks = {
  before: createAuthMiddleware(async (ctx) => {
    if (ctx.path !== '/sign-up/email') return;

    const result = validateRegistration(ctx.body);
    if (!result.ok) {
      throw new APIError('BAD_REQUEST', {
        code: 'INVALID_REGISTRATION',
        message: result.message,
      });
    }

    return { context: { body: { ...ctx.body, ...result.data } } };
  }),
  after: createAuthMiddleware(async (ctx) => {
    if (ctx.path !== '/sign-up/email') return;

    const result = ctx.context.returned;
    if (!isAPIError(result)) return;
    if (result.body?.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
      return Response.json(emailTakenError().body, { status: 409 });
    }

    // A concurrent signup can pass Better Auth's lookup. Better Auth wraps
    // a database uniqueness error as FAILED_TO_CREATE_USER; confirm the email
    // now exists before translating it, leaving other database errors intact.
    if (
      result.body?.code === 'FAILED_TO_CREATE_USER' &&
      typeof ctx.body?.email === 'string' &&
      (await findUserByEmail(ctx.body.email))
    ) {
      // Return an explicit response: Better Auth otherwise retains the
      // endpoint's original 422 status when an after hook throws an APIError.
      return Response.json(emailTakenError().body, { status: 409 });
    }
  }),
};
