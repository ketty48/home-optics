import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { ErrorResponse } from './error';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = await User.findById(decoded.id) as IUser;
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`User role ${req.user?.role} is not authorized to access this route`, 403)
      );
    }
    next();
  };
};

export const optionalProtect = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      req.user = await User.findById(decoded.id).select('-password') as IUser;
    } catch (err) {
      // Don't throw an error, just proceed without a user
    }
  }
  next();
};