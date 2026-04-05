import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../Controllers/NotificationController.js';
import { AuthenticateMiddleware } from '../middlewares/AuthMiddleware.js';

const router = express.Router();

router.use(AuthenticateMiddleware);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
