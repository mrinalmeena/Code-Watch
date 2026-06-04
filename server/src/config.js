import { config as loadEnv } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, '..', '..', '.env') });


const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  github: {
    token:         process.env.GITHUB_TOKEN || '',
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || '',
    clientId:      process.env.GITHUB_CLIENT_ID || '',
    clientSecret:  process.env.GITHUB_CLIENT_SECRET || '',
  },

  gitlab: {
    token: process.env.GITLAB_TOKEN || '',
    url: process.env.GITLAB_URL || 'https://gitlab.com',
    webhookSecret: process.env.GITLAB_WEBHOOK_SECRET || '',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },
};

export default config;
