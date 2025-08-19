import type { Application } from "express";
import request from "supertest";
import { createApp } from "@/shared/infra/http/app";
import {
	BOB_PROJECTS,
	BOB_WILSON,
	getTasksByProjectId,
	JANE_PROJECTS,
	JANE_SMITH,
	JOHN_DOE,
	JOHN_PROJECTS,
	TEST_PASSWORD,
} from "../fixtures/seeded-data";
import { setupE2EContainer } from "./config/container";
import { teardownTestDatabase } from "./config/database";
import "reflect-metadata";

describe("E2E: Seeded Data Workflow Tests", () => {
	let app: Application;
	let johnToken: string;
	let janeToken: string;

	// Dynamic project IDs (will be set after creating seeded data)
	let createdProjects: {
		ecommerce: string;
		banking: string;
		lms: string;
		iot: string;
		ai: string;
	};

	beforeAll(async () => {
		await setupE2EContainer();
		app = createApp();

		// Create seeded data in the test database
		await createSeededData();

		// Login all users to get their tokens
		johnToken = await loginUser({
			email: JOHN_DOE.email,
			password: TEST_PASSWORD,
		});
		janeToken = await loginUser({
			email: JANE_SMITH.email,
			password: TEST_PASSWORD,
		});
	}, 30000);

	afterAll(async () => {
		await teardownTestDatabase();
	});

	async function createSeededData(): Promise<void> {
		// Register all seeded users
		await request(app)
			.post("/auth/register")
			.send({
				name: JOHN_DOE.name,
				email: JOHN_DOE.email,
				password: TEST_PASSWORD,
			})
			.expect(201);

		await request(app)
			.post("/auth/register")
			.send({
				name: JANE_SMITH.name,
				email: JANE_SMITH.email,
				password: TEST_PASSWORD,
			})
			.expect(201);

		await request(app)
			.post("/auth/register")
			.send({
				name: BOB_WILSON.name,
				email: BOB_WILSON.email,
				password: TEST_PASSWORD,
			})
			.expect(201);

		// Login users to get tokens for creating projects
		const johnLoginToken = await loginUser({
			email: JOHN_DOE.email,
			password: TEST_PASSWORD,
		});
		const janeLoginToken = await loginUser({
			email: JANE_SMITH.email,
			password: TEST_PASSWORD,
		});
		const bobLoginToken = await loginUser({
			email: BOB_WILSON.email,
			password: TEST_PASSWORD,
		});

		// Create John's projects
		const ecommerceProject = JOHN_PROJECTS.find(
			(p) => p.title === "E-commerce Platform",
		);
		const bankingProject = JOHN_PROJECTS.find(
			(p) => p.title === "Mobile Banking App",
		);

		const ecommerceResponse = await request(app)
			.post("/api/projects")
			.set("Authorization", `Bearer ${johnLoginToken}`)
			.send({
				title: ecommerceProject?.title,
				description: ecommerceProject?.description,
				tags: JSON.parse(ecommerceProject?.tags || "[]"),
			})
			.expect(201);

		const bankingResponse = await request(app)
			.post("/api/projects")
			.set("Authorization", `Bearer ${johnLoginToken}`)
			.send({
				title: bankingProject?.title,
				description: bankingProject?.description,
				tags: JSON.parse(bankingProject?.tags || "[]"),
			})
			.expect(201);

		// Create Jane's projects
		const lmsProject = JANE_PROJECTS.find(
			(p) => p.title === "Learning Management System",
		);
		const iotProject = JANE_PROJECTS.find((p) => p.title === "IoT Dashboard");

		const lmsResponse = await request(app)
			.post("/api/projects")
			.set("Authorization", `Bearer ${janeLoginToken}`)
			.send({
				title: lmsProject?.title,
				description: lmsProject?.description,
				tags: JSON.parse(lmsProject?.tags || "[]"),
			})
			.expect(201);

		const iotResponse = await request(app)
			.post("/api/projects")
			.set("Authorization", `Bearer ${janeLoginToken}`)
			.send({
				title: iotProject?.title,
				description: iotProject?.description,
				tags: JSON.parse(iotProject?.tags || "[]"),
			})
			.expect(201);

		// Create Bob's project
		const aiProject = BOB_PROJECTS.find(
			(p) => p.title === "AI Content Generator",
		);

		const aiResponse = await request(app)
			.post("/api/projects")
			.set("Authorization", `Bearer ${bobLoginToken}`)
			.send({
				title: aiProject?.title,
				description: aiProject?.description,
				tags: JSON.parse(aiProject?.tags || "[]"),
			})
			.expect(201);

		// Store the created project IDs
		createdProjects = {
			ecommerce: ecommerceResponse.body.data.id,
			banking: bankingResponse.body.data.id,
			lms: lmsResponse.body.data.id,
			iot: iotResponse.body.data.id,
			ai: aiResponse.body.data.id,
		};

		// Create tasks for each project
		if (ecommerceProject) {
			const tasks = getTasksByProjectId(ecommerceProject.id);
			for (const task of tasks) {
				await request(app)
					.post(`/api/projects/${createdProjects.ecommerce}/tasks`)
					.set("Authorization", `Bearer ${johnLoginToken}`)
					.send({
						title: task.title,
						description: task.description,
						status: task.status,
					});
			}
		}

		if (bankingProject) {
			const tasks = getTasksByProjectId(bankingProject.id);
			for (const task of tasks) {
				await request(app)
					.post(`/api/projects/${createdProjects.banking}/tasks`)
					.set("Authorization", `Bearer ${johnLoginToken}`)
					.send({
						title: task.title,
						description: task.description,
						status: task.status,
					});
			}
		}

		if (lmsProject) {
			const tasks = getTasksByProjectId(lmsProject.id);
			for (const task of tasks) {
				await request(app)
					.post(`/api/projects/${createdProjects.lms}/tasks`)
					.set("Authorization", `Bearer ${janeLoginToken}`)
					.send({
						title: task.title,
						description: task.description,
						status: task.status,
					});
			}
		}

		if (iotProject) {
			const tasks = getTasksByProjectId(iotProject.id);
			for (const task of tasks) {
				await request(app)
					.post(`/api/projects/${createdProjects.iot}/tasks`)
					.set("Authorization", `Bearer ${janeLoginToken}`)
					.send({
						title: task.title,
						description: task.description,
						status: task.status,
					});
			}
		}

		if (aiProject) {
			const tasks = getTasksByProjectId(aiProject.id);
			for (const task of tasks) {
				await request(app)
					.post(`/api/projects/${createdProjects.ai}/tasks`)
					.set("Authorization", `Bearer ${bobLoginToken}`)
					.send({
						title: task.title,
						description: task.description,
						status: task.status,
					});
			}
		}
	}

	async function loginUser(user: {
		email: string;
		password: string;
	}): Promise<string> {
		const response = await request(app)
			.post("/auth/login")
			.send({
				email: user.email,
				password: user.password,
			})
			.expect(200);

		return response.body.data.token;
	}

	describe("Authentication with Seeded Users", () => {
		it("should login John Doe successfully", async () => {
			const response = await request(app)
				.post("/auth/login")
				.send({
					email: JOHN_DOE.email,
					password: TEST_PASSWORD,
				})
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.user.name).toBe("John Doe");
			expect(response.body.data.user.email).toBe("john.doe@example.com");
			expect(response.body.data.token).toBeDefined();
		});

		it("should login Jane Smith successfully", async () => {
			const response = await request(app)
				.post("/auth/login")
				.send({
					email: JANE_SMITH.email,
					password: TEST_PASSWORD,
				})
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.user.name).toBe("Jane Smith");
			expect(response.body.data.user.email).toBe("jane.smith@example.com");
		});

		it("should login Bob Wilson successfully", async () => {
			const response = await request(app)
				.post("/auth/login")
				.send({
					email: BOB_WILSON.email,
					password: TEST_PASSWORD,
				})
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.user.name).toBe("Bob Wilson");
			expect(response.body.data.user.email).toBe("bob.wilson@example.com");
		});
	});

	describe("Project Access with Seeded Data", () => {
		it("should allow John to access his E-commerce Platform project", async () => {
			const response = await request(app)
				.get(`/api/projects/${createdProjects.ecommerce}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.title).toBe("E-commerce Platform");
			expect(response.body.data.description).toContain(
				"modern e-commerce platform",
			);
		});

		it("should allow John to access his Mobile Banking App project", async () => {
			const response = await request(app)
				.get(`/api/projects/${createdProjects.banking}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.title).toBe("Mobile Banking App");
			expect(response.body.data.description).toContain(
				"mobile banking application",
			);
		});

		it("should allow Jane to access her Learning Management System project", async () => {
			const response = await request(app)
				.get(`/api/projects/${createdProjects.lms}`)
				.set("Authorization", `Bearer ${janeToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.title).toBe("Learning Management System");
			expect(response.body.data.description).toContain("Comprehensive LMS");
		});
	});

	describe("Project Listing with Seeded Data", () => {
		it("should return all projects publicly (no authentication required)", async () => {
			// Test without any authentication token - should work and return all projects
			const publicResponse = await request(app)
				.get("/api/projects")
				.expect(200);

			expect(publicResponse.body.success).toBe(true);
			expect(publicResponse.body.data).toHaveLength(5); // All 5 projects should be visible

			const publicTitles = publicResponse.body.data.map(
				(project: { title: string }) => project.title,
			);
			expect(publicTitles).toContain("E-commerce Platform");
			expect(publicTitles).toContain("Mobile Banking App");
			expect(publicTitles).toContain("Learning Management System");
			expect(publicTitles).toContain("IoT Dashboard");
			expect(publicTitles).toContain("AI Content Generator");
		});

		it("should return all projects with authentication as well", async () => {
			// Test with authentication token - should also work and return same data
			const authenticatedResponse = await request(app)
				.get("/api/projects")
				.set("Authorization", `Bearer ${johnToken}`)
				.expect(200);

			expect(authenticatedResponse.body.success).toBe(true);
			expect(authenticatedResponse.body.data).toHaveLength(5); // Same 5 projects

			const authTitles = authenticatedResponse.body.data.map(
				(project: { title: string }) => project.title,
			);
			expect(authTitles).toContain("E-commerce Platform");
			expect(authTitles).toContain("Mobile Banking App");
			expect(authTitles).toContain("Learning Management System");
			expect(authTitles).toContain("IoT Dashboard");
			expect(authTitles).toContain("AI Content Generator");
		});
	});

	describe("Task Management with Seeded Data", () => {
		it("should return tasks for John's E-commerce project", async () => {
			const response = await request(app)
				.get(`/api/projects/${createdProjects.ecommerce}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.tasks).toHaveLength(5); // E-commerce has 5 tasks

			const taskTitles = response.body.data.tasks.map(
				(task: { title: string }) => task.title,
			);
			expect(taskTitles).toContain("Design User Authentication System");
			expect(taskTitles).toContain("Build Product Catalog");
			expect(taskTitles).toContain("Implement Shopping Cart");
			expect(taskTitles).toContain("Payment Gateway Integration");
			expect(taskTitles).toContain("Order Management System");
		});

		it("should return tasks with different statuses", async () => {
			const response = await request(app)
				.get(`/api/projects/${createdProjects.ecommerce}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.expect(200);

			const tasks = response.body.data.tasks;
			const statuses = tasks.map((task: { status: string }) => task.status);

			expect(statuses).toContain("done");
			expect(statuses).toContain("in_progress");
			expect(statuses).toContain("todo");
		});
	});

	describe("Project Updates with Seeded Data", () => {
		it("should allow John to update his E-commerce project", async () => {
			const updateData = {
				title: "Updated E-commerce Platform",
				description: "Updated description for the e-commerce platform",
				tags: ["e-commerce", "web", "react", "nodejs", "updated"],
			};

			const response = await request(app)
				.put(`/api/projects/${createdProjects.ecommerce}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.send(updateData)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.title).toBe("Updated E-commerce Platform");
		});
	});

	describe("Task Status Workflow with Seeded Data", () => {
		let ecommerceTaskId: string;

		beforeAll(async () => {
			// Get a task from John's E-commerce project
			const response = await request(app)
				.get(`/api/projects/${createdProjects.ecommerce}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.expect(200);

			const todoTask = response.body.data.tasks.find(
				(task: { status: string }) => task.status === "todo",
			);
			ecommerceTaskId = todoTask.id;
		});

		it("should update task status from todo to in_progress", async () => {
			const updateData = {
				status: "in_progress",
			};

			const response = await request(app)
				.put(`/api/tasks/${ecommerceTaskId}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.send(updateData)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.status).toBe("in_progress");
		});

		it("should update task status from in_progress to done", async () => {
			const updateData = {
				status: "done",
			};

			const response = await request(app)
				.put(`/api/tasks/${ecommerceTaskId}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.send(updateData)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.status).toBe("done");
		});
	});
});
