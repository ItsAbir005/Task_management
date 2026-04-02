import { Server } from 'socket.io';
import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      io: Server;
      user?: User;
    }
  }
}

declare module 'socket.io' {
  interface Socket {
    user?: User;
  }
}
