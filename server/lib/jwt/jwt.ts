import jwt from "jsonwebtoken";

export const jwtSecret = process.env.JWT_SECRET || 'jwtsecret';

export const generateJwt = (payload: string | Buffer | object): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  const options: jwt.SignOptions = { expiresIn: '876000h' };
  return jwt.sign(payload, jwtSecret , options);
};