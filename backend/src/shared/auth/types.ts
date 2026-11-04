// Přihlášený uživatel, který volá službu. Naplní ho auth middleware (Better Auth)
export type RequestingUser = {
  id: string;
  role: string;
};

declare module 'express-serve-static-core' {
  interface Request {
    user?: RequestingUser;
  }
}
