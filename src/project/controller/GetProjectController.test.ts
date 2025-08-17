import type { Request, Response } from "express";
import type { GetProjectController } from "@/project/controller";
import type { GetProjectService } from "@/project/service";
import { ValidationError } from "@/shared/Errors/ValidationError";
import { generateUUID } from "@/test/factories";
import {
	mockGetProjectController,
	mockGetProjectService,
	mockRequest,
	mockResponse,
	mockValidation,
} from "@/test/mocks";
import {
	cleanupTestValidation,
	setupTestValidation,
} from "@/test/setup/validation";

describe("GetProjectController", () => {
	let getController: GetProjectController;
	let getService: GetProjectService & { execute: jest.Mock };

	beforeEach(() => {
		setupTestValidation();
		getController = mockGetProjectController;
		getService = mockGetProjectService;

		mockValidation.execute.mockReset();
	});

	afterEach(() => {
		cleanupTestValidation();
	});

	describe("handle", () => {
		it("should get a project by id successfully", async () => {
			const projectId = generateUUID();
			const project = {
				id: projectId,
				title: "Test Project",
				description: "Test Description",
				tags: ["tag1"],
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRequest.params = { id: projectId };

			mockValidation.execute.mockReturnValue({ id: projectId });
			getService.execute.mockResolvedValue(project);

			await getController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(getService.execute).toHaveBeenCalledWith({ id: projectId });
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: project,
			});
		});

		it("should handle not found error", async () => {
			const projectId = generateUUID();
			mockRequest.params = { id: projectId };

			mockValidation.execute.mockReturnValue({ id: projectId });
			getService.execute.mockResolvedValue(null);

			await getController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "NOT_FOUND",
					message: `[GetProjectController.handle] Resource Not Found: Project with ID '${projectId}' was not found`,
					resourceType: "Project",
					resourceId: projectId,
				},
			});
		});

		it("should handle missing id parameter", async () => {
			mockRequest.params = {};

			mockValidation.execute.mockImplementation(() => {
				throw new ValidationError({
					message:
						"id has invalid format. Expected: Invalid input: expected string, received undefined",
					field: "id",
					value: {},
					trace: "GetProjectController.handle",
				});
			});

			await getController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "VALIDATION_ERROR",
					message:
						"[GetProjectController.handle] Validation Error: id has invalid format. Expected: Invalid input: expected string, received undefined",
					field: "id",
					value: {},
				},
			});
		});
	});
});
