import type { Response } from "express";
import type { CreateProjectController } from "@/project/controller";
import type { CreateProjectService } from "@/project/service";
import { ValidationError } from "@/shared/Errors/ValidationError";
import { generateUUID } from "@/test/factories/UUIDFactory";
import {
	mockCreateProjectController,
	mockCreateProjectService,
	mockRequest,
	mockResponse,
	mockValidation,
} from "@/test/mocks";
import {
	cleanupTestValidation,
	setupTestValidation,
} from "@/test/setup/validation";
import type { AuthenticatedRequest } from "@/user/infra/middleware/authMiddleware";

describe("CreateProjectController", () => {
	let createController: CreateProjectController;
	let createService: CreateProjectService & { execute: jest.Mock };

	beforeEach(() => {
		setupTestValidation();
		createController = mockCreateProjectController;
		createService = mockCreateProjectService;

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

	describe("handle", () => {
		it("should create a project successfully", async () => {
			const projectData = {
				title: "Test Project",
				ownerId: "test-user-id",
				description: "Test Description",
				tags: ["tag1", "tag2"],
			};
			const createdProject = {
				id: generateUUID(),
				...projectData,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRequest.body = projectData;

			mockValidation.execute.mockReturnValue(projectData);
			createService.execute.mockResolvedValue(createdProject);

			await createController.handle(
				mockRequest as AuthenticatedRequest,
				mockResponse as Response,
			);

			expect(createService.execute).toHaveBeenCalledWith({
				...projectData,
				ownerId: "test-user-id",
			});
			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: createdProject,
				message: "Project created successfully",
			});
		});

		it("should handle validation error when title is missing", async () => {
			mockRequest.body = { description: "Test Description" };

			mockValidation.execute.mockImplementation(() => {
				throw new ValidationError({
					message:
						"title has invalid format. Expected: Invalid input: expected string, received undefined",
					field: "title",
					value: { description: "Test Description" },
					trace: "CreateProjectController.handle",
				});
			});

			await createController.handle(
				mockRequest as AuthenticatedRequest,
				mockResponse as Response,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "VALIDATION_ERROR",
					message:
						"[CreateProjectController.handle] Validation Error: title has invalid format. Expected: Invalid input: expected string, received undefined",
					field: "title",
					value: { description: "Test Description" },
				},
			});
		});

		it("should handle empty title and description defaults", async () => {
			const projectData = {
				title: "Test Project",
			};
			const expectedServiceCall = {
				title: "Test Project",
				description: "",
				tags: [],
			};
			const createdProject = {
				id: generateUUID(),
				...expectedServiceCall,
				ownerId: "test-user-id",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRequest.body = projectData;

			mockValidation.execute.mockReturnValue(expectedServiceCall);
			createService.execute.mockResolvedValue(createdProject);

			await createController.handle(
				mockRequest as AuthenticatedRequest,
				mockResponse as Response,
			);

			expect(createService.execute).toHaveBeenCalledWith({
				...expectedServiceCall,
				ownerId: "test-user-id",
			});
			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: createdProject,
				message: "Project created successfully",
			});
		});
	});
});
