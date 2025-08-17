import type { Request, Response } from "express";
import { container } from "tsyringe";
import { NotFoundError, ValidationError } from "@/shared/Errors";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { DeleteTaskService } from "@/task/service";
import { DeleteTaskController } from "./DeleteTaskController";

describe("DeleteTaskController", () => {
	let deleteTaskController: DeleteTaskController;
	let mockDeleteTaskService: jest.Mocked<DeleteTaskService>;
	let mockValidation: jest.Mocked<ValidationHandler>;
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;

	beforeEach(() => {
		mockDeleteTaskService = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<DeleteTaskService>;

		mockValidation = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<ValidationHandler>;

		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};

		mockReq = {
			params: {},
		};

		container.clearInstances();
		container.registerInstance("DeleteTaskService", mockDeleteTaskService);
		container.registerInstance("Validation", mockValidation);
		deleteTaskController = container.resolve(DeleteTaskController);
	});

	describe("handle", () => {
		it("should delete a task successfully", async () => {
			const taskId = "task-id-123";
			mockReq.params = { id: taskId };

			mockValidation.execute.mockReturnValue({ id: taskId });
			mockDeleteTaskService.execute.mockResolvedValue(undefined);

			await deleteTaskController.handle(
				mockReq as Request,
				mockRes as Response,
			);

			expect(mockValidation.execute).toHaveBeenCalledWith(
				"task-id",
				{ id: taskId },
				"DeleteTaskController.handle",
			);
			expect(mockDeleteTaskService.execute).toHaveBeenCalledWith({
				id: taskId,
			});
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: "Task deleted successfully",
			});
		});

		it("should handle validation error", async () => {
			mockReq.params = { id: "" };

			const validationError = new ValidationError({
				field: "id",
				value: "",
				message: "ID is required",
			});

			mockValidation.execute.mockImplementation(() => {
				throw validationError;
			});

			await deleteTaskController.handle(
				mockReq as Request,
				mockRes as Response,
			);

			expect(mockValidation.execute).toHaveBeenCalledWith(
				"task-id",
				{ id: "" },
				"DeleteTaskController.handle",
			);
			expect(mockDeleteTaskService.execute).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({
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
			mockReq.params = { id: taskId };

			mockValidation.execute.mockReturnValue({ id: taskId });

			const notFoundError = NotFoundError.task(taskId);
			mockDeleteTaskService.execute.mockRejectedValue(notFoundError);

			await deleteTaskController.handle(
				mockReq as Request,
				mockRes as Response,
			);

			expect(mockValidation.execute).toHaveBeenCalledWith(
				"task-id",
				{ id: taskId },
				"DeleteTaskController.handle",
			);
			expect(mockDeleteTaskService.execute).toHaveBeenCalledWith({
				id: taskId,
			});
			expect(mockRes.status).toHaveBeenCalledWith(404);
			expect(mockRes.json).toHaveBeenCalledWith({
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
			mockReq.params = {};

			const validationError = new ValidationError({
				field: "id",
				value: undefined,
				message: "ID is required",
			});

			mockValidation.execute.mockImplementation(() => {
				throw validationError;
			});

			await deleteTaskController.handle(
				mockReq as Request,
				mockRes as Response,
			);

			expect(mockValidation.execute).toHaveBeenCalledWith(
				"task-id",
				{},
				"DeleteTaskController.handle",
			);
			expect(mockDeleteTaskService.execute).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(400);
		});

		it("should handle service errors", async () => {
			const taskId = "task-id-123";
			mockReq.params = { id: taskId };

			mockValidation.execute.mockReturnValue({ id: taskId });
			mockDeleteTaskService.execute.mockRejectedValue(
				new Error("Service error"),
			);

			await deleteTaskController.handle(
				mockReq as Request,
				mockRes as Response,
			);

			expect(mockDeleteTaskService.execute).toHaveBeenCalledWith({
				id: taskId,
			});
			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: false,
				error: {
					type: "UNEXPECTED_ERROR",
					message: "An unexpected error occurred",
				},
			});
		});
	});
});
