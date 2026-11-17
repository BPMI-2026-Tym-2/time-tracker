import { APIError } from 'better-auth/api';
import { registerFieldsSchema, type RegisterFieldsSchema } from '@time-tracker/shared';

// Validuje a normalizuje údaje z registrace (jména ořízne, e-mail na malá písmena).
// Při neplatném vstupu vyhazuje APIError s kódem, který vrací Better Auth endpoint.
function parseRegistrationInput(body: unknown): RegisterFieldsSchema {
  const parsed = registerFieldsSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(', ');

    throw new APIError('BAD_REQUEST', { code: 'INVALID_REGISTRATION', message });
  }

  return parsed.data;
}

const authService = {
  parseRegistrationInput,
};

export default authService;
