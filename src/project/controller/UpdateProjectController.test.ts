import type { Request, Response } from "express";
import type { UpdateProjectController } from "@/project/controller/UpdateProjectController";
import type { UpdateProjectService } from "@/project/service/UpdateProjectService";
import { ValidationError } from "@/shared/Errors/ValidationError";
import { generateUuid } from "@/test/factories/UUIDFactory";
import { mockRequest, mockResponse } from "@/test/mocks/factories/HttpMock";
import {
	mockUpdateProjectController,
	mockUpdateService,
	mockValidation,
} from "@/test/mocks/factories/ProjectMock";
import {
	cleanupTestValidation,
	setupTestValidation,
} from "@/test/setup/validation";

describe("UpdateProjectController", () => {
	let updateController: UpdateProjectController;
	let updateService: UpdateProjectService & { execute: jest.Mock };

	beforeEach(() => {
		setupTestValidation();
		updateController = mockUpdateProjectController;
		updateService = mockUpdateService;

		mockValidation.execute.mockReset();
	});

	afterEach(() => {
		cleanupTestValidation();
	});

	describe("handle", () => {
		it("should update a project successfully", async () => {
			const projectId = generateUuid();
			const updateData = {
				title: "Updated Project",
				description: "Updated Description",
				tags: ["updated-tag"],
			};
			const updatedProject = {
				id: projectId,
				...updateData,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRequest.params = { id: projectId };
			mockRequest.body = updateData;

			mockValidation.execute
				.mockReturnValueOnce({ id: projectId })
				.mockReturnValueOnce(updateData);
			updateService.execute.mockResolvedValue(updatedProject);

			await updateController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(updateService.execute).toHaveBeenCalledWith({
				id: projectId,
				...updateData,
			});
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: updatedProject,
				message: "Project updated successfully",
			});
		});

		it("should handle partial updates", async () => {
			const projectId = generateUuid();
			const updateData = {
				title: "Updated Title Only",
			};
			const updatedProject = {
				id: projectId,
				title: updateData.title,
				description: "Original Description",
				tags: ["original-tag"],
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRequest.params = { id: projectId };
			mockRequest.body = updateData;

			mockValidation.execute
				.mockReturnValueOnce({ id: projectId })
				.mockReturnValueOnce(updateData);
			updateService.execute.mockResolvedValue(updatedProject);

			await updateController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(updateService.execute).toHaveBeenCalledWith({
				id: projectId,
				title: updateData.title,
			});
			expect(mockResponse.status).toHaveBeenCalledWith(200);
		});

		it("should handle missing id parameter", async () => {
			mockRequest.params = {};
			mockRequest.body = { title: "Test" };

			mockValidation.execute.mockImplementation(() => {
				throw new ValidationError({
					message:
						"id has invalid format. Expected: Invalid input: expected string, received undefined",
					field: "id",
					value: {},
					trace: "UpdateProjectController.handle",
				});
			});

			await updateController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "VALIDATION_ERROR",
					message:
						"[UpdateProjectController.handle] Validation Error: id has invalid format. Expected: Invalid input: expected string, received undefined",
					field: "id",
					value: {},
				},
			});
		});

		it("should handle empty update data", async () => {
			const projectId = generateUuid();
			const updatedProject = {
				id: projectId,
				title: "Existing Title",
				description: "Existing Description",
				tags: ["existing-tag"],
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRequest.params = { id: projectId };
			mockRequest.body = {};

			mockValidation.execute
				.mockReturnValueOnce({ id: projectId })
				.mockReturnValueOnce({});

			updateService.execute.mockResolvedValue(updatedProject);

			await updateController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(updateService.execute).toHaveBeenCalledWith({
				id: projectId,
			});
			expect(mockResponse.status).toHaveBeenCalledWith(200);
		});

		it("should handle undefined values by excluding them", async () => {
			const projectId = generateUuid();
			const updateData = {
				title: "Updated Title",
				description: undefined,
				tags: ["new-tag"],
			};
			const updatedProject = {
				id: projectId,
				title: updateData.title,
				description: "Original Description",
				tags: updateData.tags,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRequest.params = { id: projectId };
			mockRequest.body = updateData;

			mockValidation.execute
				.mockReturnValueOnce({ id: projectId })
				.mockReturnValueOnce({
					title: updateData.title,
					tags: updateData.tags,
				});
			updateService.execute.mockResolvedValue(updatedProject);

			await updateController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(updateService.execute).toHaveBeenCalledWith({
				id: projectId,
				title: updateData.title,
				tags: updateData.tags,
			});

			expect(mockResponse.status).toHaveBeenCalledWith(200);
		});
	});
});
