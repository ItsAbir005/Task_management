import { asyncHandler } from "../utils/AsyncHandler.js";
import prisma from "../utils/client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../Services/MailServices.js";
import config from "../config/config.js";

//---------------------------------------------Register Tenant---------------------------------------------//

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, domain } = req.body;


  const tenant = await prisma.tenant.findUnique({
    where: { email }
  });

  if (tenant) {
    return res.status(400).json({ message: "Tenant with this email already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newTenant = await prisma.tenant.create({
    data: {
      name,
      email,
      password: hashedPassword,
      domain
    }
  });

  res.status(201).json({ message: "Tenant registered successfully", tenant: newTenant });
});


//---------------------------------------------Login Tenant---------------------------------------------//

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const tenant = await prisma.tenant.findUnique({
    where: { email }
  })
  if (!tenant) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
  const isMatch = await bcrypt.compare(password, tenant.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign({ tenantId: tenant.id, role: tenant.role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

  res.cookie('token', token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.json({ message: "Login successful", role: tenant.role, tenant, token });
})



//---------------------------------------------Adding Employee By Tenant---------------------------------------------//

export const addEmployee = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, role, salary, departmentId } = req.body;
  const tenantId = req.tenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });

  if (!tenant) {
    return res.status(404).json({ message: "Tenant not found" });
  }

  const existingEmployee = await prisma.employee.findFirst({
    where: { email, tenantId }
  });

  if (existingEmployee) {
    return res.status(400).json({ message: "Employee with this email already exists" });
  }

  // Verify the department belongs to this tenant
  const departmentRecord = await prisma.department.findFirst({
    where: {
      id: departmentId,
      tenantId
    }
  });

  if (!departmentRecord) {
    return res.status(404).json({ message: "Department not found or does not belong to your company" });
  }

  const numericSalary = parseFloat(salary);

  const token = crypto.randomBytes(32).toString("hex");

  const newEmployee = await prisma.employee.create({
    data: {
      firstName,
      lastName,
      email,
      role,
      salary: numericSalary,
      departmentId: departmentRecord.id,
      tenantId: tenant.id,
      setupToken: token,
      setupTokenExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
    include: {
      department: true
    }
  });

  const link = `http://localhost:5173/set-password?token=${token}`;

  await sendEmail(
    newEmployee.email,
    "Welcome to HR Management System",
    `Hello ${newEmployee.firstName},\n\nYour account has been created under the ${departmentRecord.name} department.\nPlease set your password using the link below:\n\n${link}\n\nThis link will expire in 24 hours.`
  );

  return res.json({
    success: true,
    message: "Employee added successfully and verification link sent.",
    employee: newEmployee,
  });

});

//---------------------------------------------------Set Password---------------------------------------------------//

export const setEmployeePassword = asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;

  const employee = await prisma.employee.findFirst({
    where: {
      AND: [
        { setupToken: token },
        { setupTokenExpiry: { gt: new Date() } }
      ]
    }
  });

  if (!employee) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.employee.update({
    where: { id: employee.id },
    data: {
      password: hashedPassword,
      setupToken: null,
      setupTokenExpiry: null,
    }
  });

  res.status(200).json({ message: "Password set successfully" });
});


//------------------------------------------Login------------------------------------------------//

export const employeeLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const employee = await prisma.employee.findUnique({
    where: { email }
  })

  if (!employee) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, employee.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign({ tenantId: employee.tenantId, employeeId: employee.id, role: employee.role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

  res.cookie('token', token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  })

  res.json({ message: "Login successful", role: employee.role, employee, token });
})

//-----------------------------------------Get ME-----------------------------------//

export const getMe = asyncHandler(async (req, res) => {
  const { userRole, tenantId, employeeId } = req;

  let user = null;

  // If Admin/Tenant
  if (tenantId && !employeeId) {
    user = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        domain: true,
      }
    });
  }

  // If Employee
  if (employeeId) {
    user = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        tenantId: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        position: true,
        salary: true,
        dateOfJoining: true,
        employmentType: true,
        status: true,
        department: {
          select: {
            name: true
          }
        }
      }
    });
  }

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    success: true,
    user,
    role: userRole,
  });
});




//------------------------------------------Employee Registration in bulk------------------------------------------------//



export const registerEmployeesBulk = asyncHandler(async (req, res, next) => {
  const { employees } = req.body; // Expecting an array of employees

  if (!employees || !Array.isArray(employees)) {
    return res.status(400).json({
      success: false,
      message: "Employees array is required",
    });
  }

  const tenantId = req.tenantId;
  if (!tenantId) {
    return res.status(401).json({ success: false, message: "Unauthorized: Tenant ID missing" });
  }
  const plainPassword = "123456";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Prepare employees
  const newEmployeeData = employees.map(emp => ({
    email: emp.email,
    firstName: emp.firstName,
    role: emp.role,
    salary: emp.salary,
    departmentId: emp.departmentId,
    tenantId: tenantId,
    password: hashedPassword,
    dateOfJoining: new Date(emp.dateOfJoining),
  }));

  // Insert employees
  const result = await prisma.employee.createMany({
    data: newEmployeeData,
    skipDuplicates: true, // avoid error on duplicate email
  });

  return res.status(201).json({
    success: true,
    message: "Employees added successfully",
    insertedCount: result.count,
  });
});

//------------------------------------------Logout------------------------------------------------//

export const logout = asyncHandler(async (req, res, next) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
  });
  res.json({ success: true, message: "Logged out successfully" });
});





//-----------------------------------------Update ME-----------------------------------//

export const updateMe = asyncHandler(async (req, res) => {
  const { tenantId, employeeId } = req;
  const { name, firstName, lastName, email, phone, gender, dateOfBirth, position } = req.body;

  let updatedUser = null;

  if (tenantId && !employeeId) {
    updatedUser = await prisma.tenant.update({
      where: { id: tenantId },
      data: { name, email },
      select: { id: true, name: true, email: true, role: true, domain: true }
    });
  } else if (employeeId) {
    updatedUser = await prisma.employee.update({
      where: { id: employeeId },
      data: { 
        firstName, 
        lastName, 
        email, 
        phone, 
        gender, 
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined, 
        position 
      },
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        email: true, 
        role: true, 
        tenantId: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        position: true,
        salary: true,
        dateOfJoining: true,
        employmentType: true,
        status: true,
        department: {
          select: {
            name: true
          }
        }
      }
    });
  }

  res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
});





//-----------------------------------------Change Password-----------------------------------//

export const changePassword = asyncHandler(async (req, res) => {
  const { tenantId, employeeId } = req;
  const { currentPassword, newPassword } = req.body;

  let user = null;

  if (tenantId && !employeeId) {
    user = await prisma.tenant.findUnique({ where: { id: tenantId } });
  } else if (employeeId) {
    user = await prisma.employee.findUnique({ where: { id: employeeId } });
  }

  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(401).json({ message: "Invalid current password" });
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  if (tenantId && !employeeId) {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { password: hashedNewPassword }
    });
  } else if (employeeId) {
    await prisma.employee.update({
      where: { id: employeeId },
      data: { password: hashedNewPassword }
    });
  }

  res.json({ success: true, message: "Password updated successfully" });
});
