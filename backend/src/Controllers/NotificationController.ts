import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../utils/client.js';
import ApiError from '../utils/ApiError.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = (req as any).employeeId;
  const tenantId = (req as any).tenantId;

  const notifications = await prisma.notification.findMany({
    where: employeeId ? { userId: employeeId } : { tenantId: tenantId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.status(200).json(notifications);
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = (req as any).employeeId;
  const tenantId = (req as any).tenantId;

  await prisma.notification.updateMany({
    where: employeeId ? { userId: employeeId, read: false } : { tenantId: tenantId, read: false },
    data: { read: true }
  });

  res.status(200).json({ message: "All notifications marked as read" });
});

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const employeeId = (req as any).employeeId;
  const tenantId = (req as any).tenantId;

  const notification = await prisma.notification.findFirst({
    where: employeeId ? { id: id as string, userId: employeeId } : { id: id as string, tenantId: tenantId }
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  const updated = await prisma.notification.update({
    where: { id: id as string },
    data: { read: true }
  });

  res.status(200).json(updated);
});
