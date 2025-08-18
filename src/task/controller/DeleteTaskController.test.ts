import type { Response } from "express";
import { NotFoundError, ValidationError } from "@/shared/Errors";
import {
	mockDeleteTaskController,
	mockDeleteTaskService,
	mockRequest,
	mockResponse,
	mockTaskValidation,
} from "@/test/mocks";
import type { AuthenticatedRequest } from "@/user/infra/middleware/authMiddleware";
import type { DeleteTaskController } from "./DeleteTaskController";

describe("DeleteTaskController", () => {
	let deleteTaskController: DeleteTaskController;

	beforeEach(() => {
		deleteTaskController = mockDeleteTaskController;

		Object.assign(mockRequest, {
			user: {
				id: "test-user-id",
				email: "test@example.com",
				name: "Test User",
			},
		});

		jest.clearAllMocks();
	});

	describe("handle", () => {
		it("should delete a task successfully", async () => {
			const taskId = "task-id-123";
			mockRequest.params = { id: taskId };

			mockTaskValidation.execute.mockReturnValue({ id: taskId });
			mockDeleteTaskService.execute.mockResolvedValue(undefined);

			await deleteTaskController.handle(
				mockRequest as AuthenticatedRequest,
				mockResponse as Response,
			);

			expect(mockTaskValidation.execute).toHaveBeenCalledWith(
				"task-id",
				{ id: taskId },
				"DeleteTaskController.handle",
			);
			expect(mockDeleteTaskService.execute).toHaveBeenCalledWith({
				taskId: taskId,
				ownerId: "test-user-id",
			});
			expect(mockResponse.status).toHaveBeenCalledWith(204);
			expect(mockResponse.send).toHaveBeenCalledWith();
		});

		it("should handle validation error", async () => {
			mockRequest.params = { id: "" };

			const validationError = new ValidationError({
				field: "id",
				value: "",
				message: "ID is required",
			});

			mockTaskValidation.execute.mockImplementation(() => {
				throw validationError;
			});

			await deleteTaskController.handle(
				mockRequest as AuthenticatedRequest,
				mockResponse as Response,
			);

			expect(mockTaskValidation.execute).toHaveBeenCalledWith(
				"task-id",
				{ id: "" },
				"DeleteTaskController.handle",
			);
			expect(mockDeleteTaskService.execute).not.toHaveBeenCalled();
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

		it("should handle task not found error", async () => {
			const taskId = "non-existent-task-id";
			mockRequest.params = { id: taskId };

			mockTaskValidation.execute.mockReturnValue({ id: taskId });

			const notFoundError = NotFoundError.task(taskId);
			mockDeleteTaskService.execute.mockRejectedValue(notFoundError);

			await deleteTaskController.handle(
				mockRequest as AuthenticatedRequest,
				mockResponse as Response,
			);

			expect(mockTaskValidation.execute).toHaveBeenCalledWith(
				"task-id",
				{ id: taskId },
				"DeleteTaskController.handle",
			);
			expect(mockDeleteTaskService.execute).toHaveBeenCalledWith({
				taskId: taskId,
				ownerId: "test-user-id",
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

		it("should handle missing id parameter", async () => {
			mockRequest.params = {};

			const validationError = new ValidationError({
				field: "id",
				value: undefined,
				message: "ID is required",
			});

			mockTaskValidation.execute.mockImplementation(() => {
				throw validationError;
			});

			await deleteTaskController.handle(
				mockRequest as AuthenticatedRequest,
				mockResponse as Response,
			);

			expect(mockTaskValidation.execute).toHaveBeenCalledWith(
				"task-id",
				{},
				"DeleteTaskController.handle",
			);
			expect(mockDeleteTaskService.execute).not.toHaveBeenCalled();
			expect(mockResponse.status).toHaveBeenCalledWith(400);
		});

		it("should handle service errors", async () => {
			const taskId = "task-id-123";
			mockRequest.params = { id: taskId };

			mockTaskValidation.execute.mockReturnValue({ id: taskId });
			mockDeleteTaskService.execute.mockRejectedValue(
				new Error("Service error"),
			);

			await deleteTaskController.handle(
				mockRequest as AuthenticatedRequest,
				mockResponse as Response,
			);

			expect(mockDeleteTaskService.execute).toHaveBeenCalledWith({
				taskId: taskId,
				ownerId: "test-user-id",
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
