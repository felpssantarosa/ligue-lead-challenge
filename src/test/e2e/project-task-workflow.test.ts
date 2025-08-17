import type { Application } from "express";
import request from "supertest";
import { createApp } from "@/shared/infra/http/app";
import { setupE2EContainer } from "./config/container";
import { cleanTestDatabase, teardownTestDatabase } from "./config/database";
import "reflect-metadata";

describe("E2E: Complete Project and Task Management Workflow", () => {
	let app: Application;

	beforeAll(async () => {
		await setupE2EContainer();
		app = createApp();
	});

	afterAll(async () => {
		// Clean up test database
		await teardownTestDatabase();
	});

	beforeEach(async () => {
		// Clean database before each test
		await cleanTestDatabase();
	});

	describe("Complete Project and Task Lifecycle", () => {
		it("should handle full project lifecycle with tasks using Sequelize database", async () => {
			// Step 1: Create a project
			const initialProjectData = {
				title: "Initial Project",
				description: "A project for E2E testing with Sequelize",
				tags: ["e2e", "test", "sequelize"],
			};

			const createProjectResponse = await request(app)
				.post("/api/projects")
				.send(initialProjectData)
				.expect(201);

			expect(createProjectResponse.body.success).toBe(true);
			expect(createProjectResponse.body.data.title).toBe(
				initialProjectData.title,
			);
			const projectId = createProjectResponse.body.data.id;
			expect(projectId).toBeDefined();
			expect(createProjectResponse.body.data.tags).toEqual(
				expect.arrayContaining(["e2e", "test", "sequelize"]),
			);

			// Step 2: Change project name to "React Website"
			const updatedProjectData = {
				title: "React Website",
				description: "A React website project for E2E testing",
				tags: ["e2e", "test", "react"],
			};

			const updateProjectResponse = await request(app)
				.put(`/api/projects/${projectId}`)
				.send(updatedProjectData)
				.expect(200);

			expect(updateProjectResponse.body.success).toBe(true);
			expect(updateProjectResponse.body.data.title).toBe("React Website");
			expect(updateProjectResponse.body.data.description).toBe(
				"A React website project for E2E testing",
			);
			expect(updateProjectResponse.body.data.tags).toEqual(
				expect.arrayContaining(["e2e", "test", "react"]),
			);

			// Step 3: Create first task "Create Initial Configuration"
			const firstTaskData = {
				title: "Create Initial Configuration",
				description: "Set up the initial project configuration for React",
				status: "todo",
			};

			const createFirstTaskResponse = await request(app)
				.post(`/api/projects/${projectId}/tasks`)
				.send(firstTaskData)
				.expect(201);

			expect(createFirstTaskResponse.body.success).toBe(true);
			expect(createFirstTaskResponse.body.data.title).toBe(firstTaskData.title);
			expect(createFirstTaskResponse.body.data.description).toBe(
				firstTaskData.description,
			);
			expect(createFirstTaskResponse.body.data.projectId).toBe(projectId);
			expect(createFirstTaskResponse.body.data.status).toBe("todo");
			const firstTaskId = createFirstTaskResponse.body.data.id;
			expect(firstTaskId).toBeDefined();

			// Step 4: Create second task "Deploy"
			const secondTaskData = {
				title: "Deploy",
				description: "Deploy the React application to production",
				status: "todo",
			};

			const createSecondTaskResponse = await request(app)
				.post(`/api/projects/${projectId}/tasks`)
				.send(secondTaskData)
				.expect(201);

			expect(createSecondTaskResponse.body.success).toBe(true);
			expect(createSecondTaskResponse.body.data.title).toBe(
				secondTaskData.title,
			);
			expect(createSecondTaskResponse.body.data.description).toBe(
				secondTaskData.description,
			);
			expect(createSecondTaskResponse.body.data.projectId).toBe(projectId);
			expect(createSecondTaskResponse.body.data.status).toBe("todo");
			const secondTaskId = createSecondTaskResponse.body.data.id;
			expect(secondTaskId).toBeDefined();

			// Step 5: Get project data and verify tasks are associated
			const getProjectWithTasksResponse = await request(app)
				.get(`/api/projects/${projectId}`)
				.expect(200);

			expect(getProjectWithTasksResponse.body.success).toBe(true);
			expect(getProjectWithTasksResponse.body.data.title).toBe("React Website");
			expect(getProjectWithTasksResponse.body.data.tasks).toHaveLength(2);

			const tasks = getProjectWithTasksResponse.body.data.tasks;
			expect(tasks).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						id: firstTaskId,
						title: "Create Initial Configuration",
						projectId: projectId,
						status: "todo",
					}),
					expect.objectContaining({
						id: secondTaskId,
						title: "Deploy",
						projectId: projectId,
						status: "todo",
					}),
				]),
			);

			// Step 6: Update first task status to "in_progress"
			const updateTaskData = {
				status: "in_progress",
				description: "Currently setting up the initial React configuration",
			};

			const updateTaskResponse = await request(app)
				.put(`/api/tasks/${firstTaskId}`)
				.send(updateTaskData)
				.expect(200);

			expect(updateTaskResponse.body.success).toBe(true);
			expect(updateTaskResponse.body.data.status).toBe("in_progress");
			expect(updateTaskResponse.body.data.description).toBe(
				"Currently setting up the initial React configuration",
			);
			expect(updateTaskResponse.body.data.title).toBe(
				"Create Initial Configuration",
			); // Should remain unchanged

			// Step 7: Delete the first task
			await request(app).delete(`/api/tasks/${firstTaskId}`).expect(204);

			// Step 8: Verify first task is deleted and project-task relationship is updated
			const getProjectAfterDeletionResponse = await request(app)
				.get(`/api/projects/${projectId}`)
				.expect(200);

			expect(getProjectAfterDeletionResponse.body.success).toBe(true);
			expect(getProjectAfterDeletionResponse.body.data.title).toBe(
				"React Website",
			);
			expect(getProjectAfterDeletionResponse.body.data.tasks).toHaveLength(1);

			const remainingTasks = getProjectAfterDeletionResponse.body.data.tasks;
			expect(remainingTasks[0]).toEqual(
				expect.objectContaining({
					id: secondTaskId,
					title: "Deploy",
					projectId: projectId,
					status: "todo",
				}),
			);

			// Verify first task is completely removed
			expect(
				remainingTasks.some((task: { id: string }) => task.id === firstTaskId),
			).toBe(false);

			// Step 9: Verify deleted task cannot be retrieved directly
			const getDeletedTaskResponse = await request(app)
				.get(`/api/tasks/${firstTaskId}`)
				.expect(404);

			expect(getDeletedTaskResponse.body.error.type).toBe("NOT_FOUND");
			expect(getDeletedTaskResponse.body.error.resourceType).toBe("Task");
			expect(getDeletedTaskResponse.body.error.resourceId).toBe(firstTaskId);

			// Step 10: Delete the entire project
			await request(app).delete(`/api/projects/${projectId}`).expect(204);

			// Step 11: Verify project is deleted and all associated tasks are cleaned up
			const getDeletedProjectResponse = await request(app)
				.get(`/api/projects/${projectId}`)
				.expect(404);

			expect(getDeletedProjectResponse.body.error.type).toBe("NOT_FOUND");
			expect(getDeletedProjectResponse.body.error.resourceType).toBe("Project");
			expect(getDeletedProjectResponse.body.error.resourceId).toBe(projectId);

			// Step 12: Verify remaining task is also deleted when project is deleted
			const getRemainingTaskResponse = await request(app)
				.get(`/api/tasks/${secondTaskId}`)
				.expect(404);

			expect(getRemainingTaskResponse.body.error.type).toBe("NOT_FOUND");
			expect(getRemainingTaskResponse.body.error.resourceType).toBe("Task");
			expect(getRemainingTaskResponse.body.error.resourceId).toBe(secondTaskId);
		});

		it("should handle edge cases and validations", async () => {
			// Test creating project with invalid data
			const invalidProjectData = {
				description: "A project without title",
				tags: ["test"],
			};

			const invalidProjectResponse = await request(app)
				.post("/api/projects")
				.send(invalidProjectData)
				.expect(400);

			expect(invalidProjectResponse.body.success).toBe(false);
			expect(invalidProjectResponse.body.error.type).toBe("VALIDATION_ERROR");
			expect(invalidProjectResponse.body.error.field).toBe("title");

			// Test creating task for non-existent project
			const validTaskData = {
				title: "Test Task",
				description: "A test task",
				status: "todo",
			};

			const nonExistentProjectId = "550e8400-e29b-41d4-a716-446655440000"; // Valid UUID format but non-existent
			const invalidTaskResponse = await request(app)
				.post(`/api/projects/${nonExistentProjectId}/tasks`)
				.send(validTaskData)
				.expect(404);

			expect(invalidTaskResponse.body.success).toBe(false);
			expect(invalidTaskResponse.body.error.type).toBe("NOT_FOUND");
			expect(invalidTaskResponse.body.error.resourceType).toBe("Project");
		});

		it("should persist data across multiple requests (database persistence test)", async () => {
			// Create a project
			const projectData = {
				title: "Persistence Test Project",
				description: "Testing data persistence across requests",
				tags: ["persistence", "test"],
			};

			const createResponse = await request(app)
				.post("/api/projects")
				.send(projectData)
				.expect(201);

			const projectId = createResponse.body.data.id;

			// Make multiple requests to verify data persists
			for (let i = 0; i < 3; i++) {
				const getResponse = await request(app)
					.get(`/api/projects/${projectId}`)
					.expect(200);

				expect(getResponse.body.data.title).toBe("Persistence Test Project");
				expect(getResponse.body.data.id).toBe(projectId);
			}

			// Clean up
			await request(app).delete(`/api/projects/${projectId}`).expect(204);
		});
	});
});
