import type { Application } from "express";
import request from "supertest";
import { registerDependencies } from "@/shared/infra/container";
import { createApp } from "@/shared/infra/http/app";
import { generateUUID } from "../factories/UUIDFactory";
import "reflect-metadata";

describe("Projects API Integration", () => {
	let app: Application;

	beforeAll(() => {
		registerDependencies();
		app = createApp();
	});

	describe("POST /api/projects", () => {
		it("should create a project successfully", async () => {
			const projectData = {
				title: "Integration Test Project",
				description: "A project created during integration testing",
				tags: ["test", "integration"],
			};

			const response = await request(app)
				.post("/api/projects")
				.send(projectData)
				.expect(201);

			expect(response.body).toMatchObject({
				success: true,
				message: "Project created successfully",
				data: {
					title: projectData.title,
					description: projectData.description,
					tags: projectData.tags,
				},
			});
			expect(response.body.data.id).toBeDefined();
			expect(response.body.data.createdAt).toBeDefined();
			expect(response.body.data.updatedAt).toBeDefined();
		});

		it("should return 400 when title is missing", async () => {
			const projectData = {
				description: "A project without title",
				tags: ["test"],
			};

			const response = await request(app)
				.post("/api/projects")
				.send(projectData)
				.expect(400);

			expect(response.body.error).toMatchObject({
				type: "VALIDATION_ERROR",
				field: "title",
				message: expect.stringContaining("expected string, received undefined"),
			});
		});
	});

	describe("GET /api/projects/:id", () => {
		it("should return 404 for non-existent project", async () => {
			const nonExistentId = generateUUID();

			const response = await request(app)
				.get(`/api/projects/${nonExistentId}`)
				.expect(404);

			expect(response.body.error).toMatchObject({
				type: "NOT_FOUND",
				resourceType: "Project",
				resourceId: nonExistentId,
				message: expect.stringContaining("was not found"),
			});
		});
	});

	describe("GET /health", () => {
		it("should return health status", async () => {
			const response = await request(app).get("/health").expect(200);

			expect(response.body.status).toBe("OK");
			expect(response.body.timestamp).toBeDefined();
		});
	});

	describe("E2E Workflow: Complete Project and Task Management", () => {
		it("should handle complete project lifecycle with tasks", async () => {
			// Step 1: Create a project
			const initialProjectData = {
				title: "Initial Project",
				description: "A project for E2E testing",
				tags: ["e2e", "test"],
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

			// Step 2: Change project name to "React Website"
			const updatedProjectData = {
				title: "React Website",
				description: "A project for E2E testing",
				tags: ["e2e", "test"],
			};

			const updateProjectResponse = await request(app)
				.put(`/api/projects/${projectId}`)
				.send(updatedProjectData)
				.expect(200);

			expect(updateProjectResponse.body.success).toBe(true);
			expect(updateProjectResponse.body.data.title).toBe("React Website");

			// Step 3: Create first task "Create Initial Configuration"
			const firstTaskData = {
				title: "Create Initial Configuration",
				description: "Set up the initial project configuration",
				status: "todo",
			};

			const createFirstTaskResponse = await request(app)
				.post(`/api/projects/${projectId}/tasks`)
				.send(firstTaskData)
				.expect(201);

			expect(createFirstTaskResponse.body.success).toBe(true);
			expect(createFirstTaskResponse.body.data.title).toBe(firstTaskData.title);
			expect(createFirstTaskResponse.body.data.projectId).toBe(projectId);
			const firstTaskId = createFirstTaskResponse.body.data.id;
			expect(firstTaskId).toBeDefined();

			// Step 4: Create second task "Deploy"
			const secondTaskData = {
				title: "Deploy",
				description: "Deploy the application to production",
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
			expect(createSecondTaskResponse.body.data.projectId).toBe(projectId);
			const secondTaskId = createSecondTaskResponse.body.data.id;
			expect(secondTaskId).toBeDefined();

			// Step 5: Get project data and check if tasks are there
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
					}),
					expect.objectContaining({
						id: secondTaskId,
						title: "Deploy",
						projectId: projectId,
					}),
				]),
			);

			// Step 6: Delete the first task
			await request(app).delete(`/api/tasks/${firstTaskId}`).expect(204);

			// Step 7: Check project data again to verify first task is gone, second task remains
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
				}),
			);

			// Verify first task is not in the list
			expect(
				remainingTasks.some((task: { id: string }) => task.id === firstTaskId),
			).toBe(false);

			// Step 8: Delete the project
			await request(app).delete(`/api/projects/${projectId}`).expect(204);

			// Verify project is deleted by trying to get it (should return 404)
			const getDeletedProjectResponse = await request(app)
				.get(`/api/projects/${projectId}`)
				.expect(404);

			expect(getDeletedProjectResponse.body.error.type).toBe("NOT_FOUND");
			expect(getDeletedProjectResponse.body.error.resourceType).toBe("Project");
			expect(getDeletedProjectResponse.body.error.resourceId).toBe(projectId);
		});
	});
});
