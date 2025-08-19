// Seeded data for testing - matches the actual database seeders
// This data is kept in sync with database/seeders/*.js files

// Extract the seeded data (matches the actual seeder files)
export const SEEDED_USERS = [
	{
		id: "550e8400-e29b-41d4-a716-446655440001",
		name: "John Doe",
		email: "john.doe@example.com",
		password: "password123", // Plain text for testing
		passwordHash:
			"$2b$10$rOJ3BT.XKH9HL1yd.ZR7OurQQ3kKvH9kGOB1VV.cKvHqXKY0sYK8a", // bcrypt hash
		createdAt: new Date("2024-01-01T00:00:00.000Z"),
		updatedAt: new Date("2024-01-01T00:00:00.000Z"),
	},
	{
		id: "550e8400-e29b-41d4-a716-446655440002",
		name: "Jane Smith",
		email: "jane.smith@example.com",
		password: "password123",
		passwordHash:
			"$2b$10$rOJ3BT.XKH9HL1yd.ZR7OurQQ3kKvH9kGOB1VV.cKvHqXKY0sYK8a",
		createdAt: new Date("2024-01-01T00:00:00.000Z"),
		updatedAt: new Date("2024-01-01T00:00:00.000Z"),
	},
	{
		id: "550e8400-e29b-41d4-a716-446655440003",
		name: "Bob Wilson",
		email: "bob.wilson@example.com",
		password: "password123",
		passwordHash:
			"$2b$10$rOJ3BT.XKH9HL1yd.ZR7OurQQ3kKvH9kGOB1VV.cKvHqXKY0sYK8a",
		createdAt: new Date("2024-01-01T00:00:00.000Z"),
		updatedAt: new Date("2024-01-01T00:00:00.000Z"),
	},
];

