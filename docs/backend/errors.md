# Chyby a HTTP odpovědi

Mapování chyb na HTTP odpovědi je jen v
`backend/src/shared/errors/error-handler.ts`. Ostatní vrstvy chyby pouze vyhazují.

| Zdroj chyby                             | HTTP status  | Tělo odpovědi                                                         |
| --------------------------------------- | ------------ | --------------------------------------------------------------------- |
| `AppError(message, statusCode)`         | `statusCode` | `{ error: message }`                                                  |
| `APIError` z Better Auth (včetně hooků) | jeho status  | `{ error: message }`; status ≥ 500 se loguje a vrací generická zpráva |
| `ZodError` (neplatný vstup)             | 400          | `{ error: 'Validation error', details: [...] }`                       |
| Cokoli jiného                           | 500          | `{ error: 'Internal server error' }` (detail jen do logu)             |

## Autentizace a autorizace

- `requireAuth` (`shared/auth/require-auth.ts`): chybí session → 401, neplatná globální role → 500.
- `requireOrganizationRole(...roles)` (`shared/auth/require-organization-role.ts`):
  chybí chybí `organizationId` → 400, uživatel není člen nebo nemá povolenou roli → 403.
- `requireRole(...roles)` (`shared/auth/require-role.ts`): globální role, zatím nepoužitá.

## Pravidla

- Nevyhazujte `new Error(...)` z business vrstvy. Použijte `AppError` s explicitním statusem.
- Nevracejte detail vnitřní chyby klientovi. Loguje se jen na serveru.
