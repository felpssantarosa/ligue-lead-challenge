import type { Request, Response } from "express";
import { generateUuid } from "@/test/factories/UUIDFactory";
import { mockRequest, mockResponse } from "@/test/mocks/factories/HttpMock";
import {
	mockDeleteProjectController,
	mockDeleteService,
	mockValidation,
} from "@/test/mocks/factories/ProjectMock";
import {
	cleanupTestValidation,
	setupTestValidation,
} from "@/test/setup/validation";

describe("DeleteProjectController", () => {
	let deleteController: typeof mockDeleteProjectController;
	let deleteService: typeof mockDeleteService;

	beforeEach(() => {
		setupTestValidation();
		deleteController = mockDeleteProjectController;
		deleteService = mockDeleteService;

		mockValidation.execute.mockReset();
	});

	afterEach(() => {
		cleanupTestValidation();
	});

	describe("delete", () => {
		it("should delete a project successfully", async () => {
			const projectId = generateUuid();
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
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: deleteResult,
				message: deleteResult.message,
			});
		});

		it("should handle force delete", async () => {
			const projectId = generateUuid();
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
