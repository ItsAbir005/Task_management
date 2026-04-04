import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler.js";
import prisma from "../utils/client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../Services/MailServices.js";
import config from "../config/config.js";
import { createStripeCustomer, createCheckoutSession } from "../Services/StripeService.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, domain } = req.body;

  const existing = await prisma.tenant.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ message: "Tenant with this email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newTenant = await prisma.tenant.create({
    data: { name, email, password: hashedPassword, domain, subscriptionStatus: 'INACTIVE' },
  });

  // Issue a short-lived JWT so the frontend can call /stripe/create-checkout
  const token = jwt.sign(
    { tenantId: newTenant.id, role: newTenant.role },
    config.jwt.secret,
    { expiresIn: '2h' }
  );

  // Create Stripe customer immediately
  const stripeCustomer = await createStripeCustomer(name, email);
  await prisma.tenant.update({
    where: { id: newTenant.id },
    data: { stripeCustomerId: stripeCustomer.id },
  });

  // Create checkout session and return the URL
  const session = await createCheckoutSession(stripeCustomer.id, newTenant.id, name);

  res.cookie('token', token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 2 * 60 * 60 * 1000,
  });

  res.status(201).json({
    message: "Account created. Please complete payment to activate.",
    checkoutUrl: session.url,
    token,
  });
});


// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN TENANT (ADMIN)  — blocked if subscription not ACTIVE
// ─────────────────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const tenant = await prisma.tenant.findUnique({ where: { email } });
  if (!tenant) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, tenant.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // Block login if subscription not active
  if (tenant.subscriptionStatus !== 'ACTIVE') {
    const tempToken = jwt.sign(
      { tenantId: tenant.id, role: tenant.role },
      config.jwt.secret,
      { expiresIn: '2h' }
    );
    res.cookie('token', tempToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000,
    });
    return res.status(402).json({
      success: false,
      subscriptionRequired: true,
      message: "Your subscription is not active. Please complete payment to access your account.",
      token: tempToken,
    });
  }

  const token = jwt.sign(
    { tenantId: tenant.id, role: tenant.role },
    config.jwt.secret,
    { expiresIn: '1d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ message: "Login successful", role: tenant.role, tenant, token });
});


// ─────────────────────────────────────────────────────────────────────────────
//  EMPLOYEE LOGIN  (HR / Manager / Employee)
// ─────────────────────────────────────────────────────────────────────────────
export const employeeLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const employee = await prisma.employee.findUnique({ where: { email } });
  if (!employee) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  if (!employee.password) {
    return res.status(401).json({ success: false, message: "Please set your password first using the invite link." });
  }

  const isMatch = await bcrypt.compare(password, employee.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { tenantId: employee.tenantId, employeeId: employee.id, role: employee.role },
    config.jwt.secret,
    { expiresIn: '1d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ message: "Login successful", role: employee.role, employee, token });
});


// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN INVITE HR / MANAGER
// ─────────────────────────────────────────────────────────────────────────────
export const inviteHRManager = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, role, departmentId } = req.body;
  const tenantId = (req as any).tenantId;

  if (!['HR', 'MANAGER', 'EMPLOYEE'].includes(role)) {
    return res.status(400).json({ message: "Role must be HR, MANAGER, or EMPLOYEE" });
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return res.status(404).json({ message: "Tenant not found" });

  const existing = await prisma.employee.findFirst({ where: { email, tenantId } });
  if (existing) return res.status(400).json({ message: "Employee with this email already exists" });

  const empData: any = {
    firstName,
    lastName,
    email,
    role,
    tenantId,
    setupToken: crypto.randomBytes(32).toString('hex'),
    setupTokenExpiry: new Date(Date.now() + 1000 * 60 * 60 * 48),
  };

  if (departmentId) {
    const dept = await prisma.department.findFirst({ where: { id: departmentId, tenantId } });
    if (dept) empData.departmentId = dept.id;
  }

  const newEmployee = await prisma.employee.create({ data: empData });

  const link = `${config.frontendUrl}/set-password?token=${newEmployee.setupToken}`;
  const roleLabel = role === 'HR' ? 'HR Manager' : 'Manager';

  // Non-blocking: employee is created regardless of email success
  let emailWarning = null;
  try {
    await sendEmail(
      newEmployee.email,
      `You're invited to join ${tenant.name} as ${roleLabel}`,
      `Hello ${firstName},\n\n${tenant.name} has invited you to join their HR management platform as ${roleLabel}.\n\nPlease set your password using the link below:\n\n${link}\n\nThis link will expire in 48 hours.\n\nWelcome aboard! 🎉`
    );
  } catch (emailErr) {
    console.error('⚠️ Invite email failed (employee was still created):', emailErr);
    emailWarning = `Employee created but invite email could not be sent to ${email}. Share this setup link manually: ${link}`;
  }

  return res.status(201).json({
    success: true,
    message: emailWarning ?? `${roleLabel} invited successfully. Invite email sent to ${email}.`,
    emailSent: !emailWarning,
    setupLink: emailWarning ? link : undefined,
    employee: newEmployee,
  });
});


