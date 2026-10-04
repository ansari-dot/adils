import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
};
