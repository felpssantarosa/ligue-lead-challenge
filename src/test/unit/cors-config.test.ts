import { config } from "@/config/environment";

describe("CORS Configuration", () => {
	it("should have valid CORS configuration structure", () => {
		expect(config.cors).toBeDefined();
		expect(typeof config.cors.origin).toBe("string");
		expect(typeof config.cors.credentials).toBe("boolean");
		expect(typeof config.cors.methods).toBe("string");
		expect(typeof config.cors.allowedHeaders).toBe("string");
		expect(typeof config.cors.preflightContinue).toBe("boolean");
		expect(typeof config.cors.optionsSuccessStatus).toBe("number");
	});

	it("should have proper default values", () => {
		const originalEnv = process.env;

		delete process.env.CORS_ORIGIN;
		delete process.env.CORS_CREDENTIALS;
		delete process.env.CORS_METHODS;
		delete process.env.CORS_ALLOWED_HEADERS;

		jest.resetModules();
		const { config: freshConfig } = require("@/config/environment");

		expect(freshConfig.cors.origin).toBe("*");
		expect(freshConfig.cors.credentials).toBe(false);
		expect(freshConfig.cors.methods).toContain("GET");
		expect(freshConfig.cors.methods).toContain("POST");
		expect(freshConfig.cors.allowedHeaders).toContain("Content-Type");
		expect(freshConfig.cors.allowedHeaders).toContain("Authorization");
		expect(freshConfig.cors.optionsSuccessStatus).toBe(204);

		process.env = originalEnv;
	});

	it("should parse multiple origins correctly", () => {
		const multipleOrigins = "https://app1.com,https://app2.com";
		const origins = multipleOrigins.split(",");

		expect(origins).toHaveLength(2);
		expect(origins[0]).toBe("https://app1.com");
		expect(origins[1]).toBe("https://app2.com");
	});

	it("should parse methods correctly", () => {
		const methods = config.cors.methods.split(",");

		expect(methods).toContain("GET");
		expect(methods).toContain("POST");
		expect(methods).toContain("PUT");
		expect(methods).toContain("DELETE");
		expect(methods).toContain("OPTIONS");
	});

	it("should parse allowed headers correctly", () => {
		const headers = config.cors.allowedHeaders.split(",");

		expect(headers).toContain("Content-Type");
		expect(headers).toContain("Authorization");
		expect(headers).toContain("X-Requested-With");
	});
});