// ─────────────────────────────────────────────────────────────────────────────
//  HR INVITE EMPLOYEE
// ─────────────────────────────────────────────────────────────────────────────
export const HRInviteEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, departmentId, salary } = req.body;
  const tenantId = (req as any).tenantId;
  const hrId = (req as any).employeeId;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return res.status(404).json({ message: "Tenant not found" });

  const hrManager = await prisma.employee.findUnique({ where: { id: hrId } });
  if (!hrManager) return res.status(404).json({ message: "HR Manager not found" });

  const existing = await prisma.employee.findFirst({ where: { email, tenantId } });
  if (existing) return res.status(400).json({ message: "Employee with this email already exists" });

  let deptRecord = null;
  if (departmentId) {
    deptRecord = await prisma.department.findFirst({ where: { id: departmentId, tenantId } });
    if (!deptRecord) return res.status(404).json({ message: "Department not found" });
  }

  const token = crypto.randomBytes(32).toString('hex');

  const newEmployee = await prisma.employee.create({
    data: {
      firstName,
      lastName,
      email,
      role: 'EMPLOYEE',
      tenantId,
      departmentId: deptRecord?.id,
      salary: salary ? parseFloat(salary) : undefined,
      setupToken: token,
      setupTokenExpiry: new Date(Date.now() + 1000 * 60 * 60 * 48),
    },
    include: { department: true },
  });

  const link = `${config.frontendUrl}/set-password?token=${token}`;

  let emailWarning: string | null = null;
  try {
    await sendEmail(
      newEmployee.email,
      `You're invited to join ${tenant.name}`,
      `Hello ${firstName},\n\nHR Management has invited you to join ${tenant.name}.\n\n${deptRecord ? `Department: ${deptRecord.name}\n\n` : ''}Please set your password using the link below:\n\n${link}\n\nThis link will expire in 48 hours.\n\nWelcome to the team! 🚀`
    );
  } catch (emailErr) {
    console.error('⚠️ HR employee invite email failed:', emailErr);
    emailWarning = `Employee created but invite email could not be sent. Share this setup link manually: ${link}`;
  }

  return res.status(201).json({
    success: true,
    message: emailWarning ?? `Employee invited successfully. Invite email sent to ${email}.`,
    emailSent: !emailWarning,
    setupLink: emailWarning ? link : undefined,
    employee: newEmployee,
  });
});



// ─────────────────────────────────────────────────────────────────────────────
//  ADD EMPLOYEE BY ADMIN
// ─────────────────────────────────────────────────────────────────────────────
export const addEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, role, salary, departmentId } = req.body;
  const tenantId = (req as any).tenantId;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return res.status(404).json({ message: "Tenant not found" });

  const existingEmployee = await prisma.employee.findFirst({ where: { email, tenantId } });
  if (existingEmployee) return res.status(400).json({ message: "Employee with this email already exists" });

  const departmentRecord = await prisma.department.findFirst({ where: { id: departmentId, tenantId } });
  if (!departmentRecord) return res.status(404).json({ message: "Department not found or does not belong to your company" });

  const numericSalary = parseFloat(salary);
  const token = crypto.randomBytes(32).toString("hex");

  const newEmployee = await prisma.employee.create({
    data: {
      firstName, lastName, email, role,
      salary: numericSalary,
      departmentId: departmentRecord.id,
      tenantId: tenant.id,
      setupToken: token,
      setupTokenExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
    include: { department: true },
  });

  const link = `${config.frontendUrl}/set-password?token=${token}`;

  let emailWarning = null;
  try {
    await sendEmail(
      newEmployee.email,
      "Welcome to HR Management System",
      `Hello ${newEmployee.firstName},\n\nYour account has been created under the ${departmentRecord.name} department.\nPlease set your password using the link below:\n\n${link}\n\nThis link will expire in 24 hours.`
    );
  } catch (emailErr) {
    console.error('⚠️ Add employee email failed (employee still created):', emailErr);
    emailWarning = `Employee created but invite email could not be sent. Share this setup link manually: ${link}`;
  }

  return res.json({
    success: true,
    message: emailWarning ?? "Employee added successfully and verification link sent.",
    emailSent: !emailWarning,
    setupLink: emailWarning ? link : undefined,
    employee: newEmployee,
  });
});


// ─────────────────────────────────────────────────────────────────────────────
//  SET PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
export const setEmployeePassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  const employee = await prisma.employee.findFirst({
    where: {
      AND: [
        { setupToken: token },
        { setupTokenExpiry: { gt: new Date() } },
      ],
    },
  });

  if (!employee) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.employee.update({
    where: { id: employee.id },
    data: { password: hashedPassword, setupToken: null, setupTokenExpiry: null },
  });

  res.status(200).json({ message: "Password set successfully. You can now log in." });
});


