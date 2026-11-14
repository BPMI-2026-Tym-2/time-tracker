import express from 'express';
import { errorHandler } from './shared/errors/error-handler.js';
import { corsMiddleware } from './shared/http/cors.js';
import authRouter from './modules/auth/auth.routes.js';
import organizationRouter from './modules/organizations/organization.routes.js';
import { userRouter } from './modules/users/user.routes.js';
import { requireAuth } from './shared/auth/require-auth.js';

const app = express();
const apiRouter = express.Router();

// Přidání /api prefixu pro všechny endpointy
app.use('/api', apiRouter);

// Tyto endpoity jsou veřejné a nevyžadují autentizaci
apiRouter.use(corsMiddleware);
apiRouter.use('/auth', authRouter);
apiRouter.use(express.json());

// Od tohoto momentu endpointy vyžadují autentizaci (uživatel musí být přihlášen)
apiRouter.use(requireAuth);
apiRouter.use('/organizations', organizationRouter);
apiRouter.use('/users', userRouter);

// Pro přístup k tomuto endpointu je vyžadována role 'admin'
//* apiRouter.get('/admin', requireRole('admin'), asyncHandler(adminController));

apiRouter.use(errorHandler);

export { app };
