/**
 * Environment Configuration
 * Centralized environment variable management
 * Never use process.env directly in application code
 */

import { config } from 'dotenv';
import { z } from 'zod';

// Load .env file
config();

// Environment schema validation
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),
  
  // Server
  PORT: z.string().default('3001').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_URL: z.string().default('http://localhost:3001'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  
  // Auth
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // Optional: AWS
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  
  // Optional: Redis
  REDIS_URL: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default('587').transform(Number),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().default('noreply@dynamicmenu.io'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Parse and validate environment
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

const baseEnv = parsedEnv.data;

// Derived configuration
export const isDevelopment = baseEnv.NODE_ENV === 'development';
export const isProduction = baseEnv.NODE_ENV === 'production';
export const isTest = baseEnv.NODE_ENV === 'test';

// Export env with computed properties
export const env = {
  ...baseEnv,
  isDevelopment,
  isProduction,
  isTest,
};
