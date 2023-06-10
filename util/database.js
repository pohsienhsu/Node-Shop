const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env["SQL_DATABASE"],
  process.env["SQL_USER"],
  process.env["SQL_PASSWORD"],
  { dialect: "mysql", host: "localhost" }
);

module.exports = sequelize;
