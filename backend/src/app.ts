import express from 'express';
import { errorHandler } from './shared/errors/error-handler.js';
import { corsMiddleware } from './shared/http/cors.js';
import organizationRouter from './modules/organizations/organization.routes.js';
import { userRouter } from './modules/users/user.routes.js';
import { requireAuth } from './shared/auth/require-auth.js';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './config/auth.js';

const app = express();
const apiRouter = express.Router();

// Přidání /api prefixu pro všechny endpointy
app.use('/api', apiRouter);

// Tyto endpoity jsou veřejné a nevyžadují autentizaci
apiRouter.use(corsMiddleware);
apiRouter.all('/auth/*splat', toNodeHandler(auth));
apiRouter.use(express.json());

// Od tohoto momentu endpointy vyžadují autentizaci (uživatel musí být přihlášen)
apiRouter.use(requireAuth);
apiRouter.use('/organizations', organizationRouter);
apiRouter.use('/users', userRouter);

// Pro přístup k tomuto endpointu je vyžadována role 'admin'
//* apiRouter.get('/admin', requireRole('admin'), asyncHandler(adminController));

apiRouter.use(errorHandler);

export { app };
