export type Role = 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: Role;
  tenantId: string;
  position?: string;
  departmentId?: string;
}

export interface Employee extends User {
  phone?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  salary?: number;
  dateOfJoining?: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'INTERN' | 'CONTRACT';
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
}

export interface Department {
  id: string;
  name: string;
  tenantId: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  description?: string;
  status: 'ONGOING' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  managerId: string;
  tenantId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  assigneeId: string;
  creatorId: string;
  tenantId: string;
}

export interface Leave {
  id: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string;
  tenantId: string;
}
