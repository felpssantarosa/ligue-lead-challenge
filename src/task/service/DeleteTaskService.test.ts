import { NotFoundError } from "@/shared/Errors";
import {
	createTask,
	mockDeleteTaskServiceImplementation as deleteTaskService,
	mockTaskRepository,
} from "@/test/mocks";

describe("DeleteTaskService", () => {
	const findSpy = jest.spyOn(mockTaskRepository, "findById");
	const deleteSpy = jest.spyOn(mockTaskRepository, "delete");

	beforeEach(() => {
		mockTaskRepository.clear();
		jest.clearAllMocks();
	});

	describe("execute", () => {
		it("should delete task when found", async () => {
			const taskId = "task-id-123";
			const task = createTask({ id: taskId });

			findSpy.mockResolvedValue(task);
			deleteSpy.mockResolvedValue(undefined);

			await deleteTaskService.execute({ id: taskId });

			expect(findSpy).toHaveBeenCalledWith(taskId);
			expect(deleteSpy).toHaveBeenCalledWith(taskId);
		});

		it("should throw NotFoundError when task not found", async () => {
			const taskId = "non-existent-task-id";

			findSpy.mockResolvedValue(null);

			await expect(deleteTaskService.execute({ id: taskId })).rejects.toThrow(
				NotFoundError,
			);

			expect(findSpy).toHaveBeenCalledWith(taskId);
			expect(deleteSpy).not.toHaveBeenCalled();
		});

		it("should handle repository errors gracefully", async () => {
			const taskId = "task-id-123";
			const task = createTask({ id: taskId });

			findSpy.mockResolvedValue(task);
			deleteSpy.mockRejectedValue(new Error("Database connection failed"));

			await expect(deleteTaskService.execute({ id: taskId })).rejects.toThrow(
				"Database connection failed",
			);

			expect(findSpy).toHaveBeenCalledWith(taskId);
			expect(deleteSpy).toHaveBeenCalledWith(taskId);
		});
	});
});