export const SEEDED_PROJECTS = [
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

export const SEEDED_TASKS = [
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
			"Implement fingerprint and facial recognition for secure app access.",
		status: "in_progress",
		createdAt: new Date("2024-01-21T09:30:00.000Z"),
		updatedAt: new Date("2024-01-28T16:15:00.000Z"),
	},
	{
		id: "770e8400-e29b-41d4-a716-446655440007",
		projectId: "660e8400-e29b-41d4-a716-446655440002",
		title: "Account Balance Dashboard",
		description:
			"Create real-time account balance display with transaction history and spending analytics.",
		status: "done",
		createdAt: new Date("2024-01-22T10:45:00.000Z"),
		updatedAt: new Date("2024-01-26T12:30:00.000Z"),
	},
	{
		id: "770e8400-e29b-41d4-a716-446655440008",
		projectId: "660e8400-e29b-41d4-a716-446655440002",
		title: "Money Transfer Feature",
		description:
			"Build secure money transfer functionality with beneficiary management and transfer limits.",
		status: "todo",
		createdAt: new Date("2024-01-23T14:20:00.000Z"),
		updatedAt: new Date("2024-01-23T14:20:00.000Z"),
	},
	{
		id: "770e8400-e29b-41d4-a716-446655440009",
		projectId: "660e8400-e29b-41d4-a716-446655440002",
		title: "Push Notifications",
		description:
			"Implement real-time push notifications for transactions, security alerts, and account updates.",
		status: "todo",
		createdAt: new Date("2024-01-24T11:10:00.000Z"),
		updatedAt: new Date("2024-01-24T11:10:00.000Z"),
	},
	{
		id: "770e8400-e29b-41d4-a716-446655440010",
		projectId: "660e8400-e29b-41d4-a716-446655440002",
		title: "Security Audit Integration",
		description:
			"Integrate security monitoring and fraud detection systems with real-time alerting.",
		status: "todo",
		createdAt: new Date("2024-01-25T15:40:00.000Z"),
		updatedAt: new Date("2024-01-25T15:40:00.000Z"),
	},

	// Learning Management System tasks (5 tasks)
	{
		id: "770e8400-e29b-41d4-a716-446655440011",
		projectId: "660e8400-e29b-41d4-a716-446655440003",
		title: "Design Course Management Interface",
		description:
			"Create intuitive interface for instructors to create, edit, and manage courses and curriculum.",
		status: "done",
		createdAt: new Date("2024-02-02T08:15:00.000Z"),
		updatedAt: new Date("2024-02-05T17:20:00.000Z"),
	},
	{
		id: "770e8400-e29b-41d4-a716-446655440012",
		projectId: "660e8400-e29b-41d4-a716-446655440003",
		title: "Implement Student Portal",
		description:
			"Build student dashboard with course enrollment, progress tracking, and assignment submission.",
		status: "in_progress",
		createdAt: new Date("2024-02-03T09:30:00.000Z"),
		updatedAt: new Date("2024-02-08T14:45:00.000Z"),
	},
	{
		id: "770e8400-e29b-41d4-a716-446655440013",
		projectId: "660e8400-e29b-41d4-a716-446655440003",
		title: "Build Assessment System",
		description:
			"Create comprehensive assessment tools with quizzes, exams, and automated grading.",
		status: "todo",
		createdAt: new Date("2024-02-04T10:45:00.000Z"),
		updatedAt: new Date("2024-02-04T10:45:00.000Z"),
	},
	{
		id: "770e8400-e29b-41d4-a716-446655440014",
		projectId: "660e8400-e29b-41d4-a716-446655440003",
		title: "Create Grade Book",
		description:
			"Develop grade management system with analytics, reporting, and parent/student notifications.",
		status: "todo",
		createdAt: new Date("2024-02-05T12:20:00.000Z"),
		updatedAt: new Date("2024-02-05T12:20:00.000Z"),
	},
	{
		id: "770e8400-e29b-41d4-a716-446655440015",
		projectId: "660e8400-e29b-41d4-a716-446655440003",
		title: "Develop Discussion Forums",
		description:
			"Build interactive discussion forums for course-specific student and instructor communication.",
		status: "todo",
		createdAt: new Date("2024-02-06T16:10:00.000Z"),
		updatedAt: new Date("2024-02-06T16:10:00.000Z"),
	},

	// IoT Dashboard tasks (5 tasks)
	{
		id: "770e8400-e29b-41d4-a716-446655440016",
		projectId: "660e8400-e29b-41d4-a716-446655440004",
		title: "Real-time Data Visualization",
		description:
			"Create dynamic charts and graphs for real-time IoT sensor data visualization.",
		status: "in_progress",
		createdAt: new Date("2024-02-11T09:20:00.000Z"),
		updatedAt: new Date("2024-02-14T13:35:00.000Z"),
	},
	{
		id: "770e8400-e29b-41d4-a716-446655440017",
		projectId: "660e8400-e29b-41d4-a716-446655440004",
		title: "Device Management Panel",
		description:
			"Build interface for adding, configuring, and monitoring IoT devices with status indicators.",
		status: "done",
		createdAt: new Date("2024-02-12T10:35:00.000Z"),
		updatedAt: new Date("2024-02-15T11:20:00.000Z"),
	},
	{
		id: "770e8400-e29b-41d4-a716-446655440018",
		projectId: "660e8400-e29b-41d4-a716-446655440004",
		title: "Alert System Configuration",
		description:
			"Implement customizable alert system for device failures, threshold breaches, and anomalies.",
		status: "todo",
		createdAt: new Date("2024-02-13T11:50:00.000Z"),
		updatedAt: new Date("2024-02-13T11:50:00.000Z"),
	},
	{
		id: "770e8400-e29b-41d4-a716-446655440019",
		projectId: "660e8400-e29b-41d4-a716-446655440004",
		title: "Data Export Functionality",
		description:
			"Create data export features with multiple formats (CSV, JSON, PDF) and scheduled reports.",
		status: "todo",
		createdAt: new Date("2024-02-14T14:15:00.000Z"),
		updatedAt: new Date("2024-02-14T14:15:00.000Z"),
	},
	{
		id: "770e8400-e29b-41d4-a716-446655440020",
		projectId: "660e8400-e29b-41d4-a716-446655440004",
		title: "Mobile App Integration",
		description:
			"Develop mobile app companion for remote monitoring and device control.",
		status: "todo",
		createdAt: new Date("2024-02-15T15:30:00.000Z"),
		updatedAt: new Date("2024-02-15T15:30:00.000Z"),
	},

	// AI Content Generator tasks (5 tasks)
	{
		id: "770e8400-e29b-41d4-a716-446655440021",
		projectId: "660e8400-e29b-41d4-a716-446655440005",
		title: "Train Base Language Model",
		description:
			"Train and fine-tune the base language model for content generation with domain-specific data.",
		status: "in_progress",
		createdAt: new Date("2024-02-16T08:45:00.000Z"),
		updatedAt: new Date("2024-02-20T16:30:00.000Z"),
	},
	{
		id: "770e8400-e29b-41d4-a716-446655440022",
		projectId: "660e8400-e29b-41d4-a716-446655440005",
		title: "Implement Content Templates",
		description:
			"Create customizable templates for different content types (articles, blogs, social media posts).",
		status: "done",
		createdAt: new Date("2024-02-17T09:20:00.000Z"),
		updatedAt: new Date("2024-02-19T14:15:00.000Z"),
	},
	{
		id: "770e8400-e29b-41d4-a716-446655440023",
		projectId: "660e8400-e29b-41d4-a716-446655440005",
		title: "Build API Endpoints",
		description:
			"Develop RESTful API endpoints for content generation with authentication and rate limiting.",
		status: "todo",
		createdAt: new Date("2024-02-18T10:10:00.000Z"),
		updatedAt: new Date("2024-02-18T10:10:00.000Z"),
	},
	{
		id: "770e8400-e29b-41d4-a716-446655440024",
		projectId: "660e8400-e29b-41d4-a716-446655440005",
		title: "Add Quality Filters",
		description:
			"Implement content quality assessment and filtering to ensure high-quality output.",
		status: "todo",
		createdAt: new Date("2024-02-19T12:40:00.000Z"),
		updatedAt: new Date("2024-02-19T12:40:00.000Z"),
	},
	{
		id: "770e8400-e29b-41d4-a716-446655440025",
		projectId: "660e8400-e29b-41d4-a716-446655440005",
		title: "Deploy Model Service",
		description:
			"Deploy the AI model as a scalable microservice with load balancing and monitoring.",
		status: "todo",
		createdAt: new Date("2024-02-20T13:55:00.000Z"),
		updatedAt: new Date("2024-02-20T13:55:00.000Z"),
	},
];

