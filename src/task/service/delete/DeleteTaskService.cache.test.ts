import "reflect-metadata";
import { CacheKeys } from "@/shared/cache";
import { TaskStatus } from "@/shared/domain/TaskStatus";
import { NotFoundError } from "@/shared/Errors";
import { DeleteTaskService } from "@/task/service/delete/DeleteTaskService";
import {
	createProject,
	createTask,
	MockCacheProvider,
	mockProjectRepository,
	mockTaskRepository,
} from "@/test/mocks";

describe("DeleteTaskService - Cache Invalidation", () => {
	let deleteTaskService: DeleteTaskService;
	let mockCacheProvider: MockCacheProvider;

	const findByIdSpy = jest.spyOn(mockTaskRepository, "findById");
	const deleteSpy = jest.spyOn(mockTaskRepository, "delete");
	const projectFindByIdSpy = jest.spyOn(mockProjectRepository, "findById");
	const projectUpdateSpy = jest.spyOn(mockProjectRepository, "update");

	beforeEach(() => {
		mockCacheProvider = new MockCacheProvider();

		deleteTaskService = new DeleteTaskService(
			mockTaskRepository,
			mockProjectRepository,
			mockCacheProvider,
		);

		mockTaskRepository.clear();
		mockProjectRepository.clear();
		jest.clearAllMocks();
	});

	describe("Cache Invalidation on Delete", () => {
		it("should invalidate all related caches when deleting a task", async () => {
			const projectId = "project-123";
			const taskId = "task-456";

			const mockProject = createProject({
				id: projectId,
				title: "Test Project",
				taskIds: [taskId, "other-task-789"],
			});

			const mockTask = createTask({
				id: taskId,
				projectId: projectId,
				title: "Task to Delete",
				status: TaskStatus.TODO,
			});

			findByIdSpy.mockResolvedValue(mockTask);
			projectFindByIdSpy.mockResolvedValue(mockProject);
			projectUpdateSpy.mockResolvedValue(mockProject);
			deleteSpy.mockResolvedValue();

			const taskCacheKey = CacheKeys.task(taskId);
			const projectCacheKey = CacheKeys.project(projectId);
			const tasksByProjectKey = CacheKeys.tasksByProject(projectId);
			const tasksListKey = "ligue-lead:tasks:list:p1_l10_abc123";

			await mockCacheProvider.set(taskCacheKey, mockTask);
			await mockCacheProvider.set(projectCacheKey, mockProject);
			await mockCacheProvider.set(tasksByProjectKey, [mockTask]);
			await mockCacheProvider.set(tasksListKey, {
				tasks: [mockTask],
				total: 1,
			});

			await deleteTaskService.execute({ id: taskId });

			expect(findByIdSpy).toHaveBeenCalledWith(taskId);
			expect(projectFindByIdSpy).toHaveBeenCalledWith(projectId);
			expect(projectUpdateSpy).toHaveBeenCalled();
			expect(deleteSpy).toHaveBeenCalledWith(taskId);

			expect(await mockCacheProvider.get(taskCacheKey)).toBeNull();
			expect(await mockCacheProvider.get(projectCacheKey)).toBeNull();
			expect(await mockCacheProvider.get(tasksByProjectKey)).toBeNull();
			expect(await mockCacheProvider.get(tasksListKey)).toBeNull();
		});

		it("should not invalidate cache when task not found", async () => {
			const taskId = "non-existent-task";
			const cacheKey = CacheKeys.task("some-task");

			await mockCacheProvider.set(cacheKey, {
				id: "some-task",
				title: "Cached Task",
			});

			findByIdSpy.mockResolvedValue(null);

			await expect(deleteTaskService.execute({ id: taskId })).rejects.toThrow(
				NotFoundError,
			);

			expect(await mockCacheProvider.get(cacheKey)).toBeTruthy();
			expect(deleteSpy).not.toHaveBeenCalled();
			expect(projectUpdateSpy).not.toHaveBeenCalled();
		});

		it("should not invalidate cache when project not found", async () => {
			const taskId = "task-123";
			const projectId = "non-existent-project";

			const mockTask = createTask({
				id: taskId,
				projectId: projectId,
				title: "Orphaned Task",
			});

			const taskCacheKey = CacheKeys.task(taskId);
			await mockCacheProvider.set(taskCacheKey, mockTask);

			findByIdSpy.mockResolvedValue(mockTask);
			projectFindByIdSpy.mockResolvedValue(null);

			await expect(deleteTaskService.execute({ id: taskId })).rejects.toThrow(
				NotFoundError,
			);

			expect(await mockCacheProvider.get(taskCacheKey)).toBeTruthy();
			expect(deleteSpy).not.toHaveBeenCalled();
			expect(projectUpdateSpy).not.toHaveBeenCalled();
		});
	});

	describe("Cache Pattern Validation", () => {
		it("should use correct cache key patterns for invalidation", async () => {
			const projectId = "test-project-123";
			const taskId = "test-task-456";

			const mockProject = createProject({
				id: projectId,
				taskIds: [taskId],
			});

			const mockTask = createTask({
				id: taskId,
				projectId: projectId,
			});

			findByIdSpy.mockResolvedValue(mockTask);
			projectFindByIdSpy.mockResolvedValue(mockProject);
			projectUpdateSpy.mockResolvedValue(mockProject);
			deleteSpy.mockResolvedValue();

			const expectedTaskKey = CacheKeys.task(taskId);
			const expectedProjectKey = CacheKeys.project(projectId);
			const expectedTasksByProjectKey = CacheKeys.tasksByProject(projectId);

			await mockCacheProvider.set(expectedTaskKey, mockTask);
			await mockCacheProvider.set(expectedProjectKey, mockProject);
			await mockCacheProvider.set(expectedTasksByProjectKey, [mockTask]);

			await mockCacheProvider.set("ligue-lead:tasks:list:p1_l10", {
				tasks: [],
				total: 0,
			});
			await mockCacheProvider.set("ligue-lead:tasks:list:p2_l5_filter", {
				tasks: [],
				total: 0,
			});

			await deleteTaskService.execute({ id: taskId });

			expect(await mockCacheProvider.get(expectedTaskKey)).toBeNull();
			expect(await mockCacheProvider.get(expectedProjectKey)).toBeNull();
			expect(await mockCacheProvider.get(expectedTasksByProjectKey)).toBeNull();

			expect(
				await mockCacheProvider.get("ligue-lead:tasks:list:p1_l10"),
			).toBeNull();
			expect(
				await mockCacheProvider.get("ligue-lead:tasks:list:p2_l5_filter"),
			).toBeNull();
		});
	});

	describe("Project Task IDs Update", () => {
		it("should properly update project task IDs when deleting a task", async () => {
			const projectId = "project-with-multiple-tasks";
			const taskToDeleteId = "task-to-delete";
			const remainingTaskId = "remaining-task";

			const mockProject = createProject({
				id: projectId,
				title: "Project with Multiple Tasks",
				taskIds: [taskToDeleteId, remainingTaskId],
			});

			const mockTask = createTask({
				id: taskToDeleteId,
				projectId: projectId,
			});

			findByIdSpy.mockResolvedValue(mockTask);
			projectFindByIdSpy.mockResolvedValue(mockProject);
			projectUpdateSpy.mockResolvedValue(mockProject);
			deleteSpy.mockResolvedValue();

			await deleteTaskService.execute({ id: taskToDeleteId });

			expect(projectUpdateSpy).toHaveBeenCalled();
			const updatedProject = projectUpdateSpy.mock.calls[0][0];
			expect(updatedProject.taskIds).toEqual([remainingTaskId]);
			expect(updatedProject.taskIds).not.toContain(taskToDeleteId);
		});
	});

	describe("Error Handling with Cache", () => {
		it("should handle repository errors without cache corruption", async () => {
			const taskId = "error-task";
			const projectId = "error-project";

			const mockProject = createProject({ id: projectId });
			const mockTask = createTask({ id: taskId, projectId: projectId });

			findByIdSpy.mockResolvedValue(mockTask);
			projectFindByIdSpy.mockResolvedValue(mockProject);
			projectUpdateSpy.mockResolvedValue(mockProject);
			deleteSpy.mockRejectedValue(new Error("Database error"));

			const cacheKey = CacheKeys.task(taskId);
			await mockCacheProvider.set(cacheKey, mockTask);

			await expect(deleteTaskService.execute({ id: taskId })).rejects.toThrow(
				"Database error",
			);

			expect(await mockCacheProvider.get(cacheKey)).toBeTruthy();
		});
	});
});
