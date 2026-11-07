import { z } from 'zod';
import { findUserByEmail } from '../users/user.repository.js';

// Kontroly registrace e-mailem a heslem.
// Délku hesla kontroluje Better Auth.

export const registrationMessages = {
  emptyFields: (fields: string[]) => `Pole ${fields.join(', ')} nesmí být prázdné`,
  invalidEmail: 'Zadaný email je v nesprávném tvaru',
  emailTaken: 'Uživatel s tímto e-mailem je již registrován',
} as const;

const fieldLabels = {
  name: 'Jméno',
  surname: 'Příjmení',
  email: 'E-mail',
  password: 'Heslo',
} as const;

export type RegistrationInput = {
  name: string;
  surname: string;
  email: string;
  password: string;
};

export type RegistrationResult =
  { ok: true; data: RegistrationInput } | { ok: false; status: 400 | 409; message: string };

const emailSchema = z.email();

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
    .map((field) => fieldLabels[field]);

  if (emptyFields.length > 0) {
    return { ok: false, status: 400, message: registrationMessages.emptyFields(emptyFields) };
  }

  if (!emailSchema.safeParse(email).success) {
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
