import type { Application } from "express";
import request from "supertest";
import { createApp } from "@/shared/infra/http/app";
import { generateUUID } from "../factories/UUIDFactory";
import "reflect-metadata";
import {
	cleanupIntegrationContainer,
	setupIntegrationContainer,
} from "./setup/container";
import { cleanTestDatabase, closeTestDatabase } from "./setup/database";

describe("Projects API Integration", () => {
	let app: Application;
	let authToken: string;

	beforeAll(async () => {
		await setupIntegrationContainer();
		app = createApp();
	});

	afterAll(async () => {
		cleanupIntegrationContainer();
		await closeTestDatabase();
	});

	beforeEach(async () => {
		await cleanTestDatabase();

		const testUser = {
			email: "test@example.com",
			password: "testpassword123",
			name: "Test User",
		};

		await request(app).post("/auth/register").send(testUser).expect(201);

		const loginResponse = await request(app)
			.post("/auth/login")
			.send({
				email: testUser.email,
				password: testUser.password,
			})
			.expect(200);

		authToken = loginResponse.body.data.token;
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
				.set("Authorization", `Bearer ${authToken}`)
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
				.set("Authorization", `Bearer ${authToken}`)
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
				.set("Authorization", `Bearer ${authToken}`)
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
