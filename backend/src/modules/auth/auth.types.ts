export type RegistrationInput = {
  name: string;
  surname: string;
  email: string;
  password: string;
};

export type RegistrationResult =
  { ok: true; data: RegistrationInput } | { ok: false; status: 400 | 409; message: string };
