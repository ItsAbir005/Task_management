import cron from 'node-cron';
import prisma from '../utils/client.js';
import { emitEvent } from './engine.js';

export const startCronJobs = () => {
  console.log("🚀 Starting Automation Cron Jobs");

  // 1. Task Overdue Checker
  // Checks every 10 minutes
  cron.schedule("*/10 * * * *", async () => {
    try {
      const overdueTasks = await prisma.task.findMany({
        where: {
          dueDate: { lt: new Date() },
          status: { not: "COMPLETED" }
        }
      });

      for (const task of overdueTasks) {
        await emitEvent("TASK_OVERDUE", task, task.tenantId);
      }
    } catch (err) {
      console.error("Cron Error (Task Overdue):", err);
    }
  });

  // 2. Leave Escalation Checker
  // Checks every hour
  cron.schedule("0 * * * *", async () => {
    try {
      const leaves = await prisma.leave.findMany({
        where: {
          status: "PENDING"
        }
      });

      for (const leave of leaves) {
        const days = (leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 3600 * 24);
        // Only escalate if the requested duration is greater than 3 days
        if (days > 3) {
           await emitEvent("LEAVE_LONG_DURATION", leave, leave.tenantId);
        }
      }
    } catch (err) {
      console.error("Cron Error (Leave Escalation):", err);
    }
  });

  // 3. Project Delay Checker
  // Checks every hour
  cron.schedule("0 * * * *", async () => {
    try {
      const projects = await prisma.project.findMany({
        where: {
          deadline: { lt: new Date() },
          status: { not: "COMPLETED" }
        }
      });

      for (const project of projects) {
        await emitEvent("PROJECT_DELAYED", project, project.tenantId);
      }
    } catch (err) {
      console.error("Cron Error (Project Delay):", err);
    }
  });
};
