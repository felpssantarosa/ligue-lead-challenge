import type { Request, Response } from "express";
import { container } from "tsyringe";
import { TaskStatus } from "@/shared/domain/TaskStatus";
import { NotFoundError, ValidationError } from "@/shared/Errors";
import type { GetTaskController } from "@/task/controller/GetTaskController";
import { Task } from "@/task/domain";
import {
	createTask,
	mockGetTaskController,
	mockGetTaskService,
	mockTaskValidation,
	mockRequest,
	mockResponse,
} from "@/test/mocks";
import { setupTestValidation } from "@/test/setup/validation";
import { generateUUID } from "@/test/factories";

describe("GetTaskController", () => {
	let getTaskController: GetTaskController;

	beforeEach(() => {
		setupTestValidation();
		getTaskController = mockGetTaskController;
		jest.clearAllMocks();
	});

	afterEach(() => {
		container.clearInstances();
	});

	describe("handle", () => {
		it("should get task successfully when task exists", async () => {
			const taskId = generateUUID();
			const task = createTask({
				id: taskId,
				title: "Test Task",
				description: "Test Description",
			});

			mockRequest.params = { id: taskId };
			mockTaskValidation.execute.mockReturnValue({ id: taskId });
			mockGetTaskService.execute.mockResolvedValue(task);

			await getTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockTaskValidation.execute).toHaveBeenCalledWith(
				"get-task",
				{ id: taskId },
				"GetTaskController.handle",
			);
			expect(mockGetTaskService.execute).toHaveBeenCalledWith({ id: taskId });
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: task,
			});
		});

		it("should handle missing id parameter", async () => {
			const validationError = new ValidationError({
				message: "Task ID is required",
				field: "id",
				value: undefined,
			});

			mockRequest.params = {};
			mockTaskValidation.execute.mockImplementation(() => {
				throw validationError;
			});

			await getTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockTaskValidation.execute).toHaveBeenCalledWith(
				"get-task",
				{},
				"GetTaskController.handle",
			);
			expect(mockGetTaskService.execute).not.toHaveBeenCalled();
			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "VALIDATION_ERROR",
					message: "[ValidationError] Validation Error: Task ID is required",
					field: "id",
					value: undefined,
				},
			});
		});

		it("should handle task not found error", async () => {
			const taskId = generateUUID();
			const notFoundError = NotFoundError.task(taskId);

			mockRequest.params = { id: taskId };
			mockTaskValidation.execute.mockReturnValue({ id: taskId });
			mockGetTaskService.execute.mockRejectedValue(notFoundError);

			await getTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockTaskValidation.execute).toHaveBeenCalledWith(
				"get-task",
				{ id: taskId },
				"GetTaskController.handle",
			);
			expect(mockGetTaskService.execute).toHaveBeenCalledWith({ id: taskId });
			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "NOT_FOUND",
					message: expect.stringContaining("Task"),
					resourceType: "Task",
					resourceId: taskId,
				},
			});
		});

		it("should handle validation errors", async () => {
			const invalidId = "invalid-id";
			const validationError = new ValidationError({
				message: "Invalid task ID format",
				field: "id",
				value: invalidId,
			});

			mockRequest.params = { id: invalidId };
			mockTaskValidation.execute.mockImplementation(() => {
				throw validationError;
			});

			await getTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockTaskValidation.execute).toHaveBeenCalledWith(
				"get-task",
				{ id: invalidId },
				"GetTaskController.handle",
			);
			expect(mockGetTaskService.execute).not.toHaveBeenCalled();
			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "VALIDATION_ERROR",
					message: "[ValidationError] Validation Error: Invalid task ID format",
					field: "id",
					value: invalidId,
				},
			});
		});

		it("should handle service errors gracefully", async () => {
			const taskId = generateUUID();
			const serviceError = new Error("Database connection failed");

			mockRequest.params = { id: taskId };
			mockTaskValidation.execute.mockReturnValue({ id: taskId });
			mockGetTaskService.execute.mockRejectedValue(serviceError);

			await getTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockTaskValidation.execute).toHaveBeenCalledWith(
				"get-task",
				{ id: taskId },
				"GetTaskController.handle",
			);
			expect(mockGetTaskService.execute).toHaveBeenCalledWith({ id: taskId });
			expect(mockResponse.status).toHaveBeenCalledWith(500);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "UNEXPECTED_ERROR",
					message: "An unexpected error occurred",
				},
			});
		});

		it("should handle empty task id parameter", async () => {
			const emptyId = "";
			const validationError = new ValidationError({
				message: "Invalid task ID format",
				field: "id",
				value: emptyId,
			});

			mockRequest.params = { id: emptyId };
			mockTaskValidation.execute.mockImplementation(() => {
				throw validationError;
			});

			await getTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockTaskValidation.execute).toHaveBeenCalledWith(
				"get-task",
				{ id: emptyId },
				"GetTaskController.handle",
			);
			expect(mockGetTaskService.execute).not.toHaveBeenCalled();
			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "VALIDATION_ERROR",
					message: "[ValidationError] Validation Error: Invalid task ID format",
					field: "id",
					value: emptyId,
				},
			});
		});

		it("should handle task service returning complex task object", async () => {
			const taskId = generateUUID();
			const complexTask = Task.fromJSON({
				id: taskId,
				title: "Complex Task with Special Characters !@#$%",
				description: "Multi-line description\\nwith special chars & symbols",
				status: TaskStatus.IN_PROGRESS,
				projectId: "project-id-456",
				createdAt: new Date("2023-01-01T10:00:00Z"),
				updatedAt: new Date("2023-01-02T15:30:00Z"),
			});

			mockRequest.params = { id: taskId };
			mockTaskValidation.execute.mockReturnValue({ id: taskId });
			mockGetTaskService.execute.mockResolvedValue(complexTask);

			await getTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockTaskValidation.execute).toHaveBeenCalledWith(
				"get-task",
				{ id: taskId },
				"GetTaskController.handle",
			);
			expect(mockGetTaskService.execute).toHaveBeenCalledWith({ id: taskId });
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: complexTask,
			});
		});
	});
});
