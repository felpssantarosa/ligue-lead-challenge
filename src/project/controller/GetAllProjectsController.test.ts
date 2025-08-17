import type { Request, Response } from "express";
import type { GetAllProjectsController } from "@/project/controller";
import type { GetAllProjectsService } from "@/project/service";
import { ValidationError } from "@/shared/Errors/ValidationError";
import {
	mockGetAllProjectsController,
	mockGetAllProjectsService,
	mockRequest,
	mockResponse,
	mockValidation,
} from "@/test/mocks";
import {
	cleanupTestValidation,
	setupTestValidation,
} from "@/test/setup/validation";

describe("GetAllProjectsController", () => {
	let getAllController: GetAllProjectsController;
	let getAllService: GetAllProjectsService & { execute: jest.Mock };

	beforeEach(() => {
		setupTestValidation();
		getAllController = mockGetAllProjectsController;
		getAllService = mockGetAllProjectsService;

		mockValidation.execute.mockReset();
	});

	afterEach(() => {
		cleanupTestValidation();
	});

	describe("handle", () => {
		it("should get all projects with pagination", async () => {
			const mockResult = {
				projects: [
					{
						id: "1",
						title: "Project 1",
						description: "Description 1",
						tags: ["tag1"],
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					{
						id: "2",
						title: "Project 2",
						description: "Description 2",
						tags: ["tag2"],
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
				total: 2,
			};

			mockRequest.query = { page: "1", limit: "10" };

			mockValidation.execute.mockReturnValue({
				page: 1,
				limit: 10,
				tags: [],
			});
			getAllService.execute.mockResolvedValue(mockResult);

			await getAllController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(getAllService.execute).toHaveBeenCalledWith({
				page: 1,
				limit: 10,
			});
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: mockResult.projects,
				meta: {
					total: mockResult.total,
					page: 1,
					limit: 10,
					hasNextPage: false,
				},
			});
		});

		it("should handle invalid pagination parameters", async () => {
			mockRequest.query = { page: "invalid" };

			mockValidation.execute.mockImplementation(() => {
				throw new ValidationError({
					message:
						"page has invalid format. Expected: Expected number, received nan",
					field: "page",
					value: { page: "invalid" },
					trace: "GetAllProjectsController.handle",
				});
			});

			await getAllController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "VALIDATION_ERROR",
					message:
						"[GetAllProjectsController.handle] Validation Error: page has invalid format. Expected: Expected number, received nan",
					field: "page",
					value: { page: "invalid" },
				},
			});
		});

		it("should handle search and tags parameters", async () => {
			const mockResult = {
				projects: [
					{
						id: "1",
						title: "Test Project",
						description: "Test Description",
						tags: ["react", "typescript"],
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
				total: 1,
			};

			mockRequest.query = {
				search: "Test",
				tags: "react,typescript",
				page: "1",
				limit: "5",
			};

			mockValidation.execute.mockReturnValue({
				search: "Test",
				tags: ["react", "typescript"],
				page: 1,
				limit: 5,
			});

			getAllService.execute.mockResolvedValue(mockResult);

			await getAllController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(getAllService.execute).toHaveBeenCalledWith({
				search: "Test",
				tags: ["react", "typescript"],
				page: 1,
				limit: 5,
			});
			expect(mockResponse.status).toHaveBeenCalledWith(200);
		});

		it("should handle default pagination when no parameters provided", async () => {
			const mockResult = {
				projects: [],
				total: 0,
			};

			mockRequest.query = {};

			mockValidation.execute.mockReturnValue({
				page: 1,
				limit: 10,
				tags: [],
			});

			getAllService.execute.mockResolvedValue(mockResult);

			await getAllController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(getAllService.execute).toHaveBeenCalledWith({
				page: 1,
				limit: 10,
			});
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: [],
				meta: {
					total: 0,
					page: 1,
					limit: 10,
					hasNextPage: false,
				},
			});
		});

		it("should handle limit exceeding maximum allowed", async () => {
			mockRequest.query = { limit: "150" };

			mockValidation.execute.mockImplementation(() => {
				throw new ValidationError({
					message:
						"limit has invalid format. Expected: Limit must be between 1 and 100",
					field: "limit",
					value: { limit: "150" },
					trace: "GetAllProjectsController.handle",
				});
			});

			await getAllController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "VALIDATION_ERROR",
					message:
						"[GetAllProjectsController.handle] Validation Error: limit has invalid format. Expected: Limit must be between 1 and 100",
					field: "limit",
					value: { limit: "150" },
				},
			});
		});
	});
});
