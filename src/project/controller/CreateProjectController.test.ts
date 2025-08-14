import type { Request, Response } from "express";
import type { CreateProjectController } from "@/project/controller/CreateProjectController";
import type { CreateProjectService } from "@/project/service/CreateProjectService";
import { ValidationError } from "@/shared/Errors/ValidationError";
import { generateUuid } from "@/test/factories/UUIDFactory";
import { mockRequest, mockResponse } from "@/test/mocks/factories/HttpMock";
import {
	mockCreateProjectController,
	mockCreateService,
	mockValidation,
} from "@/test/mocks/factories/ProjectMock";
import {
	cleanupTestValidation,
	setupTestValidation,
} from "@/test/setup/validation";

describe("CreateProjectController", () => {
	let createController: CreateProjectController;
	let createService: CreateProjectService & { execute: jest.Mock };

	beforeEach(() => {
		setupTestValidation();
		createController = mockCreateProjectController;
		createService = mockCreateService;

		mockValidation.execute.mockReset();
	});

	afterEach(() => {
		cleanupTestValidation();
	});

	describe("handle", () => {
		it("should create a project successfully", async () => {
			const projectData = {
				title: "Test Project",
				description: "Test Description",
				tags: ["tag1", "tag2"],
			};
			const createdProject = {
				id: generateUuid(),
				...projectData,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRequest.body = projectData;
			mockValidation.execute.mockReturnValue(projectData);
			createService.execute.mockResolvedValue(createdProject);

			await createController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(createService.execute).toHaveBeenCalledWith(projectData);
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
				mockRequest as Request,
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
				id: generateUuid(),
				...expectedServiceCall,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockRequest.body = projectData;

			mockValidation.execute.mockReturnValue(expectedServiceCall);
			createService.execute.mockResolvedValue(createdProject);

			await createController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(createService.execute).toHaveBeenCalledWith(expectedServiceCall);
			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: createdProject,
				message: "Project created successfully",
			});
		});
	});
});
