import type { Application } from "express";
import request from "supertest";
import { registerDependencies } from "@/shared/infra/container";
import { createApp } from "@/shared/infra/http/app";
import { generateUuid } from "../factories/UUIDFactory";
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
			const nonExistentId = generateUuid();

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
});