// Helper functions to get data by relationship
export const getUserById = (id: string) =>
	SEEDED_USERS.find((user) => user.id === id);
export const getUserByEmail = (email: string) =>
	SEEDED_USERS.find((user) => user.email === email);
export const getProjectById = (id: string) =>
	SEEDED_PROJECTS.find((project) => project.id === id);
export const getProjectsByOwnerId = (ownerId: string) =>
	SEEDED_PROJECTS.filter((project) => project.ownerId === ownerId);
export const getTaskById = (id: string) =>
	SEEDED_TASKS.find((task) => task.id === id);
export const getTasksByProjectId = (projectId: string) =>
	SEEDED_TASKS.filter((task) => task.projectId === projectId);

// User credentials for testing (all users have the same password)
export const TEST_PASSWORD = "password123";

// Quick access to user data for testing
export const JOHN_DOE = SEEDED_USERS[0];
export const JANE_SMITH = SEEDED_USERS[1];
export const BOB_WILSON = SEEDED_USERS[2];

// Quick access to projects by user
export const JOHN_PROJECTS = getProjectsByOwnerId(JOHN_DOE.id);
export const JANE_PROJECTS = getProjectsByOwnerId(JANE_SMITH.id);
export const BOB_PROJECTS = getProjectsByOwnerId(BOB_WILSON.id);

// Type definitions for TypeScript
export interface SeededUser {
	id: string;
	name: string;
	email: string;
	password: string;
	passwordHash: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface SeededProject {
	id: string;
	title: string;
	description: string;
	tags: string; // JSON string
	taskIds: string; // JSON string
	ownerId: string;
	githubRepositories: string; // JSON string
	createdAt: Date;
	updatedAt: Date;
}

export interface SeededTask {
	id: string;
	projectId: string;
	title: string;
	description: string;
	status: "todo" | "in_progress" | "done";
	createdAt: Date;
	updatedAt: Date;
}
