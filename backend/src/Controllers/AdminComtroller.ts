import { asyncHandler } from "../utils/AsyncHandler.js";
import prisma from "../utils/client.js";
import ApiError from "../utils/ApiError.js";


//-------------------------------------Add Department-----------------------------------//

export const addDepartment = asyncHandler(async (req, res, next) => {
    const { name } = req.body;
    const tenantId = req.tenantId;

    const department = await prisma.department.create({
        data: {
            name,
            tenant: {
                connect: { id: tenantId }
            }
        }
    });

    res.status(201).json({
        success: true,
        message: "Department added successfully",
        department
    });
    
})


//----------------------------------------------Get Department------------------------------------//

export const getDepartment = asyncHandler(async (req, res, next) => {
    const tenantId = req.tenantId;
    const departments = await prisma.department.findMany({
        where: {
            tenantId
        },
        include: {
            employees: {
            where: {
              status: "ACTIVE",
            },
                select: {
                    id: true,
                    firstName : true,
                    email : true,
                    role : true
                }
            }
        }
    });
    res.status(200).json({
        success: true,
        departments
    });
});



//--------------------------------------------------------Get Employee------------------------------------//

export const getEmployee = asyncHandler(async (req, res, next) => {
  const tenantId = req.tenantId;

  const employee = await prisma.tenant.findUnique({
    where: {
      id: tenantId,
    },
    include: {
      employees: {
        where: {
          status: "ACTIVE",
        },
        include: {
          department: true, 
        },
      },
    },
  });

  res.json({
    success: true,
    employees: employee?.employees ?? [],
  });
});

//--------------------------------------------------------Update Employee------------------------------------//

export const updateEmployee = asyncHandler(async (req, res, next) => {
    const tenantId = req.tenantId;
    const employeeId = req.params.employeeId as string;
    const { salary, status } = req.body;

    const dataToUpdate: any = {};
    if (salary !== undefined) dataToUpdate.salary = parseFloat(salary);
    if (status !== undefined) dataToUpdate.status = status;

    const updatedEmployee = await prisma.employee.updateMany({
        where: { id: employeeId, tenantId },
        data: dataToUpdate
    });

    res.status(200).json({ success: true, updatedEmployee });
});

//--------------------------------------------------------Delete Department------------------------------------//


//-------------------------------------Add Projects-----------------------------------//


export const addProject = asyncHandler(async (req, res, next) => {
  const { name, client, status, managerId, deadline, memberIds } = req.body;

  const tenantId = req.tenantId;
  if (!tenantId) {
    return next(new ApiError(400, "Tenant ID missing in request"));
  }

 const project = await prisma.project.create({
  data: {
    name,
    client,
    status,
    deadline: deadline ? new Date(deadline) : null,
    tenant: { connect: { id: tenantId } },
    manager: { connect: { id: managerId } },
    members: {
      connect: (memberIds as string[] | undefined)?.map((id: string) => ({ id })) || [],
    },
  },
  include: {
    manager: { select: { id: true, firstName: true, lastName: true, email: true } },
    members: { select: { id: true, firstName: true, lastName: true, email: true } },
  },
});


  return res.status(201).json({
    message: "Project created successfully",
    project,
  });
});


//-------------------------------------Get Projects-----------------------------------//

export const getProject = asyncHandler(async (req, res, next) => {
  const tenantId = req.tenantId;

  const projects = await prisma.project.findMany({
    where: { tenantId },
    include: {
      manager: {
        select: { firstName: true, lastName: true, email: true }
      },
      members: {
        select: { firstName: true, lastName: true, email: true }
      },
    }
  });

  res.status(200).json({
    success: true,
    projects
  });
});


//-------------------------------------Delete Projects-----------------------------------//

export const deleteProject = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId as string;
  await prisma.project.delete({
    where: { id: projectId }
  })
  res.status(200).json({
    success: true,
    message: "Project deleted successfully"
  })
  
})



//-------------------------------------Admin Dashboard Stats-----------------------------------//

export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const tenantId = req.tenantId;

  // Counts
   const employeeCount = await prisma.employee.count({ where: { tenantId, status: { not: "TERMINATED" } } });
  const departmentCount = await prisma.department.count({ where: { tenantId } });
  const projectCount = await prisma.project.count({ where: { tenantId } });
  const pendingLeaveCount = await prisma.leave.count({ 
      where: { 
          tenantId,
          status: 'PENDING',
          employee: { status: { not: "TERMINATED" } }
      } 
  });

  // Department distribution for charts
  const departmentStats = await prisma.department.findMany({
      where: { tenantId },
      include: {
          _count: {
                select: {
                  employees: { where: { status: { not: "TERMINATED" } } }
                }
          }
      }
  });

  const chartData = departmentStats.map(dept => ({
      name: dept.name,
      value: dept._count.employees
  }));

  // Recent Employees (Activity)
  const recentEmployees = await prisma.employee.findMany({
      where: { tenantId, status: { not: "TERMINATED" } },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
          firstName: true,
          email: true,
          role: true,
          createdAt: true
      }
  });

  res.status(200).json({
      success: true,
      stats: {
          totalEmployees: employeeCount,
          totalDepartments: departmentCount,
          totalProjects: projectCount,
          pendingLeaves: pendingLeaveCount
      },
      chartData,
      recentActivity: recentEmployees
  });
});