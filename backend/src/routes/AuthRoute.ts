import express from 'express';
import {
  register,
  login,
  addEmployee,
  setEmployeePassword,
  employeeLogin,
  getMe,
  updateMe,
  changePassword,
  logout,
  registerEmployeesBulk,
  inviteHRManager,
  managerInviteEmployee,
} from '../Controllers/AuthController.js';
import { AuthenticateMiddleware, authorize } from '../middlewares/AuthMiddleware.js';

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.post('/employeeLogin', employeeLogin);
router.post('/setPassword', setEmployeePassword);

// ── Authenticated ─────────────────────────────────────────────────────────────
router.get('/me', AuthenticateMiddleware, getMe);
router.put('/updateMe', AuthenticateMiddleware, updateMe);
router.put('/changePassword', AuthenticateMiddleware, changePassword);
router.post('/logout', logout);

// ── Admin only ────────────────────────────────────────────────────────────────
router.post('/addEmployee', AuthenticateMiddleware, authorize('ADMIN'), addEmployee);
router.post('/addInBulk', AuthenticateMiddleware, authorize('ADMIN'), registerEmployeesBulk);
router.post('/inviteHRManager', AuthenticateMiddleware, authorize('ADMIN'), inviteHRManager);

// ── Manager only ──────────────────────────────────────────────────────────────
router.post('/inviteEmployee', AuthenticateMiddleware, authorize('MANAGER'), managerInviteEmployee);

export default router;