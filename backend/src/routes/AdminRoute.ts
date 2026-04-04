import express from 'express';
import { AuthenticateMiddleware, authorize } from '../middlewares/AuthMiddleware.js';
import { addDepartment, addProject, deleteProject, getDashboardStats, getDepartment, getEmployee, getProject, updateEmployee } from '../Controllers/AdminComtroller.js';
import { applyLeave, getEmpProjects, getLeaves, getEmpTasks, updateEmpTaskStatus, getEmpDashboardStats } from '../Controllers/EmpController.js';
import { getHRLeaves, updateLeaveStatus, getHrDashboardStats } from '../Controllers/HRControllers.js';
import { getManagerProjects, updateProjectStatus, getManagerDashboardStats, getManagerLeaves, updateManagerLeaveStatus, getManagerTasks, createTask, updateTaskStatus, deleteTask } from '../Controllers/ManagerController.js';


const router = express.Router();

router.post('/addDepartment',AuthenticateMiddleware, addDepartment);
router.get('/getDepartment',AuthenticateMiddleware,getDepartment);
router.get('/getEmployee',AuthenticateMiddleware,getEmployee);
router.put('/updateEmployee/:employeeId', AuthenticateMiddleware, authorize('ADMIN'), updateEmployee);
router.post('/addProject',AuthenticateMiddleware, addProject);
router.get('/getProject',AuthenticateMiddleware,getProject);
router.get('/dashboard-stats', AuthenticateMiddleware, getDashboardStats);
router.delete('/deleteProject/:projectId',AuthenticateMiddleware,deleteProject);

router.get('/getEmpProject',AuthenticateMiddleware,getEmpProjects);
router.post('/applyLeave',AuthenticateMiddleware, applyLeave);
router.get('/getLeaves',AuthenticateMiddleware, getLeaves);

router.get('/getHRLeave',AuthenticateMiddleware,authorize('ADMIN', 'HR'), getHRLeaves);
router.post('/updateLeaveStatus',AuthenticateMiddleware,authorize('ADMIN', 'HR'), updateLeaveStatus);
router.get('/hr-dashboard-stats', AuthenticateMiddleware, authorize('ADMIN', 'HR'), getHrDashboardStats);

//====================== MANAGER ======================//
router.get('/manager-dashboard-stats', AuthenticateMiddleware, authorize('MANAGER', 'ADMIN'), getManagerDashboardStats);
router.get('/manager-projects', AuthenticateMiddleware, authorize('MANAGER', 'ADMIN'), getManagerProjects);
router.put('/manager-project/:projectId/status', AuthenticateMiddleware, authorize('MANAGER', 'ADMIN'), updateProjectStatus);
router.get('/manager-leaves', AuthenticateMiddleware, authorize('MANAGER', 'ADMIN'), getManagerLeaves);
router.put('/manager-leave-status', AuthenticateMiddleware, authorize('MANAGER', 'ADMIN'), updateManagerLeaveStatus);

router.get('/manager-tasks', AuthenticateMiddleware, authorize('MANAGER', 'ADMIN'), getManagerTasks);
router.post('/manager-task', AuthenticateMiddleware, authorize('MANAGER', 'ADMIN'), createTask);
router.put('/manager-task/:taskId', AuthenticateMiddleware, authorize('MANAGER', 'ADMIN'), updateTaskStatus);
router.delete('/manager-task/:taskId', AuthenticateMiddleware, authorize('MANAGER', 'ADMIN'), deleteTask);

router.get('/emp-tasks', AuthenticateMiddleware, authorize('EMPLOYEE', 'ADMIN', 'MANAGER'), getEmpTasks);
router.patch('/emp-task-status/:taskId', AuthenticateMiddleware, authorize('EMPLOYEE', 'ADMIN', 'MANAGER'), updateEmpTaskStatus);
router.get('/emp-dashboard-stats', AuthenticateMiddleware, authorize('EMPLOYEE', 'ADMIN', 'MANAGER'), getEmpDashboardStats);

export default router;