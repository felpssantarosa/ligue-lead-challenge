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

describe("E2E: Seeded Data Workflow Tests", () => {
	let app: Application;
	let johnToken: string;
	let janeToken: string;
	const createdProjectIds: Record<string, string> = {};

	beforeAll(async () => {
		await setupE2EContainer();
		app = createApp();

		// Create seeded data in test database
		await createSeededData();

		// Login all users to get their tokens
		johnToken = await loginUser(JOHN_DOE);
		janeToken = await loginUser(JANE_SMITH);
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
					tags: JSON.parse(projectData.tags), // Parse the JSON string to array
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

	describe("Authentication with Seeded Users", () => {
		it("should login John Doe successfully", async () => {
			const response = await request(app)
				.post("/auth/login")
				.send({
					email: JOHN_DOE.email,
					password: JOHN_DOE.password,
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
					password: JANE_SMITH.password,
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
					password: BOB_WILSON.password,
				})
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.user.name).toBe("Bob Wilson");
			expect(response.body.data.user.email).toBe("bob.wilson@example.com");
		});
	});

	describe("Project Listing with Seeded Data", () => {
		it("should return all projects publicly (no authentication required)", async () => {
			// Test without any authentication token - should work
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

			// Test with authentication token - should also work and return same data
			const authenticatedResponse = await request(app)
				.get("/api/projects")
				.set("Authorization", `Bearer ${johnToken}`)
				.expect(200);

			expect(authenticatedResponse.body.success).toBe(true);
			expect(authenticatedResponse.body.data).toHaveLength(5); // Same 5 projects
		});
	});

	describe("Project Updates with Owner Permissions", () => {
		it("should allow project owner to update their project", async () => {
			// First, get all projects
			const projectsResponse = await request(app)
				.get("/api/projects")
				.set("Authorization", `Bearer ${johnToken}`)
				.expect(200);

			// Find the E-commerce Platform project (created by John in seeded data)
			const ecommerceProject = projectsResponse.body.data.find(
				(p: { title: string; id: string }) => p.title === "E-commerce Platform",
			);

			expect(ecommerceProject).toBeDefined();

			const updateData = {
				title: "Updated E-commerce Platform",
				description:
					"Updated description for the e-commerce platform with new features",
				tags: ["e-commerce", "web", "react", "nodejs", "updated"],
			};

			const response = await request(app)
				.put(`/api/projects/${ecommerceProject.id}`)
				.set("Authorization", `Bearer ${johnToken}`)
				.send(updateData)
				.expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.data.title).toBe("Updated E-commerce Platform");
			expect(response.body.data.tags).toContain("updated");
		});

		it("should prevent non-owners from updating projects", async () => {
			// First, get all projects
			const projectsResponse = await request(app)
				.get("/api/projects")
				.set("Authorization", `Bearer ${johnToken}`)
				.expect(200);

			// Find the E-commerce Platform project (created by John, so Jane can't update it)
			const ecommerceProject = projectsResponse.body.data.find(
				(p: { title: string; id: string }) =>
					p.title === "E-commerce Platform" ||
					p.title === "Updated E-commerce Platform",
			);

			expect(ecommerceProject).toBeDefined();

			const updateData = {
				title: "Unauthorized Update",
				description: "This should not be allowed",
			};

			// Jane tries to update John's project - should fail
			await request(app)
				.put(`/api/projects/${ecommerceProject.id}`)
				.set("Authorization", `Bearer ${janeToken}`)
				.send(updateData)
				.expect(401);
		});
	});
});
