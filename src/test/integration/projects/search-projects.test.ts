import type { Application } from "express";
import request from "supertest";
import { createApp } from "@/shared/infra/http/app";
import "reflect-metadata";
import {
	cleanupIntegrationContainer,
	setupIntegrationContainer,
} from "../setup/container";
import { cleanTestDatabase, closeTestDatabase } from "../setup/database";

describe("GET /api/projects - Search and Filter Integration", () => {
	let app: Application;

	beforeAll(async () => {
		await setupIntegrationContainer();
		app = createApp();
	});

	afterAll(async () => {
		await cleanTestDatabase();
		await closeTestDatabase();
		await cleanupIntegrationContainer();
	});

	it("should handle search without MySQL syntax errors", async () => {
		const response = await request(app)
			.get("/api/projects?page=1&limit=3&search=teste")
			.expect(200);

		expect(response.body.success).toBe(true);
		expect(response.body.data).toBeInstanceOf(Array);
		expect(response.body.meta).toHaveProperty("total");
		expect(response.body.meta).toHaveProperty("page", 1);
		expect(response.body.meta).toHaveProperty("limit", 3);
	});

	it("should handle tags filtering without MySQL syntax errors", async () => {
		const response = await request(app)
			.get("/api/projects?page=1&limit=3&tags=nodejs")
			.expect(200);

		expect(response.body.success).toBe(true);
		expect(response.body.data).toBeInstanceOf(Array);
		expect(response.body.meta).toHaveProperty("total");
	});

	it("should handle combined search and tags without MySQL syntax errors", async () => {
		const response = await request(app)
			.get("/api/projects?page=1&limit=3&search=teste&tags=nodejs")
			.expect(200);

		expect(response.body.success).toBe(true);
		expect(response.body.data).toBeInstanceOf(Array);
		expect(response.body.meta).toHaveProperty("total");
	});

	it("should handle pagination without errors", async () => {
		const response = await request(app)
			.get("/api/projects?page=1&limit=5")
			.expect(200);

		expect(response.body.success).toBe(true);
		expect(response.body.data).toBeInstanceOf(Array);
		expect(response.body.meta.page).toBe(1);
		expect(response.body.meta.limit).toBe(5);
	});
});
