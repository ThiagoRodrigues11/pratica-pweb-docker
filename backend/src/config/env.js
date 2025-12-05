import dotenv from 'dotenv';

dotenv.config();

const required = (value, name) => {
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
};

const cacheHost = process.env.CACHE_HOST || 'localhost';
const cachePort = parseInt(process.env.CACHE_PORT || '6379', 10);
const cachePassword = process.env.CACHE_PASSWORD;

const cache = {
  driver: process.env.CACHE_DRIVER || 'redis',
  host: cacheHost,
  port: cachePort,
  password: cachePassword,
  ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10),
  namespace: process.env.CACHE_NAMESPACE || 'todoapp',
  url: cachePassword
    ? `redis://:${cachePassword}@${cacheHost}:${cachePort}`
    : `redis://${cacheHost}:${cachePort}`,
};

const storageDriver = process.env.STORAGE_DRIVER || 'supabase';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET;

if (storageDriver === 'supabase') {
  required(supabaseUrl, 'SUPABASE_URL');
  required(supabaseKey, 'SUPABASE_KEY');
  required(supabaseBucket, 'SUPABASE_BUCKET');
}

const storage = {
  driver: storageDriver,
  supabaseUrl,
  supabaseKey,
  supabaseBucket,
};

const jwt = {
  secret: required(process.env.JWT_SECRET, 'JWT_SECRET'),
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE,
};

const app = {
  port: parseInt(process.env.PORT || '3000', 10),
};

export const env = {
  cache,
  storage,
  jwt,
  app,
};

export default env;
