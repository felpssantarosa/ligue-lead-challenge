import type { Request, Response } from "express";
import { ValidationError as SequelizeValidationError } from "sequelize";
import { TaskStatus } from "@/shared/domain/TaskStatus";
import { NotFoundError, ValidationError } from "@/shared/Errors";
import type { CreateTaskController } from "@/task/controller/CreateTaskController";
import {
	createTask,
	mockCreateTaskController,
	mockCreateTaskService,
	mockRequest,
	mockResponse,
	mockTaskValidation,
} from "@/test/mocks";
import { setupTestValidation } from "@/test/setup/validation";

describe("CreateTaskController", () => {
	let createTaskController: CreateTaskController;

	beforeEach(() => {
		setupTestValidation();
		createTaskController = mockCreateTaskController;
		jest.clearAllMocks();
	});

	describe("create", () => {
		it("should create a task successfully", async () => {
			const projectId = "project-id-123";
			const taskData = {
				title: "New Task",
				description: "Task description",
				status: TaskStatus.TODO,
			};
			const createdTask = createTask({
				id: "task-id-123",
				projectId,
				...taskData,
			});

			mockRequest.params = { projectId };
			mockRequest.body = taskData;

			mockTaskValidation.execute
				.mockReturnValueOnce(projectId)
				.mockReturnValueOnce(taskData);
			mockCreateTaskService.execute.mockResolvedValue(createdTask);

			await createTaskController.create(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockCreateTaskService.execute).toHaveBeenCalledWith({
				...taskData,
				projectId,
			});
			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: createdTask,
				message: "Task created successfully",
			});
		});

		it("should handle validation errors", async () => {
			const validationError = new ValidationError({
				message: "Invalid project ID format",
				field: "projectId",
				value: "invalid-id",
			});

			mockTaskValidation.execute.mockImplementationOnce(() => {
				throw validationError;
			});

			await createTaskController.create(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockCreateTaskService.execute).not.toHaveBeenCalled();
			expect(mockResponse.status).toHaveBeenCalledWith(500);
		});

		it("should handle Sequelize validation errors", async () => {
			const sequelizeError = new SequelizeValidationError(
				"Database validation failed",
				[],
			);

			mockTaskValidation.execute
				.mockReturnValueOnce("project-id")
				.mockReturnValueOnce({ title: "Task" });
			mockCreateTaskService.execute.mockRejectedValue(sequelizeError);

			await createTaskController.create(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				message: "Database validation failed",
			});
		});

		it("should handle service errors", async () => {
			const serviceError = new NotFoundError({
				message: "Project not found",
				resourceType: "Project",
			});

			mockTaskValidation.execute
				.mockReturnValueOnce("project-id")
				.mockReturnValueOnce({ title: "Task" });
			mockCreateTaskService.execute.mockRejectedValue(serviceError);

			await createTaskController.create(
				mockRequest as Request,
				mockResponse as Response,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(500);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				message: "Internal Server Error",
			});
		});
	});
});
