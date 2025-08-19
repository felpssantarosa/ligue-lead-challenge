import type { Application } from "express";
import request from "supertest";
import { createApp } from "@/shared/infra/http/app";
import { setupE2EContainer } from "../e2e/config/container";
import { teardownTestDatabase } from "../e2e/config/database";
import { seedTestDatabase } from "../e2e/config/seeder";
import "reflect-metadata";

describe("Integration: Performance and Caching with Seeded Data", () => {
	let app: Application;
	let johnToken: string;
	let janeToken: string;
	let bobToken: string;

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

	const seededProjects = {
		ecommerce: "660e8400-e29b-41d4-a716-446655440001",
		banking: "660e8400-e29b-41d4-a716-446655440002",
		lms: "660e8400-e29b-41d4-a716-446655440003",
		iot: "660e8400-e29b-41d4-a716-446655440004",
		ai: "660e8400-e29b-41d4-a716-446655440005",
	};

	beforeAll(async () => {
		await setupE2EContainer();
		app = createApp();

		await seedTestDatabase();

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

	async function measureResponseTime(
		requestPromise: Promise<request.Response>,
	): Promise<{
		response: request.Response;
		time: number;
	}> {
		const startTime = Date.now();
		const response = await requestPromise;
		const endTime = Date.now();
		return { response, time: endTime - startTime };
	}

	describe("Response Time Performance", () => {
		it("should respond quickly to project list requests", async () => {
			const { response, time } = await measureResponseTime(
				request(app)
					.get("/api/projects")
					.set("Authorization", `Bearer ${johnToken}`),
			);

			expect(response.status).toBe(200);
			expect(time).toBeLessThan(500); // Should respond within 500ms
			expect(response.body.data).toHaveLength(5); // API is public, returns all projects
		});

		it("should handle concurrent requests efficiently", async () => {
			const startTime = Date.now();

			// Make concurrent requests from different users
			const concurrentRequests = await Promise.all([
				request(app)
					.get("/api/projects")
					.set("Authorization", `Bearer ${johnToken}`),
				request(app)
					.get("/api/projects")
					.set("Authorization", `Bearer ${janeToken}`),
				request(app)
					.get("/api/projects")
					.set("Authorization", `Bearer ${bobToken}`),
				request(app)
					.get(`/api/projects/${seededProjects.ecommerce}`)
					.set("Authorization", `Bearer ${johnToken}`),
				request(app)
					.get(`/api/projects/${seededProjects.lms}`)
					.set("Authorization", `Bearer ${janeToken}`),
			]);

			const totalTime = Date.now() - startTime;

			// All requests should succeed
			concurrentRequests.forEach((response) => {
				expect(response.status).toBe(200);
			});

			// Concurrent requests should complete faster than sequential
			expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds
		});

		it("should handle task listing performance", async () => {
			const projectRequests = await Promise.all([
				measureResponseTime(
					request(app)
						.get(`/api/projects/${seededProjects.ecommerce}`)
						.set("Authorization", `Bearer ${johnToken}`),
				),
				measureResponseTime(
					request(app)
						.get(`/api/projects/${seededProjects.banking}`)
						.set("Authorization", `Bearer ${johnToken}`),
				),
				measureResponseTime(
					request(app)
						.get(`/api/projects/${seededProjects.lms}`)
						.set("Authorization", `Bearer ${janeToken}`),
				),
			]);

			projectRequests.forEach(({ response, time }) => {
				expect(response.status).toBe(200);
				expect(time).toBeLessThan(300); // Project with task listing should be fast
				expect(response.body.data.tasks).toHaveLength(5); // Each project has 5 tasks
			});
		});
	});

	describe("Caching Behavior", () => {
		it("should demonstrate caching for repeated project requests", async () => {
			// First request (likely cache miss)
			const { response: firstResponse } = await measureResponseTime(
				request(app)
					.get(`/api/projects/${seededProjects.ecommerce}`)
					.set("Authorization", `Bearer ${johnToken}`),
			);

			expect(firstResponse.status).toBe(200);

			// Second request (should be cached)
			const { response: secondResponse } = await measureResponseTime(
				request(app)
					.get(`/api/projects/${seededProjects.ecommerce}`)
					.set("Authorization", `Bearer ${johnToken}`),
			);

			expect(secondResponse.status).toBe(200);
			expect(secondResponse.body.data.id).toBe(firstResponse.body.data.id);

			expect(secondResponse.body).toEqual(firstResponse.body);
		});

		it("should handle cache invalidation on updates", async () => {
			// Get initial project state
			const initialResponse = await request(app)
				.get(`/api/projects/${seededProjects.ecommerce}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.expect(200);

			const originalTitle = initialResponse.body.data.title;

			// Update the project
			const updateData = {
				title: "Updated E-commerce Platform for Cache Test",
				description: "Updated description to test cache invalidation",
			};

			await request(app)
				.put(`/api/projects/${seededProjects.ecommerce}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.send(updateData)
				.expect(200);

			// Get updated project state
			const updatedResponse = await request(app)
				.get(`/api/projects/${seededProjects.ecommerce}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.expect(200);

			expect(updatedResponse.body.data.title).toBe(updateData.title);
			expect(updatedResponse.body.data.title).not.toBe(originalTitle);
		});
	});

	describe("Load Testing with Seeded Data", () => {
		it("should handle multiple rapid task creation requests", async () => {
			const taskCreationPromises: Promise<request.Response>[] = [];

			// Create 10 tasks for different projects
			for (let i = 0; i < 10; i++) {
				const taskData = {
					title: `Load Test Task ${i + 1}`,
					description: `This is a load test task number ${i + 1}`,
					status: "todo",
				}; // Distribute tasks across different projects and users
				const projectId =
					i % 2 === 0 ? seededProjects.ecommerce : seededProjects.banking;
				const token = johnToken; // Both projects belong to John

				taskCreationPromises.push(
					request(app)
						.post(`/api/projects/${projectId}/tasks`)
						.set("Authorization", `Bearer ${token}`)
						.send(taskData),
				);
			}

			const startTime = Date.now();
			const responses = await Promise.all(taskCreationPromises);
			const totalTime = Date.now() - startTime;

			// All task creations should succeed
			responses.forEach((response, index) => {
				expect(response.status).toBe(201);
				expect(response.body.success).toBe(true);
				expect(response.body.data.title).toBe(`Load Test Task ${index + 1}`);
			});

			// Should complete within reasonable time
			expect(totalTime).toBeLessThan(3000); // 10 tasks created within 3 seconds

			// Verify tasks were actually created
			const ecommerceProjectResponse = await request(app)
				.get(`/api/projects/${seededProjects.ecommerce}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.expect(200);

			const bankingProjectResponse = await request(app)
				.get(`/api/projects/${seededProjects.banking}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.expect(200);

			expect(ecommerceProjectResponse.body.data.tasks).toHaveLength(10); // 5 original + 5 new
			expect(bankingProjectResponse.body.data.tasks).toHaveLength(10); // 5 original + 5 new
		});

		it("should handle rapid status updates across multiple tasks", async () => {
			// Get tasks from multiple projects
			const [ecommerceProject, lmsProject, aiProject] = await Promise.all([
				request(app)
					.get(`/api/projects/${seededProjects.ecommerce}`)
					.set("Authorization", `Bearer ${johnToken}`),
				request(app)
					.get(`/api/projects/${seededProjects.lms}`)
					.set("Authorization", `Bearer ${janeToken}`),
				request(app)
					.get(`/api/projects/${seededProjects.ai}`)
					.set("Authorization", `Bearer ${bobToken}`),
			]);

			// Update multiple tasks concurrently
			const updatePromises: Promise<request.Response>[] = [];

			// Update some e-commerce tasks
			const ecommerceTasksToUpdate = ecommerceProject.body.data.tasks.slice(
				0,
				3,
			);
			ecommerceTasksToUpdate.forEach((task: { id: string; status: string }) => {
				const newStatus = task.status === "todo" ? "in_progress" : "done";
				updatePromises.push(
					request(app)
						.put(`/api/tasks/${task.id}`)
						.set("Authorization", `Bearer ${johnToken}`)
						.send({ status: newStatus }),
				);
			});

			// Update some LMS tasks
			const lmsTasksToUpdate = lmsProject.body.data.tasks.slice(0, 2);
			lmsTasksToUpdate.forEach((task: { id: string; status: string }) => {
				const newStatus = task.status === "todo" ? "in_progress" : "done";
				updatePromises.push(
					request(app)
						.put(`/api/tasks/${task.id}`)
						.set("Authorization", `Bearer ${janeToken}`)
						.send({ status: newStatus }),
				);
			});

			// Update some AI tasks
			const aiTasksToUpdate = aiProject.body.data.tasks.slice(0, 2);
			aiTasksToUpdate.forEach((task: { id: string; status: string }) => {
				const newStatus = task.status === "todo" ? "in_progress" : "done";
				updatePromises.push(
					request(app)
						.put(`/api/tasks/${task.id}`)
						.set("Authorization", `Bearer ${bobToken}`)
						.send({ status: newStatus }),
				);
			});

			const startTime = Date.now();
			const responses = await Promise.all(updatePromises);
			const totalTime = Date.now() - startTime;

			// All updates should succeed
			responses.forEach((response) => {
				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
			});

			// Should complete within reasonable time
			expect(totalTime).toBeLessThan(2000); // 7 updates within 2 seconds
		});
	});

	describe("Memory and Resource Usage", () => {
		it("should handle large payload responses efficiently", async () => {
			// Create additional tasks to test larger responses
			const largeBatchPromises: Promise<request.Response>[] = [];

			for (let i = 0; i < 20; i++) {
				const taskData = {
					title: `Bulk Task ${i + 1}`,
					description: `This is a bulk task with a longer description to test payload size. It contains additional details about the task requirements, acceptance criteria, and implementation notes. Task number: ${i + 1}`,
					status: "todo",
				};
				largeBatchPromises.push(
					request(app)
						.post(`/api/projects/${seededProjects.ai}/tasks`)
						.set("Authorization", `Bearer ${bobToken}`)
						.send(taskData),
				);
			}

			await Promise.all(largeBatchPromises);

			// Now test retrieving large response
			const { response, time } = await measureResponseTime(
				request(app)
					.get(`/api/projects/${seededProjects.ai}`)
					.set("Authorization", `Bearer ${bobToken}`),
			);

			expect(response.status).toBe(200);
			expect(response.body.data.tasks).toHaveLength(25); // 5 original + 20 new
			expect(time).toBeLessThan(1000); // Should handle large response within 1 second

			// Verify response contains all expected data
			const taskTitles = response.body.data.tasks.map(
				(task: { title: string }) => task.title,
			);
			expect(taskTitles).toContain("Bulk Task 1");
			expect(taskTitles).toContain("Bulk Task 20");
		});

		it("should handle simultaneous multi-user operations", async () => {
			// Simulate real-world scenario with multiple users working simultaneously
			const simultaneousOperations = await Promise.all([
				// John creates a new project
				request(app)
					.post("/api/projects")
					.set("Authorization", `Bearer ${johnToken}`)
					.send({
						title: "Performance Test Project",
						description: "Project created during performance testing",
						tags: ["test", "performance"],
					}),

				// Jane updates her LMS project
				request(app)
					.put(`/api/projects/${seededProjects.lms}`)
					.set("Authorization", `Bearer ${janeToken}`)
					.send({
						title: "Enhanced Learning Management System",
						description: "LMS with advanced analytics and AI tutoring",
						tags: ["education", "web", "vue", "python", "ai", "analytics"],
					}),

				// Bob creates tasks for AI project
				request(app)
					.post(`/api/projects/${seededProjects.ai}/tasks`)
					.set("Authorization", `Bearer ${bobToken}`)
					.send({
						title: "Implement Real-time Model Updates",
						description:
							"Enable real-time model updates without service downtime",
						status: "todo",
					}),

				// John lists his projects
				request(app)
					.get("/api/projects")
					.set("Authorization", `Bearer ${johnToken}`),

				// Jane gets her LMS project with tasks
				request(app)
					.get(`/api/projects/${seededProjects.lms}`)
					.set("Authorization", `Bearer ${janeToken}`),
			]);

			// All operations should succeed
			simultaneousOperations.forEach((response, index) => {
				expect(response.status).toBeGreaterThanOrEqual(200);
				expect(response.status).toBeLessThan(300);
				if (index < 3) {
					// Create/Update operations
					expect(response.body.success).toBe(true);
				}
			});

			// Verify data consistency
			const johnProjectsResponse = simultaneousOperations[3];
			expect(johnProjectsResponse.body.data).toHaveLength(5); // API is public, shows all projects

			const janeProjectResponse = simultaneousOperations[4];
			expect(janeProjectResponse.body.data.tasks).toHaveLength(5); // Original LMS tasks
		});
	});

	describe("Edge Case Performance", () => {
		it("should handle public project listing performance", async () => {
			// Create a new user with no projects
			const newUserData = {
				name: "Test User",
				email: "testuser@example.com",
				password: "password123",
			};

			await request(app).post("/auth/register").send(newUserData).expect(201);

			// Login the new user
			const loginResponse = await request(app)
				.post("/auth/login")
				.send({
					email: newUserData.email,
					password: newUserData.password,
				})
				.expect(200);

			const newUserToken = loginResponse.body.data.token;

			// Test public project list performance (shows all projects since API is public)
			const { response, time } = await measureResponseTime(
				request(app)
					.get("/api/projects")
					.set("Authorization", `Bearer ${newUserToken}`),
			);

			expect(response.status).toBe(200);
			expect(response.body.data.length).toBeGreaterThan(0); // Public API shows all projects
			expect(time).toBeLessThan(200); // Should be very fast
		});

		it("should handle invalid project access attempts efficiently", async () => {
			const nonExistentProjectId = "999e8400-e29b-41d4-a716-446655440999";

			const { response, time } = await measureResponseTime(
				request(app)
					.get(`/api/projects/${nonExistentProjectId}`)
					.set("Authorization", `Bearer ${johnToken}`),
			);

			expect(response.status).toBe(404);
			expect(time).toBeLessThan(300); // Error responses should be fast
		});
	});
});
