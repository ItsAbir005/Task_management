import jwt from 'jsonwebtoken';
import config from '../config/config.js';

// Rewriting content to self-contained parsing
export const SocketAuth = (socket, next) => {
    const cookieString = socket.request.headers.cookie;

    if (!cookieString) {
        return next(new Error("Authentication error: No cookies found"));
    }

    // Simple parsing for 'token'
    // cookieString looks like "token=xyz; other=abc"
    const tokenMatch = cookieString.match(/(?:^|;\s*)token=([^;]*)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
        return next(new Error("Authentication error: Token not found"));
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        socket.user = decoded; // Attach user info to socket
        next();
    } catch (err) {
        next(new Error("Authentication error: Invalid token"));
    }
};
