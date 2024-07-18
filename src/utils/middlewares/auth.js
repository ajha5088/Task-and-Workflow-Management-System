const jwt = require('jsonwebtoken');
const CustomError = require('../errors/customError');
const User = require('../../models/userModel');

const generateToken = (user, expiresIn, secret) => {
  return jwt.sign({
    id: user._id,
    email: user.email,
  }, secret, { expiresIn });
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new CustomError(401, 'Invalid token');
  }
};

const generateAccessToken = (user) => {
  return generateToken(user, '1d', process.env.JWT_SECRET); // Access token valid for 15 minutes
};

const generateRefreshToken = (user) => {
  return generateToken(user, '7d', process.env.JWT_REFRESH_SECRET); // Refresh token valid for 7 days
};

const generateTokens = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { accessToken, refreshToken };
};

const authenticate = async (req, res, next) => {
  const token = req?.cookies?.accessToken || req.headers.authorization;
  if (!token) {
    return next(new CustomError(401, 'Authentication token is missing'));
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new CustomError(401, 'User not found'));
    }
    req.user = user;
    next();
  } catch (error) {
    next(new CustomError(401, 'Invalid authentication token'));
  }
};

const refreshAccessToken = async(req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return next(new CustomError(401, 'Refresh token is missing'));
  }

  try {
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new CustomError(401, 'User not found'));
    }
    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    next(new CustomError(401, error.message));
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyToken,
  authenticate,
  refreshAccessToken,
};
