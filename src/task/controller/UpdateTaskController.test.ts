import type { Request, Response } from "express";
import { TaskStatus } from "@/shared/domain/TaskStatus";
import { NotFoundError, ValidationError } from "@/shared/Errors";
import type { UpdateTaskController } from "@/task/controller";
import {
	createTask,
	mockRequest,
	mockResponse,
	mockTaskValidation,
	mockUpdateTaskController,
	mockUpdateTaskService,
} from "@/test/mocks";

describe("UpdateTaskController", () => {
	let updateTaskController: UpdateTaskController;

	beforeEach(() => {
		updateTaskController = mockUpdateTaskController;

		jest.clearAllMocks();
	});

	describe("handle", () => {
		it("should update a task successfully", async () => {
			const taskId = "task-id-123";
			const updateData = {
				title: "Updated Task Title",
				description: "Updated description",
				status: TaskStatus.IN_PROGRESS,
			};
			const updatedTask = createTask({ id: taskId, ...updateData });

			mockRequest.params = { id: taskId };
			mockRequest.body = updateData;

			mockTaskValidation.execute
				.mockReturnValueOnce({ id: taskId })
				.mockReturnValueOnce(updateData);
			mockUpdateTaskService.execute.mockResolvedValue(updatedTask);

			await updateTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockTaskValidation.execute).toHaveBeenCalledTimes(2);
			expect(mockTaskValidation.execute).toHaveBeenNthCalledWith(
				1,
				"task-id",
				{ id: taskId },
				"UpdateTaskController.handle",
			);
			expect(mockTaskValidation.execute).toHaveBeenNthCalledWith(
				2,
				"update-task",
				updateData,
				"UpdateTaskController.handle",
			);
			expect(mockUpdateTaskService.execute).toHaveBeenCalledWith({
				id: taskId,
				...updateData,
			});
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: updatedTask,
				message: "Task updated successfully",
			});
		});

		it("should handle partial updates", async () => {
			const taskId = "task-id-123";
			const updateData = { title: "Updated Title Only" };
			const updatedTask = createTask({ id: taskId, ...updateData });

			mockRequest.params = { id: taskId };
			mockRequest.body = updateData;

			mockTaskValidation.execute
				.mockReturnValueOnce({ id: taskId })
				.mockReturnValueOnce(updateData);
			mockUpdateTaskService.execute.mockResolvedValue(updatedTask);

			await updateTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockUpdateTaskService.execute).toHaveBeenCalledWith({
				id: taskId,
				...updateData,
			});
			expect(mockResponse.status).toHaveBeenCalledWith(200);
		});

		it("should handle validation error for params", async () => {
			mockRequest.params = { id: "" };
			mockRequest.body = { title: "Valid Title" };

			const validationError = new ValidationError({
				field: "id",
				value: "",
				message: "ID is required",
			});

			mockTaskValidation.execute.mockImplementation(() => {
				throw validationError;
			});

			await updateTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockTaskValidation.execute).toHaveBeenCalledWith(
				"task-id",
				{ id: "" },
				"UpdateTaskController.handle",
			);
			expect(mockUpdateTaskService.execute).not.toHaveBeenCalled();
			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "VALIDATION_ERROR",
					message: "[ValidationError] Validation Error: ID is required",
					field: "id",
					value: "",
				},
			});
		});

		it("should handle validation error for body", async () => {
			const taskId = "task-id-123";
			mockRequest.params = { id: taskId };
			mockRequest.body = { title: "" };

			const validationError = new ValidationError({
				field: "title",
				value: "",
				message: "Title cannot be empty",
			});

			mockTaskValidation.execute
				.mockReturnValueOnce({ id: taskId })
				.mockImplementation(() => {
					throw validationError;
				});

			await updateTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockTaskValidation.execute).toHaveBeenCalledTimes(2);
			expect(mockUpdateTaskService.execute).not.toHaveBeenCalled();
			expect(mockResponse.status).toHaveBeenCalledWith(400);
		});

		it("should handle task not found error", async () => {
			const taskId = "non-existent-task-id";
			const updateData = { title: "Updated Title" };

			mockRequest.params = { id: taskId };
			mockRequest.body = updateData;

			mockTaskValidation.execute
				.mockReturnValueOnce({ id: taskId })
				.mockReturnValueOnce(updateData);

			const notFoundError = NotFoundError.task(taskId);
			mockUpdateTaskService.execute.mockRejectedValue(notFoundError);

			await updateTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockUpdateTaskService.execute).toHaveBeenCalledWith({
				id: taskId,
				...updateData,
			});
			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "NOT_FOUND",
					message: expect.stringContaining("Task with ID"),
					resourceType: "Task",
					resourceId: taskId,
				},
			});
		});

		it("should handle empty update data", async () => {
			const taskId = "task-id-123";
			const emptyData = {};
			const task = createTask({ id: taskId });

			mockRequest.params = { id: taskId };
			mockRequest.body = emptyData;

			mockTaskValidation.execute
				.mockReturnValueOnce({ id: taskId })
				.mockReturnValueOnce(emptyData);
			mockUpdateTaskService.execute.mockResolvedValue(task);

			await updateTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockUpdateTaskService.execute).toHaveBeenCalledWith({
				id: taskId,
			});
			expect(mockResponse.status).toHaveBeenCalledWith(200);
		});

		it("should handle service errors", async () => {
			const taskId = "task-id-123";
			const updateData = { title: "Updated Title" };

			mockRequest.params = { id: taskId };
			mockRequest.body = updateData;

			mockTaskValidation.execute
				.mockReturnValueOnce({ id: taskId })
				.mockReturnValueOnce(updateData);
			mockUpdateTaskService.execute.mockRejectedValue(
				new Error("Service error"),
			);

			await updateTaskController.handle(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockUpdateTaskService.execute).toHaveBeenCalledWith({
				id: taskId,
				...updateData,
			});
			expect(mockResponse.status).toHaveBeenCalledWith(500);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "UNEXPECTED_ERROR",
					message: "An unexpected error occurred",
				},
			});
		});
	});
});
