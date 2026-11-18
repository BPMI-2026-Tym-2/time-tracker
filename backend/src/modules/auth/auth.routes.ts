import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../../config/auth.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

const authRouter = Router();
// Chyby vyhozené v handleru se předájí do errorHandleru (viz docs/backend/errors.md).
const authHandler = asyncHandler(toNodeHandler(auth));

// Pouze explicitně vyjmenované endpointy Better Auth. Wildcard (/*splat) by zpřístupnil
// i endpointy pluginů (admin, organization), které zatím nemají mít přímý HTTP přístup.
// Nový endpoint přidávejte sem jen po posouzení, že ho aplikace opravdu potřebuje.
authRouter.post('/sign-up/email', authHandler);
authRouter.post('/sign-in/email', authHandler);
authRouter.post('/sign-in/social', authHandler);
authRouter.all('/callback/:id', authHandler);
authRouter.post('/one-tap/callback', authHandler);
authRouter.get('/get-session', authHandler);
authRouter.post('/sign-out', authHandler);
authRouter.get('/error', authHandler);
authRouter.post('/organization/accept-invitation', authHandler);
authRouter.post('/organization/reject-invitation', authHandler);

export default authRouter;
