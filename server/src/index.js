import express from 'express';
import cors from 'cors';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './config.js';
import logger from './utils/logger.js';
import db from './database.js';
import reviewQueue from './services/queue.js';
import { reviewPR } from './services/reviewer.js';
import webhooksRouter from './routes/webhooks.js';
import reviewsRouter from './routes/reviews.js';
import settingsRouter from './routes/settings.js';
import analyticsRouter from './routes/analytics.js';
import authRouter from './routes/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();





app.use('/api/webhooks', express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));


app.use(express.json());


app.use(cors({
  origin: config.isDev ? 'http://localhost:5173' : false,
}));



app.use('/api/webhooks', webhooksRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/auth', authRouter);


app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    queue: reviewQueue.getStatus(),
  });
});




if (!config.isDev) {
  const clientDist = join(__dirname, '..', '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(join(clientDist, 'index.html'));
  });
}



app.use((err, _req, res, _next) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    error: config.isDev ? err.message : 'Internal server error',
  });
});



reviewQueue.on('review', async (data) => {
  await reviewPR(data);
});



app.listen(config.port, () => {
  logger.info(`Server running on http://localhost:${config.port}`, {
    env: config.nodeEnv,
    githubConfigured: !!config.github.token,
    gitlabConfigured: !!config.gitlab.token,
    aiConfigured: !!config.gemini.apiKey,
  });

  logger.info('Webhook endpoints:', {
    github: `http://localhost:${config.port}/api/webhooks/github`,
    gitlab: `http://localhost:${config.port}/api/webhooks/gitlab`,
  });
});

export default app;
