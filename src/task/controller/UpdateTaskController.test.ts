import type { Request, Response } from "express";
import { container } from "tsyringe";
import { TaskStatus } from "@/shared/domain/TaskStatus";
import { NotFoundError, ValidationError } from "@/shared/Errors";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import { UpdateTaskController } from "@/task/controller";
import type { UpdateTaskService } from "@/task/service";
import { createTask } from "@/test/mocks";

describe("UpdateTaskController", () => {
	let updateTaskController: UpdateTaskController;
	let mockUpdateTaskService: jest.Mocked<UpdateTaskService>;
	let mockValidation: jest.Mocked<ValidationHandler>;
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;

	beforeEach(() => {
		mockUpdateTaskService = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<UpdateTaskService>;

		mockValidation = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<ValidationHandler>;

		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};

		mockReq = {
			params: {},
			body: {},
		};

		container.clearInstances();
		container.registerInstance("UpdateTaskService", mockUpdateTaskService);
		container.registerInstance("Validation", mockValidation);
		updateTaskController = container.resolve(UpdateTaskController);
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

			mockReq.params = { id: taskId };
			mockReq.body = updateData;

			mockValidation.execute
				.mockReturnValueOnce({ id: taskId })
				.mockReturnValueOnce(updateData);
			mockUpdateTaskService.execute.mockResolvedValue(updatedTask);

			await updateTaskController.handle(
				mockReq as Request,
				mockRes as Response,
			);

			expect(mockValidation.execute).toHaveBeenCalledTimes(2);
			expect(mockValidation.execute).toHaveBeenNthCalledWith(
				1,
				"task-id",
				{ id: taskId },
				"UpdateTaskController.handle",
			);
			expect(mockValidation.execute).toHaveBeenNthCalledWith(
				2,
				"update-task",
				updateData,
				"UpdateTaskController.handle",
			);
			expect(mockUpdateTaskService.execute).toHaveBeenCalledWith({
				id: taskId,
				...updateData,
			});
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				data: updatedTask,
				message: "Task updated successfully",
			});
		});

		it("should handle partial updates", async () => {
			const taskId = "task-id-123";
			const updateData = { title: "Updated Title Only" };
			const updatedTask = createTask({ id: taskId, ...updateData });

			mockReq.params = { id: taskId };
			mockReq.body = updateData;

			mockValidation.execute
				.mockReturnValueOnce({ id: taskId })
				.mockReturnValueOnce(updateData);
			mockUpdateTaskService.execute.mockResolvedValue(updatedTask);

			await updateTaskController.handle(
				mockReq as Request,
				mockRes as Response,
			);

			expect(mockUpdateTaskService.execute).toHaveBeenCalledWith({
				id: taskId,
				...updateData,
			});
			expect(mockRes.status).toHaveBeenCalledWith(200);
		});

		it("should handle validation error for params", async () => {
			mockReq.params = { id: "" };
			mockReq.body = { title: "Valid Title" };

			const validationError = new ValidationError({
				field: "id",
				value: "",
				message: "ID is required",
			});

			mockValidation.execute.mockImplementation(() => {
				throw validationError;
			});

			await updateTaskController.handle(
				mockReq as Request,
				mockRes as Response,
			);

			expect(mockValidation.execute).toHaveBeenCalledWith(
				"task-id",
				{ id: "" },
				"UpdateTaskController.handle",
			);
			expect(mockUpdateTaskService.execute).not.toHaveBeenCalled();
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

		it("should handle validation error for body", async () => {
			const taskId = "task-id-123";
			mockReq.params = { id: taskId };
			mockReq.body = { title: "" };

			const validationError = new ValidationError({
				field: "title",
				value: "",
				message: "Title cannot be empty",
			});

			mockValidation.execute
				.mockReturnValueOnce({ id: taskId })
				.mockImplementation(() => {
					throw validationError;
				});

			await updateTaskController.handle(
				mockReq as Request,
				mockRes as Response,
			);

			expect(mockValidation.execute).toHaveBeenCalledTimes(2);
			expect(mockUpdateTaskService.execute).not.toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(400);
		});

		it("should handle task not found error", async () => {
			const taskId = "non-existent-task-id";
			const updateData = { title: "Updated Title" };

			mockReq.params = { id: taskId };
			mockReq.body = updateData;

			mockValidation.execute
				.mockReturnValueOnce({ id: taskId })
				.mockReturnValueOnce(updateData);

			const notFoundError = NotFoundError.task(taskId);
			mockUpdateTaskService.execute.mockRejectedValue(notFoundError);

			await updateTaskController.handle(
				mockReq as Request,
				mockRes as Response,
			);

			expect(mockUpdateTaskService.execute).toHaveBeenCalledWith({
				id: taskId,
				...updateData,
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

		it("should handle empty update data", async () => {
			const taskId = "task-id-123";
			const emptyData = {};
			const task = createTask({ id: taskId });

			mockReq.params = { id: taskId };
			mockReq.body = emptyData;

			mockValidation.execute
				.mockReturnValueOnce({ id: taskId })
				.mockReturnValueOnce(emptyData);
			mockUpdateTaskService.execute.mockResolvedValue(task);

			await updateTaskController.handle(
				mockReq as Request,
				mockRes as Response,
			);

			expect(mockUpdateTaskService.execute).toHaveBeenCalledWith({
				id: taskId,
			});
			expect(mockRes.status).toHaveBeenCalledWith(200);
		});

		it("should handle service errors", async () => {
			const taskId = "task-id-123";
			const updateData = { title: "Updated Title" };

			mockReq.params = { id: taskId };
			mockReq.body = updateData;

			mockValidation.execute
				.mockReturnValueOnce({ id: taskId })
				.mockReturnValueOnce(updateData);
			mockUpdateTaskService.execute.mockRejectedValue(
				new Error("Service error"),
			);

			await updateTaskController.handle(
				mockReq as Request,
				mockRes as Response,
			);

			expect(mockUpdateTaskService.execute).toHaveBeenCalledWith({
				id: taskId,
				...updateData,
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