// ─────────────────────────────────────────────────────────────────────────────
//  GET ME
// ─────────────────────────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const { userRole, tenantId, employeeId } = req as any;
  let user = null;

  if (tenantId && !employeeId) {
    user = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, email: true, role: true, domain: true, subscriptionStatus: true, profilePic: true },
    });
  }

  if (employeeId) {
    user = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true, firstName: true, lastName: true, email: true, role: true, tenantId: true, profilePic: true,
        phone: true, dateOfBirth: true, gender: true, position: true, salary: true,
        dateOfJoining: true, employmentType: true, status: true, departmentId: true,
        department: { select: { id: true, name: true } },
      },
    });
  }

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ success: true, user, role: userRole });
});


// ─────────────────────────────────────────────────────────────────────────────
//  UPDATE ME
// ─────────────────────────────────────────────────────────────────────────────
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId, employeeId } = req as any;
  const { name, firstName, lastName, email, phone, gender, dateOfBirth, position } = req.body;
  let updatedUser = null;

  if (tenantId && !employeeId) {
    updatedUser = await prisma.tenant.update({
      where: { id: tenantId },
      data: { name, email },
      select: { id: true, name: true, email: true, role: true, domain: true, profilePic: true },
    });
  } else if (employeeId) {
    updatedUser = await prisma.employee.update({
      where: { id: employeeId },
      data: { firstName, lastName, email, phone, gender, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined, position },
      select: {
        id: true, firstName: true, lastName: true, email: true, role: true, tenantId: true, profilePic: true,
        phone: true, dateOfBirth: true, gender: true, position: true, salary: true,
        dateOfJoining: true, employmentType: true, status: true, departmentId: true,
        department: { select: { id: true, name: true } },
      },
    });
  }

  res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
});


export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId, employeeId } = req as any;
  const { currentPassword, newPassword } = req.body;
  let user: any = null;

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
    await prisma.tenant.update({ where: { id: tenantId }, data: { password: hashedNewPassword } });
  } else if (employeeId) {
    await prisma.employee.update({ where: { id: employeeId }, data: { password: hashedNewPassword } });
  }

  res.json({ success: true, message: "Password updated successfully" });
});


// ─────────────────────────────────────────────────────────────────────────────
//  LOGOUT
// ─────────────────────────────────────────────────────────────────────────────
export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
  });
  res.json({ success: true, message: "Logged out successfully" });
});


// ─────────────────────────────────────────────────────────────────────────────
//  BULK ADD EMPLOYEES (admin)
// ─────────────────────────────────────────────────────────────────────────────
export const registerEmployeesBulk = asyncHandler(async (req: Request, res: Response) => {
  const { employees } = req.body;
  if (!employees || !Array.isArray(employees)) {
    return res.status(400).json({ success: false, message: "Employees array is required" });
  }

  const tenantId = (req as any).tenantId;
  if (!tenantId) return res.status(401).json({ success: false, message: "Unauthorized: Tenant ID missing" });

  const hashedPassword = await bcrypt.hash("123456", 10);

  const newEmployeeData = employees.map((emp: any) => ({
    email: emp.email,
    firstName: emp.firstName,
    role: emp.role,
    salary: emp.salary,
    departmentId: emp.departmentId,
    tenantId,
    password: hashedPassword,
    dateOfJoining: new Date(emp.dateOfJoining),
  }));

  const result = await prisma.employee.createMany({ data: newEmployeeData, skipDuplicates: true });

  return res.status(201).json({ success: true, message: "Employees added successfully", insertedCount: result.count });
});

// ─────────────────────────────────────────────────────────────────────────────
//  UPLOAD PROFILE PICTURE
// ─────────────────────────────────────────────────────────────────────────────
export const uploadProfilePic = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId, employeeId } = req as any;
  if (!req.file) {
    return res.status(400).json({ message: "No image file provided" });
  }

  const fileUrl = req.file.path;
  let updatedUser = null;

  if (tenantId && !employeeId) {
    updatedUser = await prisma.tenant.update({
      where: { id: tenantId },
      data: { profilePic: fileUrl },
      select: { id: true, name: true, email: true, role: true, domain: true, profilePic: true },
    });
  } else if (employeeId) {
    updatedUser = await prisma.employee.update({
      where: { id: employeeId },
      data: { profilePic: fileUrl },
      select: {
        id: true, firstName: true, lastName: true, email: true, role: true, tenantId: true, profilePic: true,
        phone: true, dateOfBirth: true, gender: true, position: true, salary: true,
        dateOfJoining: true, employmentType: true, status: true, departmentId: true,
        department: { select: { id: true, name: true } },
      },
    });
  }

  res.json({ success: true, message: "Profile picture updated successfully", user: updatedUser });
});
