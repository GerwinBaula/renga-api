const express = require("express");
const authors = require("../routes/authors");
const publishers = require("../routes/publishers");
const genres = require("../routes/genres");
const mangas = require("../routes/mangas");
const customers = require("../routes/customers");
const users = require("../routes/users");
const auth = require("../routes/auth");
const rentals = require("../routes/rentals");
const returns = require("../routes/returns");
const error = require("../middleware/error");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/authors", authors);
  app.use("/api/publishers", publishers);
  app.use("/api/genres", genres);
  app.use("/api/mangas", mangas);
  app.use("/api/customers", customers);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/rentals", rentals);
  app.use("/api/returns", returns);
  app.use(error);
};
