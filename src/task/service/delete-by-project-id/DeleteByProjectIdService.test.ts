import { DeleteByProjectIdService } from "@/task/service/delete-by-project-id/DeleteByProjectIdService";
import { createTask, mockTaskRepository } from "@/test/mocks";
import { MockCacheProvider } from "@/test/mocks/cache/MockCacheProvider";

describe("DeleteByProjectIdService", () => {
	let deleteByProjectIdService: DeleteByProjectIdService;
	let mockCache: MockCacheProvider;
	const findByProjectIdSpy = jest.spyOn(mockTaskRepository, "findByProjectId");
	const deleteByProjectIdSpy = jest.spyOn(
		mockTaskRepository,
		"deleteByProjectId",
	);

	beforeEach(() => {
		mockTaskRepository.clear();
		jest.clearAllMocks();

		mockCache = new MockCacheProvider();
		deleteByProjectIdService = new DeleteByProjectIdService(
			mockTaskRepository,
			mockCache,
		);
	});

	describe("execute", () => {
		it("should delete all tasks for a project and return correct count", async () => {
			const projectId = "project-id-123";
			const task1 = createTask({ id: "task-1", projectId });
			const task2 = createTask({ id: "task-2", projectId });
			const task3 = createTask({ id: "task-3", projectId });
			const tasks = [task1, task2, task3];

			findByProjectIdSpy.mockResolvedValue(tasks);
			deleteByProjectIdSpy.mockResolvedValue(undefined);

			const result = await deleteByProjectIdService.execute(projectId);

			expect(findByProjectIdSpy).toHaveBeenCalledWith(projectId);
			expect(deleteByProjectIdSpy).toHaveBeenCalledWith(projectId);
			expect(result.projectId).toBe(projectId);
			expect(result.deletedTasksCount).toBe(3);
			expect(result.deletedAt).toBeInstanceOf(Date);
		});

		it("should handle project with no tasks", async () => {
			const projectId = "project-with-no-tasks";

			findByProjectIdSpy.mockResolvedValue([]);
			deleteByProjectIdSpy.mockResolvedValue(undefined);

			const result = await deleteByProjectIdService.execute(projectId);

			expect(findByProjectIdSpy).toHaveBeenCalledWith(projectId);
			expect(deleteByProjectIdSpy).toHaveBeenCalledWith(projectId);
			expect(result.projectId).toBe(projectId);
			expect(result.deletedTasksCount).toBe(0);
			expect(result.deletedAt).toBeInstanceOf(Date);
		});

		it("should invalidate relevant caches", async () => {
			const projectId = "project-id-123";
			const task1 = createTask({ id: "task-1", projectId });
			const task2 = createTask({ id: "task-2", projectId });
			const tasks = [task1, task2];

			findByProjectIdSpy.mockResolvedValue(tasks);
			deleteByProjectIdSpy.mockResolvedValue(undefined);

			const deleteSpy = jest.spyOn(mockCache, "delete");
			const deleteByPatternSpy = jest.spyOn(mockCache, "deleteByPattern");

			await deleteByProjectIdService.execute(projectId);

			expect(deleteSpy).toHaveBeenCalledWith("ligue-lead:task:task-1");
			expect(deleteSpy).toHaveBeenCalledWith("ligue-lead:task:task-2");

			expect(deleteSpy).toHaveBeenCalledWith(
				`ligue-lead:tasks:project:${projectId}`,
			);

			expect(deleteByPatternSpy).toHaveBeenCalledWith(
				"ligue-lead:tasks:list:*",
			);
			expect(deleteByPatternSpy).toHaveBeenCalledWith(
				"ligue-lead:tasks:project:*",
			);
			expect(deleteByPatternSpy).toHaveBeenCalledWith("ligue-lead:task:*");
		});

		it("should handle repository errors gracefully", async () => {
			const projectId = "project-id-123";
			const task = createTask({ id: "task-1", projectId });

			findByProjectIdSpy.mockResolvedValue([task]);
			deleteByProjectIdSpy.mockRejectedValue(
				new Error("Database connection failed"),
			);

			await expect(deleteByProjectIdService.execute(projectId)).rejects.toThrow(
				"Database connection failed",
			);

			expect(findByProjectIdSpy).toHaveBeenCalledWith(projectId);
			expect(deleteByProjectIdSpy).toHaveBeenCalledWith(projectId);
		});

		it("should handle cache errors gracefully and continue with deletion", async () => {
			const projectId = "project-id-123";
			const task = createTask({ id: "task-1", projectId });

			findByProjectIdSpy.mockResolvedValue([task]);
			deleteByProjectIdSpy.mockResolvedValue(undefined);

			const deleteSpy = jest.spyOn(mockCache, "delete");
			deleteSpy.mockRejectedValue(new Error("Cache connection failed"));

			const result = await deleteByProjectIdService.execute(projectId);

			expect(result.projectId).toBe(projectId);
			expect(result.deletedTasksCount).toBe(1);
			expect(findByProjectIdSpy).toHaveBeenCalledWith(projectId);
			expect(deleteByProjectIdSpy).toHaveBeenCalledWith(projectId);
		});

		it("should handle empty project ID", async () => {
			const projectId = "";

			findByProjectIdSpy.mockResolvedValue([]);
			deleteByProjectIdSpy.mockResolvedValue(undefined);

			const result = await deleteByProjectIdService.execute(projectId);

			expect(result.projectId).toBe("");
			expect(result.deletedTasksCount).toBe(0);
			expect(findByProjectIdSpy).toHaveBeenCalledWith("");
			expect(deleteByProjectIdSpy).toHaveBeenCalledWith("");
		});
	});
});
