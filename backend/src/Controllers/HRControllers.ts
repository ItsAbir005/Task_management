import { asyncHandler } from "../utils/AsyncHandler.js";
import prisma from "../utils/client.js";

//-----------------------------------------------------get Leave Requeste-----------------------------------------------------//

export const getHRLeaves = asyncHandler(async (req, res) => {
    const { tenantId } = req;

    // HR sees leaves where: (manager approved) OR (no manager assigned = direct to HR)
    const leave = await prisma.leave.findMany({
        where: {
            tenantId,
            OR: [
                { managerStatus: 'APPROVED' },
                { managerId: null }
            ]
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
            },
            manager: {
                select: {
                    firstName: true,
                    lastName: true
                }
            }
        }
    });

    res.status(200).json({
        success: true,
        leave
    });
});

//-----------------------------------------------------Update Leave Status-----------------------------------------------------//


export const updateLeaveStatus = asyncHandler(async (req, res) => {
  const { leaveId, hrStatus } = req.body;
  const { tenantId, employeeId } = req;

  if (!leaveId || !hrStatus) {
    return res.status(400).json({ message: "leaveId and hrStatus required" });
  }

  const validStatuses = ['APPROVED', 'REJECTED'];
  if (!validStatuses.includes(hrStatus)) {
    return res.status(400).json({ message: "hrStatus must be APPROVED or REJECTED" });
  }

  // HR decision is FINAL — it sets global status
  const globalStatus = hrStatus === 'APPROVED' ? 'APPROVED' : 'REJECTED';

  const leave = await prisma.leave.update({
    where: {
      id: leaveId,
      tenantId,
    },
    data: {
      hrStatus,
      hrId: employeeId,
      status: globalStatus,
      decisionAt: new Date(),
    },
    include: {
      employee: true,
    },
  });

  // 🔔 CREATE NOTIFICATION
  const notification = await prisma.notification.create({
    data: {
      userId: leave.employeeId,
      title: "Leave Decision Finalized",
      message: `Your leave has been ${globalStatus === 'APPROVED' ? 'fully APPROVED by HR.' : 'REJECTED by HR.'}`,
      type: "LEAVE",
    },
  });

  // ⚡ Emit real-time event
  req.io.to(leave.employeeId).emit("leave-updated", {
    leave,
    notification,
  });

  res.json({ success: true, message: `Leave ${globalStatus} by HR`, leave });
});


//-----------------------------------------------------HR Dashboard Stats-----------------------------------------------------//

export const getHrDashboardStats = asyncHandler(async (req, res, next) => {
  const tenantId = req.tenantId;

  // Counts
  const employeeCount = await prisma.employee.count({ where: { tenantId } });
  const departmentCount = await prisma.department.count({ where: { tenantId } });
  const pendingLeaveCount = await prisma.leave.count({
    where: {
      tenantId,
      status: 'PENDING'
    }
  });
  const approvedLeaveCount = await prisma.leave.count({
    where: {
      tenantId,
      status: 'APPROVED'
    }
  });

  // Chart Data (Leaves grouped by status)
  const leavesStatusCounts = await prisma.leave.groupBy({
    by: ['status'],
    where: { tenantId },
    _count: {
      status: true
    }
  });

  let chartData = [];
  if (leavesStatusCounts.length > 0) {
    chartData = leavesStatusCounts.map(item => ({
      name: item.status,
      value: item._count.status
    }));
  } else {
    chartData = [
      { name: "PENDING", value: 0 },
      { name: "APPROVED", value: 0 },
      { name: "REJECTED", value: 0 },
    ];
  }

  // Recent Leave Requests
  const recentLeaves = await prisma.leave.findMany({
    where: { tenantId },
    take: 5,
    orderBy: { appliedAt: 'desc' },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      }
    }
  });

  const recentActivity = recentLeaves.map(leave => ({
    id: leave.id,
    firstName: leave.employee.firstName,
    lastName: leave.employee.lastName,
    email: leave.employee.email,
    role: leave.employee.role,
    createdAt: leave.appliedAt, // use appliedAt as createdAt for standard interface
    type: leave.type,
    status: leave.status,
  }));

  res.status(200).json({
    success: true,
    stats: {
      totalEmployees: employeeCount,
      totalDepartments: departmentCount,
      pendingLeaves: pendingLeaveCount,
      approvedLeaves: approvedLeaveCount
    },
    chartData,
    recentActivity
  });
});

