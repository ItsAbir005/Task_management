import { PrismaClient } from '@prisma/client';
import config from '../config/config.js';

declare global {
    var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
    log: config.env === 'development' ? ['query', 'info', 'warn', 'error'] : ['error', 'warn'],
});

if (config.env !== 'production') {
    global.prisma = prisma;
}

export default prisma;
