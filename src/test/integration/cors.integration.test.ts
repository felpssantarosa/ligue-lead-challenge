import type { Application } from "express";
import request from "supertest";
import { createApp } from "@/shared/infra/http/app";
import {
	cleanupIntegrationContainer,
	setupIntegrationContainer,
} from "../integration/setup/container";
import { closeTestDatabase } from "../integration/setup/database";
import "reflect-metadata";

describe("CORS Integration", () => {
	let app: Application;

	beforeAll(async () => {
		await setupIntegrationContainer();
		app = createApp();
	});

	afterAll(async () => {
		cleanupIntegrationContainer();
		await closeTestDatabase();
	});

	describe("CORS Headers", () => {
		it("should include CORS headers in responses", async () => {
			const response = await request(app)
				.get("/health")
				.set("Origin", "http://localhost:3001");

			expect(response.headers["access-control-allow-origin"]).toBeDefined();
			expect(response.status).toBe(200);
		});

		it("should handle preflight OPTIONS requests", async () => {
			const response = await request(app)
				.options("/health")
				.set("Origin", "http://localhost:3001")
				.set("Access-Control-Request-Method", "GET")
				.set("Access-Control-Request-Headers", "authorization");

			expect(response.status).toBe(204);
			expect(response.headers["access-control-allow-origin"]).toBeDefined();
			expect(response.headers["access-control-allow-methods"]).toBeDefined();
			expect(response.headers["access-control-allow-headers"]).toBeDefined();
		});

		it("should allow configured methods", async () => {
			const response = await request(app)
				.options("/auth/login")
				.set("Origin", "http://localhost:3001")
				.set("Access-Control-Request-Method", "POST");

			const allowedMethods = response.headers["access-control-allow-methods"];
			expect(allowedMethods).toContain("POST");
			expect(allowedMethods).toContain("GET");
			expect(allowedMethods).toContain("PUT");
			expect(allowedMethods).toContain("DELETE");
		});

		it("should allow configured headers", async () => {
			const response = await request(app)
				.options("/auth/login")
				.set("Origin", "http://localhost:3001")
				.set("Access-Control-Request-Headers", "authorization,content-type");

			const allowedHeaders = response.headers["access-control-allow-headers"];
			expect(allowedHeaders).toContain("Authorization");
			expect(allowedHeaders).toContain("Content-Type");
		});
	});

	describe("API Endpoints with CORS", () => {
		it("should allow cross-origin requests to health endpoint", async () => {
			const response = await request(app)
				.get("/health")
				.set("Origin", "http://localhost:3001");

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("status", "OK");
			expect(response.headers["access-control-allow-origin"]).toBeDefined();
		});

		it("should allow cross-origin requests to public endpoints", async () => {
			const response = await request(app)
				.get("/api/projects")
				.set("Origin", "http://localhost:3001");

			expect(response.status).toBe(200);
			expect(response.headers["access-control-allow-origin"]).toBeDefined();
		});
	});
});
