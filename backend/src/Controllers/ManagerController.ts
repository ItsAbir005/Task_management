import { asyncHandler } from "../utils/AsyncHandler.js";
import prisma from "../utils/client.js";

//-----------------------------------------------------Get Manager Projects-----------------------------------------------------//

export const getManagerProjects = asyncHandler(async (req, res, next) => {
    const { tenantId, employeeId } = req;

    if (!tenantId || !employeeId) {
        return res.status(400).json({ message: "tenantId and employeeId are required" });
    }

    const projects = await prisma.project.findMany({
        where: {
            tenantId,
            managerId: employeeId
        },
        include: {
            members: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    res.status(200).json({ success: true, projects });
});

//-----------------------------------------------------Update Project Status-----------------------------------------------------//

export const updateProjectStatus = asyncHandler(async (req, res, next) => {
    const { tenantId, employeeId } = req;
    const { projectId } = req.params;
    const { status } = req.body;

    if (!tenantId || !employeeId || !projectId || !status) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Ensure the project belongs to this manager
    const projectInfo = await prisma.project.findFirst({
        where: { id: projectId, tenantId, managerId: employeeId }
    });

    if (!projectInfo) {
        return res.status(403).json({ message: "Project not found or unauthorized to update" });
    }

    const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: { status },
        include: {
            members: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true
                }
            }
        }
    });

    res.status(200).json({ success: true, message: "Project status updated", project: updatedProject });
});

//-----------------------------------------------------Get Manager Dashboard Stats-----------------------------------------------------//

export const getManagerDashboardStats = asyncHandler(async (req, res, next) => {
    const { tenantId, employeeId } = req;

    if (!tenantId || !employeeId) {
        return res.status(400).json({ message: "tenantId and employeeId are required" });
    }

    // 1. Total Projects Managed
    const totalProjects = await prisma.project.count({
        where: { tenantId, managerId: employeeId }
    });

    // 2. Completed Projects
    const completedProjects = await prisma.project.count({
        where: { tenantId, managerId: employeeId, status: 'COMPLETED' }
    });

    // 3. Unique Team Members
    const projectsWithMembers = await prisma.project.findMany({
        where: { tenantId, managerId: employeeId },
        select: { members: { select: { id: true } } }
    });
    const uniqueMemberIds = new Set();
    projectsWithMembers.forEach(proj => {
        proj.members.forEach(member => uniqueMemberIds.add(member.id));
    });
    const teamMembersCount = uniqueMemberIds.size;

    // 4. Pending Leave Requests (where managerStatus is PENDING)
    const pendingLeaves = await prisma.leave.count({
        where: { tenantId, managerId: employeeId, managerStatus: 'PENDING' }
    });

    // 5. Chart Data (Projects grouped by Status)
    const projectStatusCounts = await prisma.project.groupBy({
        by: ['status'],
        where: { tenantId, managerId: employeeId },
        _count: { status: true }
    });

    let projectChartData = [];
    if (projectStatusCounts.length > 0) {
        projectChartData = projectStatusCounts.map(item => ({
            name: item.status,
            value: item._count.status
        }));
    } else {
        projectChartData = [
            { name: "ONGOING", value: 0 },
            { name: "COMPLETED", value: 0 },
            { name: "PENDING", value: 0 },
            { name: "CANCELLED", value: 0 }
        ];
    }

    // 6. Recent Leave Requests Feed
    const recentLeaves = await prisma.leave.findMany({
        where: { tenantId, managerId: employeeId },
        take: 5,
        orderBy: { appliedAt: 'desc' },
        include: {
            employee: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true
                }
            }
        }
    });

    const recentLeavesFormatted = recentLeaves.map(leave => ({
        id: leave.id,
        firstName: leave.employee.firstName,
        lastName: leave.employee.lastName,
        email: leave.employee.email,
        type: leave.type,
        startDate: leave.startDate,
        endDate: leave.endDate,
        appliedAt: leave.appliedAt,
        status: leave.managerStatus // showing manager's decision status
    }));

    res.status(200).json({
        success: true,
        stats: {
            totalProjects,
            completedProjects,
            teamMembersCount,
            pendingLeaves
        },
        chartData: projectChartData,
        recentActivity: recentLeavesFormatted
    });
});

//-----------------------------------------------------Get Manager Leaves-----------------------------------------------------//

export const getManagerLeaves = asyncHandler(async (req, res, next) => {
    const { tenantId, employeeId } = req;

    if (!tenantId || !employeeId) {
        return res.status(400).json({ message: "tenantId and employeeId are required" });
    }

    const leaves = await prisma.leave.findMany({
        where: {
            tenantId,
            managerId: employeeId
        },
        orderBy: { appliedAt: 'desc' },
        include: {
            employee: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    department: { select: { name: true } }
                }
            }
        }
    });

    res.status(200).json({ success: true, leaves });
});

//-----------------------------------------------------Update Manager Leave Status-----------------------------------------------------//

