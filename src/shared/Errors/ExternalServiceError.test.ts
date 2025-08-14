import { ExternalServiceError } from "@/shared/Errors";

describe("ExternalServiceError", () => {
	it("should create an external service error for timeout", () => {
		const error = ExternalServiceError.timeout(
			"GitHub",
			"fetchRepositories",
			5000,
		);

		expect(error.name).toBe("ExternalServiceError");
		expect(error.httpCode).toBe(502);
		expect(error.serviceName).toBe("GitHub");
		expect(error.operation).toBe("fetchRepositories");
		expect(error.timeout).toBe(true);
	});

	it("should create a GitHub API error", () => {
		const error = ExternalServiceError.githubApiError(
			"fetchUser",
			403,
			"Rate limit exceeded",
		);

		expect(error.serviceName).toBe("GitHub");
		expect(error.operation).toBe("fetchUser");
		expect(error.statusCode).toBe(403);
		expect(error.responseBody).toBe("Rate limit exceeded");
	});
});
