import type { Response } from "express";
import { GitHubIntegrationController } from "@/project/controller/GitHubIntegrationController";
import type { GitHubIntegrationService } from "@/project/service/github-integration/GitHubIntegrationService";
import { NotFoundError } from "@/shared/Errors";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { AuthenticatedRequest } from "@/user/infra/middleware/authMiddleware";

const mockGitHubIntegrationService = {
	execute: jest.fn(),
} as unknown as jest.Mocked<GitHubIntegrationService>;

const mockValidation = {
	execute: jest.fn(),
} as unknown as jest.Mocked<ValidationHandler>;

const mockResponse = {
	status: jest.fn().mockReturnThis(),
	json: jest.fn(),
} as unknown as jest.Mocked<Response>;

describe("GitHubIntegrationController", () => {
	let controller: GitHubIntegrationController;

	beforeEach(() => {
		controller = new GitHubIntegrationController(
			mockGitHubIntegrationService,
			mockValidation,
		);
		jest.clearAllMocks();
	});

	describe("handle", () => {
		const mockRequest = {
			params: {
				id: "123e4567-e89b-12d3-a456-426614174000",
				username: "testuser",
			},
			user: {
				id: "user-123",
				email: "test@example.com",
				name: "Test User",
			},
		} as unknown as AuthenticatedRequest;

		it("should successfully link GitHub repositories to project", async () => {
			const validatedParams = {
				id: "123e4567-e89b-12d3-a456-426614174000",
				username: "testuser",
			};
			const serviceResult = {
				projectId: "123e4567-e89b-12d3-a456-426614174000",
				githubRepositories: [
					{
						name: "test-repo",
						url: "https://github.com/testuser/test-repo",
						description: "A test repository",
						language: "TypeScript",
						starCount: 10,
						forkCount: 2,
						createdAt: new Date(),
					},
				],
			};

			mockValidation.execute.mockReturnValue(validatedParams);
			mockGitHubIntegrationService.execute.mockResolvedValue(serviceResult);

			await controller.handle(mockRequest, mockResponse);

			expect(mockValidation.execute).toHaveBeenCalledWith(
				"github-integration",
				mockRequest.params,
				"GitHubIntegrationController.handle",
			);
			expect(mockGitHubIntegrationService.execute).toHaveBeenCalledWith({
				projectId: validatedParams.id,
				username: validatedParams.username,
				userId: "user-123",
			});
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: {
					message: "Successfully linked 1 GitHub repositories to project",
					projectId: serviceResult.projectId,
					githubRepositories: serviceResult.githubRepositories,
				},
			});
		});

		it("should handle validation errors", async () => {
			const validationError = new Error("Invalid UUID");
			mockValidation.execute.mockImplementation(() => {
				throw validationError;
			});

			const handleErrorSpy = jest.spyOn(
				controller,
				"handleError" as keyof GitHubIntegrationController,
			);
			handleErrorSpy.mockImplementation(async () => {});

			await controller.handle(mockRequest, mockResponse);

			expect(handleErrorSpy).toHaveBeenCalledWith(
				validationError,
				mockResponse,
				"GitHubIntegrationController.handle",
			);
		});

		it("should handle service errors", async () => {
			const validatedParams = {
				id: "123e4567-e89b-12d3-a456-426614174000",
				username: "testuser",
			};
			const serviceError = NotFoundError.project(
				validatedParams.id,
				"GitHubIntegrationService.execute",
			);

			mockValidation.execute.mockReturnValue(validatedParams);
			mockGitHubIntegrationService.execute.mockRejectedValue(serviceError);

			const handleErrorSpy = jest.spyOn(
				controller,
				"handleError" as keyof GitHubIntegrationController,
			);
			handleErrorSpy.mockImplementation(async () => {});

			await controller.handle(mockRequest, mockResponse);

			expect(handleErrorSpy).toHaveBeenCalledWith(
				serviceError,
				mockResponse,
				"GitHubIntegrationController.handle",
			);
		});
	});
});
