const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const connectDB = require("./config/database");
const typeDefs = require("./schemas");
const resolvers = require("./resolvers");
const { authenticate } = require("./utils/middlewares/auth");
const error = require('./utils/middlewares/error');
require("dotenv").config();
const appLogger = require('./config/appLogger');
const cookieParser = require("cookie-parser");

const startApolloServer = async () => {
  const app = express();

  const applyAuthMiddleware = (req, res, next) => {
    const publicOperations = ["login", "createUser"];

    if (req.method === "POST" && req.body && req.body.query) {
      // appLogger.info("GraphQL Query Detected:", req.body.query);
      let operationName = req.body.query;
      if (operationName && operationName.includes("login")) {
        operationName = "login";
      }
      if (operationName && operationName.includes("createUser")) {
        operationName = "createUser";
      }

      if (!publicOperations.includes(operationName)) {
        appLogger.info("Authentication Required for Operation:");
        return authenticate(req, res, next);
      } else {
        appLogger.info(
          "Public Operation, No Authentication Needed:",
        );
      }
    }
    next();
  };

  app.use(express.json());
  app.use(applyAuthMiddleware);
  app.use(cookieParser())

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req , res }) => ({
      user: req.user,
      res: res,
    }),
    introspection: true,
    playground: true,
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  await connectDB();

  app.use(error);

  return app;
};

module.exports = startApolloServer;
