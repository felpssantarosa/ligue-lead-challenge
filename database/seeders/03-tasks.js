"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const tasks = [
      // E-commerce Platform tasks
      {
        id: "770e8400-e29b-41d4-a716-446655440001",
        title: "Design User Authentication System",
        description:
          "Implement secure user login and registration with JWT tokens",
        status: "DONE",
        projectId: "660e8400-e29b-41d4-a716-446655440001",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440002",
        title: "Build Product Catalog",
        description:
          "Create product listing, search, and filtering functionality",
        status: "IN_PROGRESS",
        projectId: "660e8400-e29b-41d4-a716-446655440001",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440003",
        title: "Implement Shopping Cart",
        description:
          "Add to cart, remove items, and update quantities functionality",
        status: "IN_PROGRESS",
        projectId: "660e8400-e29b-41d4-a716-446655440001",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440004",
        title: "Payment Gateway Integration",
        description: "Integrate Stripe and PayPal payment processing",
        status: "TODO",
        projectId: "660e8400-e29b-41d4-a716-446655440001",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440005",
        title: "Order Management System",
        description: "Create order tracking and status updates for customers",
        status: "TODO",
        projectId: "660e8400-e29b-41d4-a716-446655440001",
        createdAt: now,
        updatedAt: now,
      },

      // Mobile Banking App tasks
      {
        id: "770e8400-e29b-41d4-a716-446655440006",
        title: "Biometric Authentication",
        description: "Implement fingerprint and face recognition login",
        status: "DONE",
        projectId: "660e8400-e29b-41d4-a716-446655440002",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440007",
        title: "Account Balance Dashboard",
        description: "Display account balances and transaction history",
        status: "DONE",
        projectId: "660e8400-e29b-41d4-a716-446655440002",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440008",
        title: "Money Transfer Feature",
        description: "Enable peer-to-peer money transfers with security checks",
        status: "IN_PROGRESS",
        projectId: "660e8400-e29b-41d4-a716-446655440002",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440009",
        title: "Bill Payment System",
        description: "Allow users to pay utilities and other bills",
        status: "TODO",
        projectId: "660e8400-e29b-41d4-a716-446655440002",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440010",
        title: "Security Notifications",
        description: "Real-time alerts for suspicious account activities",
        status: "TODO",
        projectId: "660e8400-e29b-41d4-a716-446655440002",
        createdAt: now,
        updatedAt: now,
      },

      // Learning Management System tasks
      {
        id: "770e8400-e29b-41d4-a716-446655440011",
        title: "Course Creation Platform",
        description:
          "Build interface for instructors to create and manage courses",
        status: "DONE",
        projectId: "660e8400-e29b-41d4-a716-446655440003",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440012",
        title: "Video Streaming System",
        description: "Implement video lessons with progress tracking",
        status: "IN_PROGRESS",
        projectId: "660e8400-e29b-41d4-a716-446655440003",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440013",
        title: "Assignment Grading",
        description: "Automated and manual grading system for assignments",
        status: "IN_PROGRESS",
        projectId: "660e8400-e29b-41d4-a716-446655440003",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440014",
        title: "Discussion Forums",
        description: "Course discussion boards for student interaction",
        status: "TODO",
        projectId: "660e8400-e29b-41d4-a716-446655440003",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440015",
        title: "Analytics Dashboard",
        description:
          "Student progress and engagement analytics for instructors",
        status: "TODO",
        projectId: "660e8400-e29b-41d4-a716-446655440003",
        createdAt: now,
        updatedAt: now,
      },

      // IoT Dashboard tasks
      {
        id: "770e8400-e29b-41d4-a716-446655440016",
        title: "Device Management",
        description: "Register and configure IoT devices in the system",
        status: "DONE",
        projectId: "660e8400-e29b-41d4-a716-446655440004",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440017",
        title: "Real-time Data Visualization",
        description: "Live charts and graphs for sensor data monitoring",
        status: "IN_PROGRESS",
        projectId: "660e8400-e29b-41d4-a716-446655440004",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440018",
        title: "Alert System",
        description: "Automated alerts for device anomalies and thresholds",
        status: "IN_PROGRESS",
        projectId: "660e8400-e29b-41d4-a716-446655440004",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440019",
        title: "Historical Data Reports",
        description: "Generate reports from historical sensor data",
        status: "TODO",
        projectId: "660e8400-e29b-41d4-a716-446655440004",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440020",
        title: "Device Remote Control",
        description: "Remote control capabilities for compatible devices",
        status: "TODO",
        projectId: "660e8400-e29b-41d4-a716-446655440004",
        createdAt: now,
        updatedAt: now,
      },

      // AI Content Generator tasks
      {
        id: "770e8400-e29b-41d4-a716-446655440021",
        title: "AI Model Integration",
        description: "Integrate GPT models for content generation",
        status: "DONE",
        projectId: "660e8400-e29b-41d4-a716-446655440005",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440022",
        title: "Content Templates",
        description: "Pre-built templates for different content types",
        status: "DONE",
        projectId: "660e8400-e29b-41d4-a716-446655440005",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440023",
        title: "Brand Voice Training",
        description: "Train AI to match specific brand voices and tones",
        status: "IN_PROGRESS",
        projectId: "660e8400-e29b-41d4-a716-446655440005",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440024",
        title: "Content Optimization",
        description: "SEO and engagement optimization for generated content",
        status: "TODO",
        projectId: "660e8400-e29b-41d4-a716-446655440005",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440025",
        title: "Multi-platform Publishing",
        description:
          "Direct publishing to social media and marketing platforms",
        status: "TODO",
        projectId: "660e8400-e29b-41d4-a716-446655440005",
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert("tasks", tasks, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tasks", null, {});
  },
};
