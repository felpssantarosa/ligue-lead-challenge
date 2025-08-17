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
	mockRequest,
	mockResponse,
} from "@/test/mocks";
import { setupTestValidation } from "@/test/setup/validation";

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
			const taskId = "task-id-123";
			const task = createTask({
				id: taskId,
				title: "Test Task",
				description: "Test Description",
			});

			mockRequest.params = { id: taskId };
			mockGetTaskService.execute.mockResolvedValue(task);

			await getTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockGetTaskService.execute).toHaveBeenCalledWith({ id: taskId });
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: task,
			});
		});

		it("should handle missing id parameter", async () => {
			const task = createTask({ id: "task-id" });
			mockRequest.params = {};
			mockGetTaskService.execute.mockResolvedValue(task);

			await getTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockGetTaskService.execute).toHaveBeenCalledWith({
				id: undefined,
			});
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: task,
			});
		});

		it("should handle task not found error", async () => {
			const taskId = "non-existent-task-id";
			const notFoundError = NotFoundError.task(taskId);

			mockRequest.params = { id: taskId };
			mockGetTaskService.execute.mockRejectedValue(notFoundError);

			await getTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
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
			mockGetTaskService.execute.mockRejectedValue(validationError);

			await getTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockGetTaskService.execute).toHaveBeenCalledWith({
				id: invalidId,
			});
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
			const taskId = "task-id-123";
			const serviceError = new Error("Database connection failed");

			mockRequest.params = { id: taskId };
			mockGetTaskService.execute.mockRejectedValue(serviceError);

			await getTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
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
			const task = createTask({ id: emptyId });
			mockRequest.params = { id: emptyId };
			mockGetTaskService.execute.mockResolvedValue(task);

			await getTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockGetTaskService.execute).toHaveBeenCalledWith({ id: emptyId });
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: task,
			});
		});

		it("should handle task service returning complex task object", async () => {
			const taskId = "complex-task-id";
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
			mockGetTaskService.execute.mockResolvedValue(complexTask);

			await getTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
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
