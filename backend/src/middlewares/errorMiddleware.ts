import ApiError from '../utils/ApiError.js';
import config from '../config/config.js';

const errorMiddleware = (err, req, res, next) => {
    let { statusCode, message } = err;

    // If error is not an instance of ApiError, it's likely a generic Error or Prisma Error
    if (!(err instanceof ApiError)) {
        statusCode = err.statusCode || 500;
        message = err.message || 'Internal Server Error';
    }

    // Prisma Error Handling
    if (err.code === 'P2002') {
        statusCode = 400;
        message = `Duplicate field value: ${err.meta.target}`;
    } else if (err.code === 'P2025') {
        statusCode = 404;
        message = 'Record not found';
    }

    res.locals.errorMessage = err.message;

    const response = {
        success: false,
        message,
        ...(config.env === 'development' && { stack: err.stack }),
    };

    if (config.env === 'development') {
        console.error('ERROR 💥:', err);
    }

    res.status(statusCode).json(response);
};

export default errorMiddleware;
