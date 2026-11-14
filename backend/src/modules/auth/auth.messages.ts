export const registrationMessages = {
  emptyFields: (fields: string[]) => `Pole ${fields.join(', ')} nesmí být prázdné`,
  invalidEmail: 'Zadaný email je v nesprávném tvaru',
  emailTaken: 'Účet s tímto emailem již existuje',
} as const;

export const registrationFieldLabels = {
  name: 'Jméno',
  surname: 'Příjmení',
  email: 'E-mail',
  password: 'Heslo',
} as const;
