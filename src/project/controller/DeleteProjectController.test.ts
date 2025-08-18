import type { Response } from "express";
import { generateUUID } from "@/test/factories/UUIDFactory";
import {
	mockDeleteProjectController,
	mockDeleteProjectService,
	mockRequest,
	mockResponse,
	mockValidation,
} from "@/test/mocks";
import {
	cleanupTestValidation,
	setupTestValidation,
} from "@/test/setup/validation";
import type { AuthenticatedRequest } from "@/user/infra/middleware/authMiddleware";

describe("DeleteProjectController", () => {
	let deleteController: typeof mockDeleteProjectController;
	let deleteService: typeof mockDeleteProjectService;

	beforeEach(() => {
		setupTestValidation();
		deleteController = mockDeleteProjectController;
		deleteService = mockDeleteProjectService;

		mockValidation.execute.mockReset();

		Object.assign(mockRequest, {
			user: {
				id: "test-user-id",
				email: "test@example.com",
				name: "Test User",
			},
		});
	});

	afterEach(() => {
		cleanupTestValidation();
	});

	describe("delete", () => {
		it("should delete a project successfully", async () => {
			const projectId = generateUUID();
			const deleteResult = {
				projectId: projectId,
				ownerId: "test-user-id",
				message: "Project deleted successfully",
				deletedAt: new Date(),
			};

			mockRequest.params = { id: projectId };
			mockRequest.query = {};

			mockValidation.execute
				.mockReturnValueOnce({ id: projectId })
				.mockReturnValueOnce({ force: false });
			deleteService.execute.mockResolvedValue(deleteResult);

			await deleteController.handle(
				mockRequest as AuthenticatedRequest,
				mockResponse as Response,
			);

			expect(deleteService.execute).toHaveBeenCalledWith({
				projectId: projectId,
				ownerId: "test-user-id",
				force: false,
			});
			expect(mockResponse.status).toHaveBeenCalledWith(204);
			expect(mockResponse.send).toHaveBeenCalledWith();
		});

		it("should handle force delete", async () => {
			const projectId = generateUUID();
			mockRequest.params = { id: projectId };
			mockRequest.query = { force: "true" };

			mockValidation.execute
				.mockReturnValueOnce({ id: projectId })
				.mockReturnValueOnce({ force: true });
			deleteService.execute.mockResolvedValue({
				success: true,
				message: "Project deleted successfully",
			});

			await deleteController.handle(
				mockRequest as AuthenticatedRequest,
				mockResponse as Response,
			);

			expect(deleteService.execute).toHaveBeenCalledWith({
				projectId: projectId,
				ownerId: "test-user-id",
				force: true,
			});
		});
	});
});
