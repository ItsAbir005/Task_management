import express from 'express';
import { addEmployee, changePassword, employeeLogin, getMe, login, logout, register, registerEmployeesBulk, setEmployeePassword, updateMe } from '../Controllers/AuthController.js';
import { AuthenticateMiddleware, authorize } from '../middlewares/AuthMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/addEmployee', AuthenticateMiddleware, authorize('ADMIN', 'HR'), addEmployee);
router.post('/setPassword', setEmployeePassword);
router.post('/employeeLogin', employeeLogin);
router.get('/me', AuthenticateMiddleware, getMe);
router.put('/updateMe', AuthenticateMiddleware, updateMe);
router.put('/changePassword', AuthenticateMiddleware, changePassword);
router.post('/logout', logout);
router.post('/addInBulk', AuthenticateMiddleware, authorize('ADMIN'), registerEmployeesBulk)

export default router;