const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Task = require("../models/taskModel");
// const Subtask = require("../models/subtaskModel");
const CustomError = require("../utils/errors/customError");
const handleError = require("../utils/handlers/errorHandler");
const handleSuccess = require("../utils/handlers/successHandler");
const { generateTokens } = require("../utils/middlewares/auth");
const appLogger = require("../config/appLogger");

const userResolvers = {
  Query: {
    users: async () => {
      try {
        appLogger.info("resolvers - userResolver - users - start");
        const users = await User.find();
        appLogger.info("resolvers - userResolver - users - end");
        return users;
      } catch (error) {
        appLogger.error("resolvers - userResolver - users - error");
        handleError(error, "Error fetching users");
      }
    },
    user: async (_, { id }) => {
      try {
        appLogger.info("resolvers - userResolver - user - start");
        const user = await User.findById(id);
        if (!user) {
          throw new CustomError(404, "User not found");
        }
        appLogger.info("resolvers - userResolver - user - end");
        return user;
      } catch (error) {
        appLogger.error("resolvers - userResolver - user - error");
        handleError(error, "Error fetching user");
      }
    },
  },
  Mutation: {
    createUser: async (_, { username, email, password }) => {
      try {
        appLogger.info("resolvers - userResolver - createUser - start ");
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new CustomError(400, "Email already in use");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
          username,
          email,
          password: hashedPassword
        });
        const savedUser = await user.save();
        appLogger.info("resolvers - userResolver - createUser - end ");
        return handleSuccess(savedUser, "User created successfully");
      } catch (error) {
        appLogger.error("resolver - userResolver - createUser - error ");
        appLogger.error(error.message);
        handleError("Error creating user" , error.message );
      }
    },
    login: async (_, { email, password } , { res }) => {
      try {
        appLogger.info("resolvers - userResolver - login - start");
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
          throw new CustomError(401, "Invalid email or password");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new CustomError(401, "Invalid email or password");
        }

        const { accessToken, refreshToken } = generateTokens(user);

        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 1 * 24 * 60 * 60 * 1000 // 1 day
        });
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        appLogger.info("resolvers - userResolver - login - end");
        return {user , accessToken};
      } catch (error) {
        appLogger.error("resolver - userResolver - login - error ");
        appLogger.error(error.message);
        handleError("Error in login " , error.message );
      }
    },
  },
};

module.exports = userResolvers;
