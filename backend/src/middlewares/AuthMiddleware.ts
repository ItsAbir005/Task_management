import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

interface DecodedToken extends jwt.JwtPayload {
  tenantId?: string;
  role?: string;
  employeeId?: string;
}

export const AuthenticateMiddleware = (req: Request, res: Response, next: NextFunction) => {

  const token = req.cookies.token || '';

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {

    const decoded = jwt.verify(token, config.jwt.secret) as DecodedToken;
    // Save tenantId if available
    if (decoded.tenantId) (req as any).tenantId = decoded.tenantId;

    // Save role for RBAC
    (req as any).userRole = decoded.role;

    // Save employeeId if available
    if (decoded.employeeId) (req as any).employeeId = decoded.employeeId;

    next();

  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}


export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes((req as any).userRole)) {
      return res.status(403).json({ message: "Forbidden: You don't have permission" });
    }
    next();
  };
};

