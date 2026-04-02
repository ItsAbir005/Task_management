import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    jwt: {
        secret: process.env.JWT_SECRET || 'fallback-secret-for-dev-only',
        expiresIn: '1d',
    },
    db: {
        url: process.env.DATABASE_URL,
    },
    email: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

// Simple validation to ensure essential variables are present in production
if (config.env === 'production') {
    const essential = ['DATABASE_URL', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASSWORD'];
    essential.forEach((key) => {
        if (!process.env[key]) {
            console.warn(`CRITICAL: Environment variable ${key} is missing in production!`);
        }
    });
}

export default config;
