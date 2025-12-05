import { createClient } from 'redis';
import env from './env.js';

const redisClient = createClient({
    url: env.cache.url,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log(`Redis connected on ${env.cache.host}:${env.cache.port}`);
    }
};

export default redisClient;
