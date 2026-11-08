import { findUserByEmail } from '../users/user.repository.js';
import { registrationFieldLabels, registrationMessages } from './auth.messages.js';
import { registrationEmailSchema } from './auth.schemas.js';
import type { RegistrationResult } from './auth.types.js';

// Kontroly registrace e-mailem a heslem.
// Délku hesla kontroluje Better Auth.

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function validateRegistration(body: unknown): RegistrationResult {
  const input = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const name = readString(input.name).trim();
  const surname = readString(input.surname).trim();
  const email = readString(input.email).trim();
  const password = readString(input.password);

  const values = { name, surname, email, password: password.trim() };
  const emptyFields = (Object.keys(values) as (keyof typeof values)[])
    .filter((field) => values[field] === '')
    .map((field) => registrationFieldLabels[field]);

  if (emptyFields.length > 0) {
    return { ok: false, status: 400, message: registrationMessages.emptyFields(emptyFields) };
  }

  if (!registrationEmailSchema.safeParse(email).success) {
    return { ok: false, status: 400, message: registrationMessages.invalidEmail };
  }

  //ukládá e-mail malými písmeny
  return { ok: true, data: { name, surname, email: email.toLowerCase(), password } };
}

export async function checkRegistration(body: unknown): Promise<RegistrationResult> {
  const result = validateRegistration(body);

  if (result.ok && (await findUserByEmail(result.data.email))) {
    return { ok: false, status: 409, message: registrationMessages.emailTaken };
  }

  return result;
}
