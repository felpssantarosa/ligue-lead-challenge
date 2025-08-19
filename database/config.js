require("dotenv").config();

module.exports = {
  development: {
    dialect: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "ligue_lead_dev",
    logging: false,
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  },
  production: {
    dialect: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    logging: false,
  },
};
