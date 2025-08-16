import { container } from "tsyringe";
import { NotFoundError } from "@/shared/Errors";
import type { TaskRepository } from "@/task/infra/repository/TaskRepository";
import { createTask } from "@/test/mocks/factories/TaskMock";
import { DeleteTaskService } from "./DeleteTaskService";

describe("DeleteTaskService", () => {
	let deleteTaskService: DeleteTaskService;
	let mockTaskRepository: jest.Mocked<TaskRepository>;

	beforeEach(() => {
		mockTaskRepository = {
			findById: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
			findAll: jest.fn(),
			findByProjectId: jest.fn(),
			update: jest.fn(),
		};

		container.clearInstances();
		container.registerInstance("TaskRepository", mockTaskRepository);
		deleteTaskService = container.resolve(DeleteTaskService);
	});

	describe("execute", () => {
		it("should delete task when found", async () => {
			const taskId = "task-id-123";
			const task = createTask({ id: taskId });

			mockTaskRepository.findById.mockResolvedValue(task);
			mockTaskRepository.delete.mockResolvedValue(undefined);

			await deleteTaskService.execute({ id: taskId });

			expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
			expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
		});

		it("should throw NotFoundError when task not found", async () => {
			const taskId = "non-existent-task-id";

			mockTaskRepository.findById.mockResolvedValue(null);

			await expect(deleteTaskService.execute({ id: taskId })).rejects.toThrow(
				NotFoundError,
			);

			expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
			expect(mockTaskRepository.delete).not.toHaveBeenCalled();
		});

		it("should handle repository errors gracefully", async () => {
			const taskId = "task-id-123";
			const task = createTask({ id: taskId });

			mockTaskRepository.findById.mockResolvedValue(task);
			mockTaskRepository.delete.mockRejectedValue(
				new Error("Database connection failed"),
			);

			await expect(deleteTaskService.execute({ id: taskId })).rejects.toThrow(
				"Database connection failed",
			);

			expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
			expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskId);
		});
	});
});
