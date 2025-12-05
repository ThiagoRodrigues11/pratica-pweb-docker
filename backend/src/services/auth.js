import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import bd from '../models/index.js';

const { User } = bd;
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const error = new Error('Email already in use');
    error.code = 'EMAIL_IN_USE';
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash });
  return user;
};

const buildJwtOptions = () => {
  const options = { expiresIn: env.jwt.expiresIn };
  if (env.jwt.issuer) options.issuer = env.jwt.issuer;
  if (env.jwt.audience) options.audience = env.jwt.audience;
  return options;
};

export const generateToken = (user) => {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    env.jwt.secret,
    buildJwtOptions(),
  );
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  const invalid = () => {
    const error = new Error('Invalid credentials');
    error.code = 'INVALID_CREDENTIALS';
    return error;
  };

  if (!user) {
    throw invalid();
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw invalid();
  }

  const token = generateToken(user);
  return { user, token };
};
