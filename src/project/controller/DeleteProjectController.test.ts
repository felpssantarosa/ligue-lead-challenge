import type { Request, Response } from "express";
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

describe("DeleteProjectController", () => {
	let deleteController: typeof mockDeleteProjectController;
	let deleteService: typeof mockDeleteProjectService;

	beforeEach(() => {
		setupTestValidation();
		deleteController = mockDeleteProjectController;
		deleteService = mockDeleteProjectService;

		mockValidation.execute.mockReset();
	});

	afterEach(() => {
		cleanupTestValidation();
	});

	describe("delete", () => {
		it("should delete a project successfully", async () => {
			const projectId = generateUUID();
			const deleteResult = {
				id: projectId,
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
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(deleteService.execute).toHaveBeenCalledWith({
				id: projectId,
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
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(deleteService.execute).toHaveBeenCalledWith({
				id: projectId,
				force: true,
			});
		});
	});
});
