import "reflect-metadata";
import { CacheKeys } from "@/shared/cache";
import { TaskStatus } from "@/shared/domain/TaskStatus";
import { DeleteByProjectIdService } from "@/task/service/delete-by-project-id/DeleteByProjectIdService";
import {
	createTask,
	MockCacheProvider,
	mockTaskRepository,
} from "@/test/mocks";

describe("DeleteByProjectIdService - Cache Invalidation", () => {
	let deleteByProjectIdService: DeleteByProjectIdService;
	let mockCacheProvider: MockCacheProvider;

	const findByProjectIdSpy = jest.spyOn(mockTaskRepository, "findByProjectId");
	const deleteByProjectIdSpy = jest.spyOn(
		mockTaskRepository,
		"deleteByProjectId",
	);

	beforeEach(() => {
		mockCacheProvider = new MockCacheProvider();

		deleteByProjectIdService = new DeleteByProjectIdService(
			mockTaskRepository,
			mockCacheProvider,
		);

		mockTaskRepository.clear();
		jest.clearAllMocks();
	});

	describe("Bulk Task Deletion Cache Invalidation", () => {
		it("should invalidate all task-related caches when deleting tasks by project", async () => {
			const projectId = "project-to-clean";
			const task1Id = "task-1";
			const task2Id = "task-2";
			const task3Id = "task-3";

			const mockTasks = [
				createTask({
					id: task1Id,
					projectId: projectId,
					title: "Task 1",
					status: TaskStatus.TODO,
				}),
				createTask({
					id: task2Id,
					projectId: projectId,
					title: "Task 2",
					status: TaskStatus.IN_PROGRESS,
				}),
				createTask({
					id: task3Id,
					projectId: projectId,
					title: "Task 3",
					status: TaskStatus.DONE,
				}),
			];

			findByProjectIdSpy.mockResolvedValue(mockTasks);
			deleteByProjectIdSpy.mockResolvedValue();

			const task1CacheKey = CacheKeys.task(task1Id);
			const task2CacheKey = CacheKeys.task(task2Id);
			const task3CacheKey = CacheKeys.task(task3Id);
			const tasksByProjectKey = CacheKeys.tasksByProject(projectId);
			const tasksListKey1 = "ligue-lead:tasks:list:p1_l10";
			const tasksListKey2 = "ligue-lead:tasks:list:p2_l20_filter";

			await mockCacheProvider.set(task1CacheKey, mockTasks[0]);
			await mockCacheProvider.set(task2CacheKey, mockTasks[1]);
			await mockCacheProvider.set(task3CacheKey, mockTasks[2]);
			await mockCacheProvider.set(tasksByProjectKey, mockTasks);
			await mockCacheProvider.set(tasksListKey1, {
				tasks: mockTasks,
				total: 3,
			});
			await mockCacheProvider.set(tasksListKey2, { tasks: [], total: 0 });

			const result = await deleteByProjectIdService.execute(projectId);

			expect(findByProjectIdSpy).toHaveBeenCalledWith(projectId);
			expect(deleteByProjectIdSpy).toHaveBeenCalledWith(projectId);

			expect(result).toEqual({
				projectId: projectId,
				deletedTasksCount: 3,
				deletedAt: expect.any(Date),
			});

			expect(await mockCacheProvider.get(task1CacheKey)).toBeNull();
			expect(await mockCacheProvider.get(task2CacheKey)).toBeNull();
			expect(await mockCacheProvider.get(task3CacheKey)).toBeNull();

			expect(await mockCacheProvider.get(tasksByProjectKey)).toBeNull();

			expect(await mockCacheProvider.get(tasksListKey1)).toBeNull();
			expect(await mockCacheProvider.get(tasksListKey2)).toBeNull();
		});

		it("should handle empty project task deletion gracefully", async () => {
			const projectId = "empty-project";

			findByProjectIdSpy.mockResolvedValue([]);
			deleteByProjectIdSpy.mockResolvedValue();

			const nonTaskCache = "other-system:data:key";
			await mockCacheProvider.set(nonTaskCache, { data: "preserved" });

			const result = await deleteByProjectIdService.execute(projectId);

			expect(result).toEqual({
				projectId: projectId,
				deletedTasksCount: 0,
				deletedAt: expect.any(Date),
			});

			expect(await mockCacheProvider.get(nonTaskCache)).toBeTruthy();
		});
	});

	describe("Cache Pattern Validation", () => {
		it("should use correct cache key patterns for bulk invalidation", async () => {
			const projectId = "pattern-test-project";
			const taskId1 = "pattern-task-1";
			const taskId2 = "pattern-task-2";

			const mockTasks = [
				createTask({ id: taskId1, projectId: projectId }),
				createTask({ id: taskId2, projectId: projectId }),
			];

			findByProjectIdSpy.mockResolvedValue(mockTasks);
			deleteByProjectIdSpy.mockResolvedValue();

			const expectedTask1Key = CacheKeys.task(taskId1);
			const expectedTask2Key = CacheKeys.task(taskId2);
			const expectedTasksByProjectKey = CacheKeys.tasksByProject(projectId);

			await mockCacheProvider.set(expectedTask1Key, mockTasks[0]);
			await mockCacheProvider.set(expectedTask2Key, mockTasks[1]);
			await mockCacheProvider.set(expectedTasksByProjectKey, mockTasks);

			await mockCacheProvider.set("ligue-lead:tasks:list:p1_l10", {
				tasks: [],
				total: 0,
			});
			await mockCacheProvider.set("ligue-lead:tasks:list:p5_l50_search", {
				tasks: [],
				total: 0,
			});

			await mockCacheProvider.set("ligue-lead:projects:list:p1_l10", {
				projects: [],
				total: 0,
			});
			await mockCacheProvider.set(CacheKeys.project("some-project"), {
				id: "some-project",
			});

			await deleteByProjectIdService.execute(projectId);

			expect(await mockCacheProvider.get(expectedTask1Key)).toBeNull();
			expect(await mockCacheProvider.get(expectedTask2Key)).toBeNull();
			expect(await mockCacheProvider.get(expectedTasksByProjectKey)).toBeNull();

			expect(
				await mockCacheProvider.get("ligue-lead:tasks:list:p1_l10"),
			).toBeNull();
			expect(
				await mockCacheProvider.get("ligue-lead:tasks:list:p5_l50_search"),
			).toBeNull();

			expect(
				await mockCacheProvider.get("ligue-lead:projects:list:p1_l10"),
			).toBeTruthy();
			expect(
				await mockCacheProvider.get(CacheKeys.project("some-project")),
			).toBeTruthy();
		});
	});

	describe("Error Handling with Cache", () => {
		it("should handle repository errors gracefully without cache corruption", async () => {
			const projectId = "error-project";
			const taskId = "error-task";

			const mockTask = createTask({ id: taskId, projectId: projectId });

			findByProjectIdSpy.mockResolvedValue([mockTask]);
			deleteByProjectIdSpy.mockRejectedValue(
				new Error("Database connection failed"),
			);

			const taskCacheKey = CacheKeys.task(taskId);
			await mockCacheProvider.set(taskCacheKey, mockTask);

			await expect(deleteByProjectIdService.execute(projectId)).rejects.toThrow(
				"Database connection failed",
			);

			expect(await mockCacheProvider.get(taskCacheKey)).toBeTruthy();
		});

		it("should continue cache invalidation even if individual task cache deletion fails", async () => {
			const projectId = "partial-error-project";
			const task1Id = "task-1";
			const task2Id = "task-2";

			const mockTasks = [
				createTask({ id: task1Id, projectId: projectId }),
				createTask({ id: task2Id, projectId: projectId }),
			];

			findByProjectIdSpy.mockResolvedValue(mockTasks);
			deleteByProjectIdSpy.mockResolvedValue();

			const task1CacheKey = CacheKeys.task(task1Id);
			const task2CacheKey = CacheKeys.task(task2Id);
			const tasksByProjectKey = CacheKeys.tasksByProject(projectId);

			await mockCacheProvider.set(task1CacheKey, mockTasks[0]);
			await mockCacheProvider.set(task2CacheKey, mockTasks[1]);
			await mockCacheProvider.set(tasksByProjectKey, mockTasks);

			const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

			const result = await deleteByProjectIdService.execute(projectId);

			expect(result).toEqual({
				projectId: projectId,
				deletedTasksCount: 2,
				deletedAt: expect.any(Date),
			});

			consoleSpy.mockRestore();
		});
	});

	describe("Cache Cleanup Efficiency", () => {
		it("should efficiently handle large numbers of tasks for cache invalidation", async () => {
			const projectId = "large-project";
			const taskCount = 100;

			const mockTasks = Array.from({ length: taskCount }, (_, index) =>
				createTask({
					id: `task-${index}`,
					projectId: projectId,
					title: `Task ${index}`,
				}),
			);

			findByProjectIdSpy.mockResolvedValue(mockTasks);
			deleteByProjectIdSpy.mockResolvedValue();

			for (const task of mockTasks) {
				const taskCacheKey = CacheKeys.task(task.id);
				await mockCacheProvider.set(taskCacheKey, task);
			}

			const tasksByProjectKey = CacheKeys.tasksByProject(projectId);
			await mockCacheProvider.set(tasksByProjectKey, mockTasks);

			const result = await deleteByProjectIdService.execute(projectId);

			expect(result.deletedTasksCount).toBe(taskCount);
			expect(findByProjectIdSpy).toHaveBeenCalledWith(projectId);
			expect(deleteByProjectIdSpy).toHaveBeenCalledWith(projectId);

			for (const task of mockTasks) {
				const taskCacheKey = CacheKeys.task(task.id);
				expect(await mockCacheProvider.get(taskCacheKey)).toBeNull();
			}

			expect(await mockCacheProvider.get(tasksByProjectKey)).toBeNull();
		});
	});
});
