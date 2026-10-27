import 'dotenv/config';
import express from 'express';

const app = express();
app.use(express.json());

const port = Number(process.env.PORT ?? 3001);
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (_req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
