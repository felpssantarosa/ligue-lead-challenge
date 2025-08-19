import type { Application } from "express";
import request from "supertest";
import { createApp } from "@/shared/infra/http/app";
import {
	BOB_WILSON,
	JANE_SMITH,
	JOHN_DOE,
	SEEDED_PROJECTS,
} from "../fixtures/seeded-data";
import { setupE2EContainer } from "./config/container";
import { teardownTestDatabase } from "./config/database";
import "reflect-metadata";

jest.unmock("axios");

describe("E2E: GitHub Integration with Seeded Projects", () => {
	let app: Application;
	let johnToken: string;
	let janeToken: string;
	let bobToken: string;
	const createdProjectIds: Record<string, string> = {};

	beforeAll(async () => {
		await setupE2EContainer();
		app = createApp();

		// Create seeded data
		await createSeededData();

		// Login all users
		johnToken = await loginUser(JOHN_DOE);
		janeToken = await loginUser(JANE_SMITH);
		bobToken = await loginUser(BOB_WILSON);
	}, 30000); // Increase timeout for setup

	afterAll(async () => {
		await teardownTestDatabase();
	});

	async function createSeededData(): Promise<void> {
		// Create users
		for (const userData of [JOHN_DOE, JANE_SMITH, BOB_WILSON]) {
			await request(app).post("/auth/register").send(userData);
		}

		// Login users to get tokens for project creation
		const johnLoginResponse = await request(app).post("/auth/login").send({
			email: JOHN_DOE.email,
			password: JOHN_DOE.password,
		});
		const tempJohnToken = johnLoginResponse.body.data.token;

		const janeLoginResponse = await request(app).post("/auth/login").send({
			email: JANE_SMITH.email,
			password: JANE_SMITH.password,
		});
		const tempJaneToken = janeLoginResponse.body.data.token;

		const bobLoginResponse = await request(app).post("/auth/login").send({
			email: BOB_WILSON.email,
			password: BOB_WILSON.password,
		});
		const tempBobToken = bobLoginResponse.body.data.token;

		// Create projects and store their IDs
		for (const projectData of SEEDED_PROJECTS) {
			let token: string;
			if (projectData.ownerId === "550e8400-e29b-41d4-a716-446655440001") {
				token = tempJohnToken;
			} else if (
				projectData.ownerId === "550e8400-e29b-41d4-a716-446655440002"
			) {
				token = tempJaneToken;
			} else {
				token = tempBobToken;
			}

			const response = await request(app)
				.post("/api/projects")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: projectData.title,
					description: projectData.description,
					tags: JSON.parse(projectData.tags),
				});

			if (response.status === 201) {
				createdProjectIds[projectData.title] = response.body.data.id;
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

	describe("GitHub Repository Integration", () => {
		describe("GitHub Repository Lookup", () => {
			it("should allow fetching GitHub repositories for project context", async () => {
				const ecommerceProjectId = createdProjectIds["E-commerce Platform"];
				expect(ecommerceProjectId).toBeDefined();

				// Test fetching GitHub repositories in the context of a project
				const response = await request(app)
					.get(`/api/projects/${ecommerceProjectId}/github/octocat`)
					.set("Authorization", `Bearer ${johnToken}`)
					.expect(200);

				expect(response.body.success).toBe(true);
				expect(Array.isArray(response.body.data.githubRepositories)).toBe(true);
				expect(response.body.data.githubRepositories.length).toBeGreaterThan(0);
				expect(response.body.data.githubRepositories[0]).toHaveProperty("name");
				expect(response.body.data.githubRepositories[0]).toHaveProperty("url");
			});

			it("should allow different users to fetch GitHub repositories", async () => {
				const lmsProjectId = createdProjectIds["Learning Management System"];
				expect(lmsProjectId).toBeDefined();

				const response = await request(app)
					.get(`/api/projects/${lmsProjectId}/github/octocat`)
					.set("Authorization", `Bearer ${janeToken}`)
					.expect(200);

				expect(response.body.success).toBe(true);
				expect(Array.isArray(response.body.data.githubRepositories)).toBe(true);
				expect(response.body.data.githubRepositories.length).toBeGreaterThan(0);
			});

			it("should handle GitHub repository lookup for AI project context", async () => {
				const aiProjectId = createdProjectIds["AI Content Generator"];
				expect(aiProjectId).toBeDefined();

				const response = await request(app)
					.get(`/api/projects/${aiProjectId}/github/octocat`)
					.set("Authorization", `Bearer ${bobToken}`)
					.expect(200);

				expect(response.body.success).toBe(true);
				expect(Array.isArray(response.body.data.githubRepositories)).toBe(true);
				expect(response.body.data.githubRepositories.length).toBeGreaterThan(0);
			});
		});

		describe("GitHub Integration Workflows", () => {
			it("should support GitHub repository lookups across different project types", async () => {
				const projects = await request(app)
					.get("/api/projects")
					.set("Authorization", `Bearer ${johnToken}`)
					.expect(200);

				expect(projects.body.data).toHaveLength(5);

				// Test GitHub repository lookup for the first project
				const firstProject = projects.body.data[0];
				const response = await request(app)
					.get(`/api/projects/${firstProject.id}/github/octocat`)
					.set("Authorization", `Bearer ${johnToken}`)
					.expect(200);

				expect(response.body.success).toBe(true);
				expect(Array.isArray(response.body.data.githubRepositories)).toBe(true);
				expect(response.body.data.githubRepositories.length).toBeGreaterThan(0);
			});

			it("should handle GitHub repository metadata correctly", async () => {
				const ecommerceProjectId = createdProjectIds["E-commerce Platform"];

				const response = await request(app)
					.get(`/api/projects/${ecommerceProjectId}/github/octocat`)
					.set("Authorization", `Bearer ${johnToken}`)
					.expect(200);

				const repositories = response.body.data.githubRepositories;
				expect(Array.isArray(repositories)).toBe(true);
				expect(repositories.length).toBeGreaterThan(0);
				expect(repositories[0]).toHaveProperty("name");
				expect(repositories[0]).toHaveProperty("url");
				expect(repositories[0]).toHaveProperty("description");
				expect(repositories[0]).toHaveProperty("language");
				expect(repositories[0]).toHaveProperty("starCount");
				expect(repositories[0]).toHaveProperty("forkCount");
			});
		});

		describe("GitHub Integration Error Handling", () => {
			it("should handle non-existent GitHub users", async () => {
				const ecommerceProjectId = createdProjectIds["E-commerce Platform"];

				await request(app)
					.get(
						`/api/projects/${ecommerceProjectId}/github/nonexistentuser123456789`,
					)
					.set("Authorization", `Bearer ${johnToken}`)
					.expect(404);
			});

			it("should handle non-existent projects in GitHub routes", async () => {
				const nonExistentProjectId = "00000000-0000-0000-0000-000000000000";

				await request(app)
					.get(`/api/projects/${nonExistentProjectId}/github/octocat`)
					.set("Authorization", `Bearer ${johnToken}`)
					.expect(404);
			});

			it("should require authentication for GitHub repository lookup", async () => {
				const ecommerceProjectId = createdProjectIds["E-commerce Platform"];

				await request(app)
					.get(`/api/projects/${ecommerceProjectId}/github/octocat`)
					.expect(401);
			});
		});
	});
});
