const mongoose = require("mongoose");
const appLogger = require("./appLogger");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      autoIndex: true,
    });
    appLogger.info("Connected to the database");
  } catch (error) {
    appLogger.error("Error connecting to the database:", error);
    console.log(error);
  }
};

module.exports = connectDB;
