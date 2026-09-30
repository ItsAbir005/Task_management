import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import config from '../config/config.js';

declare global {
    var prisma: PrismaClient | undefined;
}

const adapter = new PrismaNeon({
    connectionString: config.db.url!,
});

const prisma = global.prisma || new PrismaClient({
    adapter,
    log: config.env === 'development' ? ['query', 'info', 'warn', 'error'] : ['error', 'warn'],
});

if (config.env !== 'production') {
    global.prisma = prisma;
}

export default prisma;