export const updateManagerLeaveStatus = asyncHandler(async (req, res, next) => {
    const { tenantId, employeeId } = req;
    const { leaveId, managerStatus } = req.body;

    if (!leaveId || !managerStatus) {
        return res.status(400).json({ message: "leaveId and managerStatus are required" });
    }

    const validStatuses = ['APPROVED', 'REJECTED'];
    if (!validStatuses.includes(managerStatus)) {
        return res.status(400).json({ message: "managerStatus must be APPROVED or REJECTED" });
    }

    // Verify this leave belongs to this manager
    const existingLeave = await prisma.leave.findFirst({
        where: { id: leaveId, tenantId, managerId: employeeId }
    });

    if (!existingLeave) {
        return res.status(403).json({ message: "Leave not found or unauthorized" });
    }

    // If Manager REJECTS → global status becomes REJECTED immediately
    // If Manager APPROVES → pass it to HR (global status remains PENDING)
    const globalStatus = managerStatus === 'REJECTED' ? 'REJECTED' : 'PENDING';

    const updatedLeave = await prisma.leave.update({
        where: { id: leaveId },
        data: {
            managerStatus,
            status: globalStatus
        },
        include: {
            employee: {
                select: { firstName: true, lastName: true, email: true }
            }
        }
    });

    // Emit real-time notification to the employee
    const notification = await prisma.notification.create({
        data: {
            userId: updatedLeave.employeeId,
            title: "Leave Status Updated",
            message: `Your leave request has been ${managerStatus === 'APPROVED' ? 'approved by your Manager. Awaiting HR final approval.' : 'rejected by your Manager.'}`,
            type: "LEAVE"
        }
    });

    req.io.to(updatedLeave.employeeId).emit("leave-updated", { leave: updatedLeave, notification });

    res.status(200).json({ success: true, message: `Leave ${managerStatus} by Manager`, leave: updatedLeave });
});

//-----------------------------------------------------Get Manager Tasks-----------------------------------------------------//

export const getManagerTasks = asyncHandler(async (req, res, next) => {
    const { tenantId, employeeId } = req;

    if (!tenantId || !employeeId) {
        return res.status(400).json({ message: "tenantId and employeeId are required" });
    }

    const tasks = await prisma.task.findMany({
        where: {
            tenantId,
            creatorId: employeeId
        },
        include: {
            assignee: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    res.status(200).json({ success: true, tasks });
});

//-----------------------------------------------------Create Task-----------------------------------------------------//

export const createTask = asyncHandler(async (req, res, next) => {
    const { tenantId, employeeId } = req;
    const { title, description, priority, assigneeId } = req.body;

    if (!title || !assigneeId) {
        return res.status(400).json({ message: "Title and Assignee are required" });
    }

    const task = await prisma.task.create({
        data: {
            title,
            description,
            priority,
            assigneeId,
            creatorId: employeeId,
            tenantId
        },
        include: {
            assignee: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                }
            }
        }
    });

    // Notify the assignee
    await prisma.notification.create({
        data: {
            userId: assigneeId,
            title: "New Task Assigned",
            message: `You have been assigned a new task: ${title}`,
            type: "TASK"
        }
    });

    if (req.io) {
        req.io.to(assigneeId).emit("task-assigned", { task });
    }

    res.status(201).json({ success: true, message: "Task created successfully", task });
});

//-----------------------------------------------------Update Task Status-----------------------------------------------------//

export const updateTaskStatus = asyncHandler(async (req, res, next) => {
    const { tenantId, employeeId } = req;
    const { taskId } = req.params;
    const { status, priority, title, description } = req.body;

    // Verify task ownership or authorization (Only creator can update details, but ANYONE (assignee/creator) can update status?)
    // Typically, only the assignee or creator can update status.
    const existingTask = await prisma.task.findFirst({
        where: { id: taskId, tenantId }
    });

    if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
    }

    // Role check: Only creator or assignee can update
    if (existingTask.creatorId !== employeeId && existingTask.assigneeId !== employeeId) {
        return res.status(403).json({ message: "Unauthorized to update this task" });
    }

    const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
            status,
            priority,
            title,
            description
        },
        include: {
            assignee: {
                select: { id: true, firstName: true, lastName: true, email: true }
            }
        }
    });

    res.status(200).json({ success: true, message: "Task updated successfully", task: updatedTask });
});

//-----------------------------------------------------Delete Task-----------------------------------------------------//

export const deleteTask = asyncHandler(async (req, res, next) => {
    const { tenantId, employeeId } = req;
    const { taskId } = req.params;

    const existingTask = await prisma.task.findFirst({
        where: { id: taskId, tenantId, creatorId: employeeId }
    });

    if (!existingTask) {
        return res.status(404).json({ message: "Task not found or unauthorized to delete" });
    }

    await prisma.task.delete({
        where: { id: taskId }
    });

    res.status(200).json({ success: true, message: "Task deleted successfully" });
});
