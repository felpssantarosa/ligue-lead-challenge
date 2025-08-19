"use strict";

const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const users = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        email: "john.doe@example.com",
        name: "John Doe",
        passwordHash: await bcrypt.hash("password123", 12),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        email: "jane.smith@example.com",
        name: "Jane Smith",
        passwordHash: await bcrypt.hash("password123", 12),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        email: "bob.wilson@example.com",
        name: "Bob Wilson",
        passwordHash: await bcrypt.hash("password123", 12),
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert("users", users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
