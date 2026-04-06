import { asyncHandler } from "../utils/AsyncHandler.js";
import prisma from "../utils/client.js";

//-----------------------------------------------------Get Task Comments-----------------------------------------------------//

export const getTaskComments = asyncHandler(async (req, res, next) => {
    const { tenantId, employeeId } = req;
    const taskId = req.params.taskId as string;

    if (!taskId || !tenantId) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify the task belongs to this tenant
    const task = await prisma.task.findFirst({
        where: { id: taskId, tenantId }
    });

    if (!task) {
        return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    const comments = await (prisma as any).taskComment.findMany({
        where: { taskId },
        include: {
            author: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    profilePic: true
                }
            }
        },
        orderBy: { createdAt: "asc" }
    } as any);

    res.status(200).json({ success: true, comments });
});

//-----------------------------------------------------Add Comment with @mentions-----------------------------------------------------//

export const addComment = asyncHandler(async (req, res, next) => {
    const { tenantId, employeeId } = req;
    const taskId = req.params.taskId as string;
    const { content } = req.body;

    if (!taskId || !content?.trim()) {
        return res.status(400).json({ message: "taskId and content are required" });
    }

    // Verify the task belongs to this tenant and the user has access
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            tenantId,
            OR: [
                { assigneeId: employeeId },
                { creatorId: employeeId }
            ]
        },
        include: {
            assignee: { select: { id: true, firstName: true, lastName: true } },
            creator: { select: { id: true, firstName: true, lastName: true } }
        }
    });

    if (!task) {
        return res.status(403).json({ message: "Task not found or you are not authorized to comment" });
    }

    // Parse @mentions: find @FirstName LastName patterns
    // Fetch all employees of the tenant for mention resolution
    const tenantEmployees = await prisma.employee.findMany({
        where: { tenantId },
        select: { id: true, firstName: true, lastName: true }
    });

    const mentionedIds: string[] = [];
    const mentionRegex = /@([A-Za-z]+(?:\s[A-Za-z]+)?)/g;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
        const mentionedName = match[1].toLowerCase().trim();
        const mentionedEmployee = tenantEmployees.find(emp => {
            const fullName = `${emp.firstName} ${emp.lastName || ""}`.toLowerCase().trim();
            const firstName = emp.firstName.toLowerCase();
            return fullName === mentionedName || firstName === mentionedName;
        });
        if (mentionedEmployee && !mentionedIds.includes(mentionedEmployee.id)) {
            mentionedIds.push(mentionedEmployee.id);
        }
    }

    const comment = await (prisma as any).taskComment.create({
        data: {
            taskId,
            authorId: employeeId,
            content: content.trim(),
            mentions: mentionedIds
        },
        include: {
            author: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    profilePic: true
                }
            }
        }
    } as any);

    // Find author's name
    const author = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { firstName: true, lastName: true }
    });
    const authorName = `${author?.firstName || ""} ${author?.lastName || ""}`.trim();

    // Create notifications for each mentioned employee (skip self-mentions)
    const notificationsToCreate = mentionedIds.filter(id => id !== employeeId);
    if (notificationsToCreate.length > 0) {
        await (prisma as any).notification.createMany({
            data: notificationsToCreate.map(mentionedId => ({
                userId: mentionedId,
                tenantId,
                title: "You were mentioned in a comment",
                message: `${authorName} mentioned you in task comments: "${content.slice(0, 80)}${content.length > 80 ? "..." : ""}"`,
                type: "TASK" as const
            }))
        } as any);

        // Real-time mention notification
        if (req.io) {
            notificationsToCreate.forEach(mentionedId => {
                req.io!.to(mentionedId).emit("mention-notification", {
                    taskId,
                    authorName,
                    content,
                    comment
                });
            });
        }
    }

    // Emit comment to the task's room so all viewers get it live
    if (req.io) {
        req.io.to(`task-${taskId}`).emit("comment-added", { comment });
    }

    res.status(201).json({ success: true, comment });
});

//-----------------------------------------------------Delete Comment-----------------------------------------------------//

export const deleteComment = asyncHandler(async (req, res, next) => {
    const { tenantId, employeeId } = req;
    const commentId = req.params.commentId as string;

    const comment = await (prisma as any).taskComment.findFirst({
        where: { id: commentId, authorId: employeeId }
    });

    if (!comment) {
        return res.status(403).json({ message: "Comment not found or you are not the author" });
    }

    await (prisma as any).taskComment.delete({ where: { id: commentId } });

    if (req.io) {
        req.io.to(`task-${comment.taskId}`).emit("comment-deleted", { commentId, taskId: comment.taskId });
    }

    res.status(200).json({ success: true, message: "Comment deleted successfully" });
});
