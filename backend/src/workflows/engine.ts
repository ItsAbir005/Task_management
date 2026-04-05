import prisma from '../utils/client.js';
import { Server } from 'socket.io';
import { NotificationType } from '@prisma/client';

let io: Server | null = null;

export const initWorkflowEngine = (socketServer: Server) => {
  io = socketServer;
};

export async function emitEvent(type: string, payload: any, tenantId: string) {
  try {
    await prisma.eventLog.create({
      data: { type, payload }
    });
    await processRules(type, payload, tenantId);
  } catch (error) {
    console.error(`Workflow Engine Error [emitEvent:${type}]:`, error);
  }
}

async function processRules(eventType: string, payload: any, tenantId: string) {
  // Find all active rules for this tenant and trigger
  const rules = await prisma.automationRule.findMany({
    where: { trigger: eventType, isActive: true, tenantId }
  });

  for (const rule of rules) {
    await executeAction(rule, payload);
  }
}

async function executeAction(rule: any, payload: any) {
  switch (rule.action) {
    case "NOTIFY_MANAGER":
      return notifyManager(payload);
    case "ESCALATE_HR":
      return escalateToHR(payload);
    case "CREATE_MEETING":
      return createMeetingRoom(payload);
    default:
      console.warn(`[Workflow Engine] Unknown action: ${rule.action}`);
  }
}

async function notifyManager(task: any) {
  if (!task.creatorId) return;

  const managerId = task.creatorId;

  await prisma.notification.create({
    data: {
      userId: managerId,
      type: NotificationType.TASK_OVERDUE,
      title: "Task Overdue",
      message: `Task "${task.title}" is overdue.`
    }
  });

  if (io) {
    io.to(managerId).emit("notification", {
      type: "TASK_OVERDUE",
      title: "Task Overdue",
      message: `Task "${task.title}" is overdue.`
    });
  }
}


async function escalateToHR(leave: any) {
  // Find HR for the tenant
  const hrUsers = await prisma.employee.findMany({
    where: { tenantId: leave.tenantId, role: "HR" }
  });

  for (const hr of hrUsers) {
    await prisma.notification.create({
      data: {
        userId: hr.id,
        type: NotificationType.LEAVE_ESCALATION,
        title: "Leave Escalation",
        message: "A leave request exceeds 3 days and requires immediate HR approval."
      }
    });

    if (io) {
      io.to(hr.id).emit("notification", {
        type: "LEAVE_ESCALATION",
        title: "Leave Escalation",
        message: "A leave request exceeds 3 days and requires immediate HR approval."
      });
    }
  }
}


async function createMeetingRoom(project: any) {
  const room = await prisma.room.create({
    data: {
      projectId: project.id,
      name: `${project.name} - Emergency Sync`
    }
  });

  // Notify manager that room has been created
  await prisma.notification.create({
    data: {
      userId: project.managerId,
      type: NotificationType.MEETING_CREATED,
      title: "Urgent Meeting Room Created",
      message: `Project delayed. Join meeting room now. Room: ${room.name}`
    }
  });

  if (io) {
    io.to(project.managerId).emit("notification", {
      type: "MEETING_CREATED",
      title: "Urgent Meeting Room Created",
      message: `Project delayed. Join meeting room now. Room: ${room.name}`
    });
  }
}
