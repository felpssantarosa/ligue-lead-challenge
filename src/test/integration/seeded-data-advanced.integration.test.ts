import type { Application } from "express";
import request from "supertest";
import { createApp } from "@/shared/infra/http/app";
import { setupE2EContainer } from "../e2e/config/container";
import { teardownTestDatabase } from "../e2e/config/database";
import { seedTestDatabase } from "../e2e/config/seeder";
import "reflect-metadata";

describe("Integration: Advanced Project and Task Management with Seeded Data", () => {
	let app: Application;
	let johnToken: string;
	let janeToken: string;
	let bobToken: string;

	// Seeded user credentials
	const seededUsers = {
		john: {
			email: "john.doe@example.com",
			password: "password123",
		},
		jane: {
			email: "jane.smith@example.com",
			password: "password123",
		},
		bob: {
			email: "bob.wilson@example.com",
			password: "password123",
		},
	};

	// Seeded project IDs based on the seeder
	const seededProjects = {
		ecommerce: "660e8400-e29b-41d4-a716-446655440001", // John's E-commerce Platform
		banking: "660e8400-e29b-41d4-a716-446655440002", // John's Mobile Banking App
		lms: "660e8400-e29b-41d4-a716-446655440003", // Jane's Learning Management System
		iot: "660e8400-e29b-41d4-a716-446655440004", // Jane's IoT Dashboard
		ai: "660e8400-e29b-41d4-a716-446655440005", // Bob's AI Content Generator
	};

	beforeAll(async () => {
		await setupE2EContainer();
		app = createApp();

		// Seed the test database
		await seedTestDatabase();

		// Login all users
		johnToken = await loginUser(seededUsers.john);
		janeToken = await loginUser(seededUsers.jane);
		bobToken = await loginUser(seededUsers.bob);
	}, 30000); // Increase timeout to 30 seconds

	afterAll(async () => {
		await teardownTestDatabase();
	});

	async function loginUser(user: {
		email: string;
		password: string;
	}): Promise<string> {
		const response = await request(app)
			.post("/auth/login")
			.send(user)
			.expect(200);

		return response.body.data.token;
	}

	describe("Complex Project Scenarios", () => {
		describe("E-commerce Platform Project (John)", () => {
			it("should handle the complete e-commerce project with all its tasks", async () => {
				// Get the E-commerce project with its tasks
				const projectResponse = await request(app)
					.get(`/api/projects/${seededProjects.ecommerce}`)
					.set("Authorization", `Bearer ${johnToken}`)
					.expect(200);

				const project = projectResponse.body.data;
				expect(project.title).toBe("E-commerce Platform");
				expect(project.description).toContain("modern e-commerce platform");
				expect(project.tags).toEqual(["e-commerce", "web", "react", "nodejs"]);

				const tasks = project.tasks;
				expect(tasks).toHaveLength(5);

				// Verify specific tasks exist
				const taskTitles = tasks.map((task: { title: string }) => task.title);
				expect(taskTitles).toContain("Design User Authentication System");
				expect(taskTitles).toContain("Build Product Catalog");
				expect(taskTitles).toContain("Implement Shopping Cart");
				expect(taskTitles).toContain("Payment Gateway Integration");
				expect(taskTitles).toContain("Order Management System");

				// Verify task statuses distribution
				const statuses = tasks.map((task: { status: string }) => task.status);
				expect(statuses).toContain("done");
				expect(statuses).toContain("in_progress");
				expect(statuses).toContain("todo");
			});

			it("should allow creating new tasks for the e-commerce project", async () => {
				const newTaskData = {
					title: "Implement Inventory Management",
					description: "Add inventory tracking and low-stock alerts",
					status: "todo",
				};

				const response = await request(app)
					.post(`/api/projects/${seededProjects.ecommerce}/tasks`)
					.set("Authorization", `Bearer ${johnToken}`)
					.send(newTaskData)
					.expect(201);

				expect(response.body.success).toBe(true);
				expect(response.body.data.title).toBe("Implement Inventory Management");
				expect(response.body.data.status).toBe("todo");

				// Verify task was added to project
				const projectResponse = await request(app)
					.get(`/api/projects/${seededProjects.ecommerce}`)
					.set("Authorization", `Bearer ${johnToken}`)
					.expect(200);

				expect(projectResponse.body.data.tasks).toHaveLength(6); // Originally 5 + 1 new
			});
		});

		describe("Learning Management System Project (Jane)", () => {
			it("should handle the LMS project with educational features", async () => {
				const projectResponse = await request(app)
					.get(`/api/projects/${seededProjects.lms}`)
					.set("Authorization", `Bearer ${janeToken}`)
					.expect(200);

				const project = projectResponse.body.data;
				expect(project.title).toBe("Learning Management System");
				expect(project.description).toContain("Comprehensive LMS");
				expect(project.tags).toEqual(["education", "web", "vue", "python"]);

				// Get LMS tasks from project
				const tasks = project.tasks;
				expect(tasks).toHaveLength(5);

				const taskTitles = tasks.map((task: { title: string }) => task.title);
				expect(taskTitles).toContain("Course Management");
				expect(taskTitles).toContain("Student Progress Tracking");
				expect(taskTitles).toContain("Assessment System");
				expect(taskTitles).toContain("Discussion Forums");
				expect(taskTitles).toContain("Video Conferencing");
			});
		});

		describe("AI Content Generator Project (Bob)", () => {
			it("should handle the AI project with machine learning features", async () => {
				const projectResponse = await request(app)
					.get(`/api/projects/${seededProjects.ai}`)
					.set("Authorization", `Bearer ${bobToken}`)
					.expect(200);

				const project = projectResponse.body.data;
				expect(project.title).toBe("AI Content Generator");
				expect(project.description).toContain("AI-powered content");
				expect(project.tags).toEqual([
					"ai",
					"machine-learning",
					"python",
					"api",
				]);

				// Get AI project tasks from project
				const tasks = project.tasks;
				expect(tasks).toHaveLength(5);

				const taskTitles = tasks.map((task: { title: string }) => task.title);
				expect(taskTitles).toContain("Content Generation API");
				expect(taskTitles).toContain("Template Management");
				expect(taskTitles).toContain("Quality Assessment");
				expect(taskTitles).toContain("User Preference Learning");
				expect(taskTitles).toContain("Multi-language Support");
			});
		});
	});

	describe("Multi-User Task Management Workflows", () => {
		it("should demonstrate different users managing different project types", async () => {
			// John working on e-commerce tasks
			const ecommerceProjectResponse = await request(app)
				.get(`/api/projects/${seededProjects.ecommerce}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.expect(200);

			const ecommerceTasks = ecommerceProjectResponse.body.data.tasks;
			const ecommerceTodoTask = ecommerceTasks.find(
				(task: { status: string }) => task.status === "todo",
			);

			if (ecommerceTodoTask) {
				await request(app)
					.put(`/api/tasks/${ecommerceTodoTask.id}`)
					.set("Authorization", `Bearer ${johnToken}`)
					.send({ status: "in_progress" })
					.expect(200);
			}

			// Jane working on LMS tasks
			const lmsProjectResponse = await request(app)
				.get(`/api/projects/${seededProjects.lms}`)
				.set("Authorization", `Bearer ${janeToken}`)
				.expect(200);

			const lmsTasks = lmsProjectResponse.body.data.tasks;
			const lmsInProgressTask = lmsTasks.find(
				(task: { status: string }) => task.status === "in_progress",
			);

			if (lmsInProgressTask) {
				await request(app)
					.put(`/api/tasks/${lmsInProgressTask.id}`)
					.set("Authorization", `Bearer ${janeToken}`)
					.send({ status: "done" })
					.expect(200);
			}

			// Bob working on AI tasks
			const aiProjectResponse = await request(app)
				.get(`/api/projects/${seededProjects.ai}`)
				.set("Authorization", `Bearer ${bobToken}`)
				.expect(200);

			const aiTasks = aiProjectResponse.body.data.tasks;
			const aiTodoTask = aiTasks.find(
				(task: { status: string }) => task.status === "todo",
			);

			if (aiTodoTask) {
				await request(app)
					.put(`/api/tasks/${aiTodoTask.id}`)
					.set("Authorization", `Bearer ${bobToken}`)
					.send({
						title: `Enhanced ${aiTodoTask.title}`,
						description: "Updated with additional requirements",
						status: "in_progress",
					})
					.expect(200);
			}

			// Verify all changes were applied independently
			const updatedEcommerceProject = await request(app)
				.get(`/api/projects/${seededProjects.ecommerce}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.expect(200);

			const updatedLmsProject = await request(app)
				.get(`/api/projects/${seededProjects.lms}`)
				.set("Authorization", `Bearer ${janeToken}`)
				.expect(200);

			const updatedAiProject = await request(app)
				.get(`/api/projects/${seededProjects.ai}`)
				.set("Authorization", `Bearer ${bobToken}`)
				.expect(200);

			// Verify each user's changes only affected their own projects
			expect(updatedEcommerceProject.body.data.tasks).toHaveLength(6); // 5 original + 1 from previous test
			expect(updatedLmsProject.body.data.tasks).toHaveLength(5);
			expect(updatedAiProject.body.data.tasks).toHaveLength(5);
		});
	});

	describe("Project Update Scenarios", () => {
		it("should allow updating projects with technology stack changes", async () => {
			// John updates E-commerce project to include mobile app
			const updateData = {
				title: "E-commerce Platform (Web & Mobile)",
				description:
					"A modern e-commerce platform with web and mobile applications, featuring real-time inventory management and AI-powered recommendations",
				tags: [
					"e-commerce",
					"web",
					"mobile",
					"react",
					"react-native",
					"nodejs",
					"ai",
				],
			};

			const response = await request(app)
				.put(`/api/projects/${seededProjects.ecommerce}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.send(updateData)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.title).toBe(
				"E-commerce Platform (Web & Mobile)",
			);
			expect(response.body.data.tags).toContain("mobile");
			expect(response.body.data.tags).toContain("react-native");
			expect(response.body.data.tags).toContain("ai");

			// Verify the update persisted
			const getResponse = await request(app)
				.get(`/api/projects/${seededProjects.ecommerce}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.expect(200);

			expect(getResponse.body.data.title).toBe(
				"E-commerce Platform (Web & Mobile)",
			);
		});

		it("should handle concurrent project updates by different users", async () => {
			const johnUpdate = {
				title: "Updated Mobile Banking App",
				description:
					"Enhanced mobile banking with biometric authentication and crypto support",
				tags: ["banking", "mobile", "security", "crypto", "fintech"],
			};

			const janeUpdate = {
				title: "IoT Smart Home Dashboard",
				description:
					"Comprehensive IoT dashboard for smart home management with voice control and automation",
				tags: ["iot", "smart-home", "dashboard", "automation", "voice-control"],
			};

			// Update projects concurrently
			const [johnResponse, janeResponse] = await Promise.all([
				request(app)
					.put(`/api/projects/${seededProjects.banking}`)
					.set("Authorization", `Bearer ${johnToken}`)
					.send(johnUpdate),
				request(app)
					.put(`/api/projects/${seededProjects.iot}`)
					.set("Authorization", `Bearer ${janeToken}`)
					.send(janeUpdate),
			]);

			expect(johnResponse.status).toBe(200);
			expect(janeResponse.status).toBe(200);
			expect(johnResponse.body.data.title).toBe("Updated Mobile Banking App");
			expect(janeResponse.body.data.title).toBe("IoT Smart Home Dashboard");
		});
	});

	describe("Task Creation and Management Patterns", () => {
		it("should support adding specialized tasks for different project types", async () => {
			// Add ML-specific tasks to AI project
			const aiTasks = [
				{
					title: "Implement Data Preprocessing Pipeline",
					description:
						"Build robust data cleaning and feature extraction pipeline",
					status: "todo",
				},
				{
					title: "Set up Model Monitoring Dashboard",
					description:
						"Create dashboard for monitoring model performance and drift",
					status: "todo",
				},
			];

			// Add security tasks to Banking project
			const bankingTasks = [
				{
					title: "Implement Two-Factor Authentication",
					description: "Add SMS and authenticator app-based 2FA",
					status: "todo",
				},
				{
					title: "Conduct Security Audit",
					description:
						"Comprehensive security assessment and penetration testing",
					status: "todo",
				},
			];

			// Add educational features to LMS project
			const lmsTasks = [
				{
					title: "Implement Adaptive Learning Algorithm",
					description:
						"Personalized learning paths based on student performance",
					status: "todo",
				},
				{
					title: "Build Mobile Learning App",
					description: "Native mobile app for offline learning",
					status: "todo",
				},
			];

			// Create tasks concurrently
			const taskCreations = await Promise.all([
				...aiTasks.map((task) =>
					request(app)
						.post(`/api/projects/${seededProjects.ai}/tasks`)
						.set("Authorization", `Bearer ${bobToken}`)
						.send(task),
				),
				...bankingTasks.map((task) =>
					request(app)
						.post(`/api/projects/${seededProjects.banking}/tasks`)
						.set("Authorization", `Bearer ${johnToken}`)
						.send(task),
				),
				...lmsTasks.map((task) =>
					request(app)
						.post(`/api/projects/${seededProjects.lms}/tasks`)
						.set("Authorization", `Bearer ${janeToken}`)
						.send(task),
				),
			]);

			// Verify all tasks were created successfully
			taskCreations.forEach((response) => {
				expect(response.status).toBe(201);
				expect(response.body.success).toBe(true);
			});

			// Verify task counts increased
			const [aiProjectResponse, bankingProjectResponse, lmsProjectResponse] =
				await Promise.all([
					request(app)
						.get(`/api/projects/${seededProjects.ai}`)
						.set("Authorization", `Bearer ${bobToken}`),
					request(app)
						.get(`/api/projects/${seededProjects.banking}`)
						.set("Authorization", `Bearer ${johnToken}`),
					request(app)
						.get(`/api/projects/${seededProjects.lms}`)
						.set("Authorization", `Bearer ${janeToken}`),
				]);

			expect(aiProjectResponse.body.data.tasks).toHaveLength(7); // 5 original + 2 new
			expect(bankingProjectResponse.body.data.tasks).toHaveLength(7); // 5 original + 2 new
			expect(lmsProjectResponse.body.data.tasks).toHaveLength(7); // 5 original + 2 new
		});
	});

	describe("Data Integrity and Isolation", () => {
		it("should maintain data integrity across all operations", async () => {
			// Get initial state for all users
			const [johnProjects, janeProjects, bobProjects] = await Promise.all([
				request(app)
					.get("/api/projects")
					.set("Authorization", `Bearer ${johnToken}`),
				request(app)
					.get("/api/projects")
					.set("Authorization", `Bearer ${janeToken}`),
				request(app)
					.get("/api/projects")
					.set("Authorization", `Bearer ${bobToken}`),
			]);

			// Verify public API returns all projects to all users
			expect(johnProjects.body.data).toHaveLength(5);
			expect(janeProjects.body.data).toHaveLength(5);
			expect(bobProjects.body.data).toHaveLength(5);

			// Verify all users see all projects (public API)
			const allProjectTitles = johnProjects.body.data.map(
				(p: { title: string }) => p.title,
			);
			const janeProjectTitles = janeProjects.body.data.map(
				(p: { title: string }) => p.title,
			);
			const bobProjectTitles = bobProjects.body.data.map(
				(p: { title: string }) => p.title,
			);

			expect(allProjectTitles).toContain("E-commerce Platform (Web & Mobile)");
			expect(allProjectTitles).toContain("Updated Mobile Banking App");
			expect(allProjectTitles).toContain("Learning Management System");
			expect(allProjectTitles).toContain("IoT Smart Home Dashboard");
			expect(allProjectTitles).toContain("AI Content Generator");

			// Verify all users see the same projects (public API)
			expect(allProjectTitles).toEqual(janeProjectTitles);
			expect(allProjectTitles).toEqual(bobProjectTitles);
			expect(janeProjectTitles).toEqual(bobProjectTitles);
		});
	});
});
