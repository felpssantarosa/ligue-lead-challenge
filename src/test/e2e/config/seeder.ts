import bcrypt from "bcryptjs";
import { testSequelize } from "./database";

export const seedTestDatabase = async (): Promise<void> => {
	if (!testSequelize) {
		throw new Error("Test database not initialized");
	}

	const now = new Date();

	// Seed users
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

	await testSequelize.getQueryInterface().bulkInsert("users", users);

	// Seed projects
	const projects = [
		{
			id: "660e8400-e29b-41d4-a716-446655440001",
			title: "E-commerce Platform",
			description:
				"A modern e-commerce platform with real-time inventory management, payment processing, and customer analytics.",
			tags: JSON.stringify(["e-commerce", "web", "react", "nodejs"]),
			taskIds: JSON.stringify([]),
			ownerId: "550e8400-e29b-41d4-a716-446655440001", // John Doe
			githubRepositories: JSON.stringify([]),
			createdAt: new Date("2024-01-15T10:00:00.000Z"),
			updatedAt: new Date("2024-01-15T10:00:00.000Z"),
		},
		{
			id: "660e8400-e29b-41d4-a716-446655440002",
			title: "Mobile Banking App",
			description:
				"Secure mobile banking application with biometric authentication, real-time notifications, and comprehensive financial management tools.",
			tags: JSON.stringify(["banking", "mobile", "react-native", "security"]),
			taskIds: JSON.stringify([]),
			ownerId: "550e8400-e29b-41d4-a716-446655440001", // John Doe
			githubRepositories: JSON.stringify([]),
			createdAt: new Date("2024-01-20T14:30:00.000Z"),
			updatedAt: new Date("2024-01-20T14:30:00.000Z"),
		},
		{
			id: "660e8400-e29b-41d4-a716-446655440003",
			title: "Learning Management System",
			description:
				"Comprehensive LMS with interactive courses, progress tracking, assessment tools, and collaborative learning features.",
			tags: JSON.stringify(["education", "web", "vue", "python"]),
			taskIds: JSON.stringify([]),
			ownerId: "550e8400-e29b-41d4-a716-446655440002", // Jane Smith
			githubRepositories: JSON.stringify([]),
			createdAt: new Date("2024-02-01T09:15:00.000Z"),
			updatedAt: new Date("2024-02-01T09:15:00.000Z"),
		},
		{
			id: "660e8400-e29b-41d4-a716-446655440004",
			title: "IoT Dashboard",
			description:
				"Real-time IoT device monitoring and control dashboard with data visualization, alerting, and automation capabilities.",
			tags: JSON.stringify(["iot", "dashboard", "realtime", "analytics"]),
			taskIds: JSON.stringify([]),
			ownerId: "550e8400-e29b-41d4-a716-446655440002", // Jane Smith
			githubRepositories: JSON.stringify([]),
			createdAt: new Date("2024-02-10T16:45:00.000Z"),
			updatedAt: new Date("2024-02-10T16:45:00.000Z"),
		},
		{
			id: "660e8400-e29b-41d4-a716-446655440005",
			title: "AI Content Generator",
			description:
				"AI-powered content generation tool using advanced language models for creating high-quality articles, blogs, and marketing copy.",
			tags: JSON.stringify(["ai", "machine-learning", "python", "api"]),
			taskIds: JSON.stringify([]),
			ownerId: "550e8400-e29b-41d4-a716-446655440003", // Bob Wilson
			githubRepositories: JSON.stringify([]),
			createdAt: new Date("2024-02-15T11:20:00.000Z"),
			updatedAt: new Date("2024-02-15T11:20:00.000Z"),
		},
	];

	await testSequelize.getQueryInterface().bulkInsert("projects", projects);

	// Seed tasks (sample tasks for the projects)
	const tasks = [
		// E-commerce Platform tasks (5 tasks)
		{
			id: "770e8400-e29b-41d4-a716-446655440001",
			projectId: "660e8400-e29b-41d4-a716-446655440001",
			title: "Design User Authentication System",
			description:
				"Create secure user registration, login, and session management with JWT tokens and password hashing.",
			status: "done",
			createdAt: new Date("2024-01-16T09:00:00.000Z"),
			updatedAt: new Date("2024-01-18T15:30:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440002",
			projectId: "660e8400-e29b-41d4-a716-446655440001",
			title: "Build Product Catalog",
			description:
				"Develop product listing, search, filtering, and categorization features with image management.",
			status: "in_progress",
			createdAt: new Date("2024-01-17T10:15:00.000Z"),
			updatedAt: new Date("2024-01-25T14:20:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440003",
			projectId: "660e8400-e29b-41d4-a716-446655440001",
			title: "Implement Shopping Cart",
			description:
				"Create shopping cart functionality with add/remove items, quantity updates, and persistent storage.",
			status: "todo",
			createdAt: new Date("2024-01-18T11:30:00.000Z"),
			updatedAt: new Date("2024-01-18T11:30:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440004",
			projectId: "660e8400-e29b-41d4-a716-446655440001",
			title: "Payment Gateway Integration",
			description:
				"Integrate payment processing with multiple providers (Stripe, PayPal) and handle transaction security.",
			status: "todo",
			createdAt: new Date("2024-01-19T13:45:00.000Z"),
			updatedAt: new Date("2024-01-19T13:45:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440005",
			projectId: "660e8400-e29b-41d4-a716-446655440001",
			title: "Order Management System",
			description:
				"Build order tracking, status updates, and customer order history management.",
			status: "todo",
			createdAt: new Date("2024-01-20T08:20:00.000Z"),
			updatedAt: new Date("2024-01-20T08:20:00.000Z"),
		},

		// Mobile Banking App tasks (5 tasks)
		{
			id: "770e8400-e29b-41d4-a716-446655440006",
			projectId: "660e8400-e29b-41d4-a716-446655440002",
			title: "Biometric Authentication",
			description:
				"Implement fingerprint and face ID authentication for secure access.",
			status: "in_progress",
			createdAt: new Date("2024-01-21T09:00:00.000Z"),
			updatedAt: new Date("2024-01-23T16:00:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440007",
			projectId: "660e8400-e29b-41d4-a716-446655440002",
			title: "Account Dashboard",
			description:
				"Create comprehensive account overview with balance, transactions, and quick actions.",
			status: "done",
			createdAt: new Date("2024-01-22T10:30:00.000Z"),
			updatedAt: new Date("2024-01-24T14:00:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440008",
			projectId: "660e8400-e29b-41d4-a716-446655440002",
			title: "Push Notifications",
			description:
				"Real-time push notifications for transactions, alerts, and security notifications.",
			status: "todo",
			createdAt: new Date("2024-01-23T11:15:00.000Z"),
			updatedAt: new Date("2024-01-23T11:15:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440009",
			projectId: "660e8400-e29b-41d4-a716-446655440002",
			title: "Money Transfer",
			description:
				"Peer-to-peer money transfer with security verification and transaction history.",
			status: "todo",
			createdAt: new Date("2024-01-24T13:45:00.000Z"),
			updatedAt: new Date("2024-01-24T13:45:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440010",
			projectId: "660e8400-e29b-41d4-a716-446655440002",
			title: "Transaction Analytics",
			description:
				"Advanced analytics and insights for spending patterns and financial health.",
			status: "in_progress",
			createdAt: new Date("2024-01-25T15:20:00.000Z"),
			updatedAt: new Date("2024-01-26T12:30:00.000Z"),
		},

		// Learning Management System tasks (5 tasks)
		{
			id: "770e8400-e29b-41d4-a716-446655440011",
			projectId: "660e8400-e29b-41d4-a716-446655440003",
			title: "Course Management",
			description:
				"Create and manage courses, modules, lessons, and educational content.",
			status: "done",
			createdAt: new Date("2024-02-02T09:00:00.000Z"),
			updatedAt: new Date("2024-02-05T17:00:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440012",
			projectId: "660e8400-e29b-41d4-a716-446655440003",
			title: "Student Progress Tracking",
			description:
				"Track student progress, completion rates, and learning analytics.",
			status: "in_progress",
			createdAt: new Date("2024-02-03T10:30:00.000Z"),
			updatedAt: new Date("2024-02-07T14:45:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440013",
			projectId: "660e8400-e29b-41d4-a716-446655440003",
			title: "Assessment System",
			description:
				"Automated quizzes, assignments, and grading system with feedback.",
			status: "todo",
			createdAt: new Date("2024-02-04T11:15:00.000Z"),
			updatedAt: new Date("2024-02-04T11:15:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440014",
			projectId: "660e8400-e29b-41d4-a716-446655440003",
			title: "Discussion Forums",
			description:
				"Interactive discussion forums for students and instructors collaboration.",
			status: "todo",
			createdAt: new Date("2024-02-05T12:45:00.000Z"),
			updatedAt: new Date("2024-02-05T12:45:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440015",
			projectId: "660e8400-e29b-41d4-a716-446655440003",
			title: "Video Conferencing",
			description:
				"Integrated video conferencing for virtual classes and one-on-one sessions.",
			status: "in_progress",
			createdAt: new Date("2024-02-06T14:20:00.000Z"),
			updatedAt: new Date("2024-02-08T16:30:00.000Z"),
		},

		// IoT Dashboard tasks (5 tasks)
		{
			id: "770e8400-e29b-41d4-a716-446655440016",
			projectId: "660e8400-e29b-41d4-a716-446655440004",
			title: "Device Connection Manager",
			description:
				"Manage IoT device connections, health monitoring, and connectivity status.",
			status: "done",
			createdAt: new Date("2024-02-11T09:00:00.000Z"),
			updatedAt: new Date("2024-02-14T15:00:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440017",
			projectId: "660e8400-e29b-41d4-a716-446655440004",
			title: "Real-time Data Visualization",
			description:
				"Charts, graphs, and visual representations of real-time IoT data streams.",
			status: "in_progress",
			createdAt: new Date("2024-02-12T10:30:00.000Z"),
			updatedAt: new Date("2024-02-15T13:45:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440018",
			projectId: "660e8400-e29b-41d4-a716-446655440004",
			title: "Alert Management System",
			description:
				"Configurable alerts, thresholds, and notification system for device anomalies.",
			status: "todo",
			createdAt: new Date("2024-02-13T11:15:00.000Z"),
			updatedAt: new Date("2024-02-13T11:15:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440019",
			projectId: "660e8400-e29b-41d4-a716-446655440004",
			title: "Device Control Interface",
			description:
				"Remote control capabilities for supported IoT devices and automation rules.",
			status: "todo",
			createdAt: new Date("2024-02-14T12:45:00.000Z"),
			updatedAt: new Date("2024-02-14T12:45:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440020",
			projectId: "660e8400-e29b-41d4-a716-446655440004",
			title: "Data Analytics Engine",
			description:
				"Advanced analytics for IoT data patterns, predictions, and insights.",
			status: "in_progress",
			createdAt: new Date("2024-02-15T14:20:00.000Z"),
			updatedAt: new Date("2024-02-17T16:00:00.000Z"),
		},

		// AI Content Generator tasks (5 tasks)
		{
			id: "770e8400-e29b-41d4-a716-446655440021",
			projectId: "660e8400-e29b-41d4-a716-446655440005",
			title: "Content Generation API",
			description:
				"Core API for generating various types of content using AI language models.",
			status: "done",
			createdAt: new Date("2024-02-16T09:00:00.000Z"),
			updatedAt: new Date("2024-02-19T14:30:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440022",
			projectId: "660e8400-e29b-41d4-a716-446655440005",
			title: "Template Management",
			description:
				"Create, manage, and customize content templates for different use cases.",
			status: "in_progress",
			createdAt: new Date("2024-02-17T10:30:00.000Z"),
			updatedAt: new Date("2024-02-20T15:45:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440023",
			projectId: "660e8400-e29b-41d4-a716-446655440005",
			title: "Quality Assessment",
			description:
				"AI-powered content quality scoring and improvement suggestions.",
			status: "todo",
			createdAt: new Date("2024-02-18T11:15:00.000Z"),
			updatedAt: new Date("2024-02-18T11:15:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440024",
			projectId: "660e8400-e29b-41d4-a716-446655440005",
			title: "User Preference Learning",
			description:
				"Machine learning system to adapt to user writing styles and preferences.",
			status: "todo",
			createdAt: new Date("2024-02-19T12:45:00.000Z"),
			updatedAt: new Date("2024-02-19T12:45:00.000Z"),
		},
		{
			id: "770e8400-e29b-41d4-a716-446655440025",
			projectId: "660e8400-e29b-41d4-a716-446655440005",
			title: "Multi-language Support",
			description:
				"Support for content generation in multiple languages and localization.",
			status: "in_progress",
			createdAt: new Date("2024-02-20T14:20:00.000Z"),
			updatedAt: new Date("2024-02-22T16:00:00.000Z"),
		},
	];

	await testSequelize.getQueryInterface().bulkInsert("tasks", tasks);
};
