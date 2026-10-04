import { config } from './env.js';

export const jwtConfig = {
  secret: config.jwt.secret,
  expiresIn: config.jwt.expiresIn,
};
