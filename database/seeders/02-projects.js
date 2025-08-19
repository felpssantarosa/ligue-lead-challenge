"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const projects = [
      {
        id: "660e8400-e29b-41d4-a716-446655440001",
        title: "E-commerce Platform",
        description: "A modern e-commerce platform with advanced features",
        tags: JSON.stringify(["e-commerce", "web", "react", "nodejs"]),
        taskIds: JSON.stringify([
          "770e8400-e29b-41d4-a716-446655440001",
          "770e8400-e29b-41d4-a716-446655440002",
          "770e8400-e29b-41d4-a716-446655440003",
          "770e8400-e29b-41d4-a716-446655440004",
          "770e8400-e29b-41d4-a716-446655440005",
        ]),
        ownerId: "550e8400-e29b-41d4-a716-446655440001",
        githubRepositories: JSON.stringify([]),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "660e8400-e29b-41d4-a716-446655440002",
        title: "Mobile Banking App",
        description:
          "Secure mobile banking application with biometric authentication",
        tags: JSON.stringify(["mobile", "banking", "security", "react-native"]),
        taskIds: JSON.stringify([
          "770e8400-e29b-41d4-a716-446655440006",
          "770e8400-e29b-41d4-a716-446655440007",
          "770e8400-e29b-41d4-a716-446655440008",
          "770e8400-e29b-41d4-a716-446655440009",
          "770e8400-e29b-41d4-a716-446655440010",
        ]),
        ownerId: "550e8400-e29b-41d4-a716-446655440001",
        githubRepositories: JSON.stringify([]),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "660e8400-e29b-41d4-a716-446655440003",
        title: "Learning Management System",
        description:
          "Comprehensive LMS for online education and course management",
        tags: JSON.stringify(["education", "web", "vue", "python"]),
        taskIds: JSON.stringify([
          "770e8400-e29b-41d4-a716-446655440011",
          "770e8400-e29b-41d4-a716-446655440012",
          "770e8400-e29b-41d4-a716-446655440013",
          "770e8400-e29b-41d4-a716-446655440014",
          "770e8400-e29b-41d4-a716-446655440015",
        ]),
        ownerId: "550e8400-e29b-41d4-a716-446655440002",
        githubRepositories: JSON.stringify([]),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "660e8400-e29b-41d4-a716-446655440004",
        title: "IoT Dashboard",
        description:
          "Real-time monitoring dashboard for IoT devices and sensors",
        tags: JSON.stringify(["iot", "dashboard", "real-time", "angular"]),
        taskIds: JSON.stringify([
          "770e8400-e29b-41d4-a716-446655440016",
          "770e8400-e29b-41d4-a716-446655440017",
          "770e8400-e29b-41d4-a716-446655440018",
          "770e8400-e29b-41d4-a716-446655440019",
          "770e8400-e29b-41d4-a716-446655440020",
        ]),
        ownerId: "550e8400-e29b-41d4-a716-446655440002",
        githubRepositories: JSON.stringify([]),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "660e8400-e29b-41d4-a716-446655440005",
        title: "AI Content Generator",
        description:
          "AI-powered content generation tool for marketing and social media",
        tags: JSON.stringify(["ai", "content", "machine-learning", "python"]),
        taskIds: JSON.stringify([
          "770e8400-e29b-41d4-a716-446655440021",
          "770e8400-e29b-41d4-a716-446655440022",
          "770e8400-e29b-41d4-a716-446655440023",
          "770e8400-e29b-41d4-a716-446655440024",
          "770e8400-e29b-41d4-a716-446655440025",
        ]),
        ownerId: "550e8400-e29b-41d4-a716-446655440003",
        githubRepositories: JSON.stringify([]),
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert("projects", projects, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("projects", null, {});
  },
};
