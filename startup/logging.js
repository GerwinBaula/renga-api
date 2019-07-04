const winston = require("winston");
require("express-async-errors");

const { combine, timestamp, json, simple } = winston.format;

module.exports = function() {
  winston.exceptions.handle(
    new winston.transports.File({ filename: "outsideExpress.log" })
  );

  process.on("uncaughtException", ex => {
    console.log(ex);
  });

  process.on("unhandledRejection", () => {
    throw new Error("Could not connect to MongoDB...");
  });

  winston.add(
    new winston.transports.File({
      level: "error",
      filename: "express.log",
      format: combine(timestamp(), json())
    })
  );

  winston.add(
    new winston.transports.Console({
      level: "info",
      format: simple()
    })
  );
};
