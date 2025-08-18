import "reflect-metadata";
import { Project } from "@/project/domain";
import { CacheKeys } from "@/shared/cache";
import { TaskStatus } from "@/shared/domain/TaskStatus";
import { NotFoundError } from "@/shared/Errors";
import { CreateTaskService } from "@/task/service/create/CreateTaskService";
import { DeleteTaskService } from "@/task/service/delete/DeleteTaskService";
import { UpdateTaskService } from "@/task/service/update/UpdateTaskService";
import { generateUUID } from "@/test/factories";
import {
	createTask,
	MockCacheProvider,
	mockProjectRepository,
	mockTaskRepository,
} from "@/test/mocks";

describe("Task Services - Cache Invalidation", () => {
	let updateTaskService: UpdateTaskService;
	let createTaskService: CreateTaskService;
	let deleteTaskService: DeleteTaskService;
	let mockCacheProvider: MockCacheProvider;

	const taskFindByIdSpy = jest.spyOn(mockTaskRepository, "findById");
	const taskUpdateSpy = jest.spyOn(mockTaskRepository, "update");
	const taskSaveSpy = jest.spyOn(mockTaskRepository, "save");
	const taskDeleteSpy = jest.spyOn(mockTaskRepository, "delete");
	const projectFindByIdSpy = jest.spyOn(mockProjectRepository, "findById");
	const projectUpdateSpy = jest.spyOn(mockProjectRepository, "update");

	beforeEach(() => {
		mockCacheProvider = new MockCacheProvider();

		updateTaskService = new UpdateTaskService(
			mockTaskRepository,
			mockCacheProvider,
		);

		createTaskService = new CreateTaskService(
			mockTaskRepository,
			mockProjectRepository,
			mockCacheProvider,
		);

		deleteTaskService = new DeleteTaskService(
			mockTaskRepository,
			mockProjectRepository,
			mockCacheProvider,
		);

		mockTaskRepository.clear();
		mockProjectRepository.clear();
		jest.clearAllMocks();
	});

	describe("UpdateTaskService Cache Invalidation", () => {
		it("should invalidate all related caches when updating a task", async () => {
			const taskId = generateUUID();
			const projectId = generateUUID();

			const existingTask = createTask({
				id: taskId,
				title: "Original Task",
				description: "Original description",
				status: TaskStatus.TODO,
				projectId,
			});

			const updatedTask = createTask({
				id: taskId,
				title: "Updated Task",
				description: "Updated description",
				status: TaskStatus.IN_PROGRESS,
				projectId,
			});

			taskFindByIdSpy.mockResolvedValue(existingTask);
			taskUpdateSpy.mockResolvedValue(updatedTask);

			const cacheEntries = [
				{ key: CacheKeys.task(taskId), value: existingTask.toJSON() },

				{ key: "ligue-lead:tasks:list:p1_l10_abc", value: { tasks: [] } },
				{ key: "ligue-lead:tasks:list:p2_l20_def", value: { tasks: [] } },

				{ key: CacheKeys.tasksByProject(projectId), value: { tasks: [] } },

				{ key: CacheKeys.project(projectId), value: { project: "data" } },

				{ key: CacheKeys.task("other-task-id"), value: { task: "other" } },
				{
					key: CacheKeys.project("other-project-id"),
					value: { project: "other" },
				},
			];

			for (const entry of cacheEntries) {
				await mockCacheProvider.set(entry.key, entry.value);
			}

			for (const entry of cacheEntries) {
				expect(await mockCacheProvider.get(entry.key)).toBeTruthy();
			}

			await updateTaskService.execute({
				id: taskId,
				title: "Updated Task",
				status: TaskStatus.IN_PROGRESS,
			});

			expect(await mockCacheProvider.get(CacheKeys.task(taskId))).toBeNull();
			expect(
				await mockCacheProvider.get("ligue-lead:tasks:list:p1_l10_abc"),
			).toBeNull();
			expect(
				await mockCacheProvider.get("ligue-lead:tasks:list:p2_l20_def"),
			).toBeNull();
			expect(
				await mockCacheProvider.get(CacheKeys.tasksByProject(projectId)),
			).toBeNull();
			expect(
				await mockCacheProvider.get(CacheKeys.project(projectId)),
			).toBeNull();

			expect(
				await mockCacheProvider.get(CacheKeys.task("other-task-id")),
			).toBeTruthy();
			expect(
				await mockCacheProvider.get(CacheKeys.project("other-project-id")),
			).toBeTruthy();
		});

		it("should not invalidate cache when task not found", async () => {
			const taskId = generateUUID();
			taskFindByIdSpy.mockResolvedValue(null);

			const taskCacheKey = CacheKeys.task(taskId);
			await mockCacheProvider.set(taskCacheKey, { task: "data" });

			await expect(
				updateTaskService.execute({
					id: taskId,
					title: "New Title",
				}),
			).rejects.toThrow(NotFoundError);

			expect(await mockCacheProvider.get(taskCacheKey)).toBeTruthy();
		});
	});

	describe("CreateTaskService Cache Invalidation", () => {
		it("should invalidate related caches when creating a task", async () => {
			const projectId = generateUUID();
			const taskId = generateUUID();

			const project = Project.create({
				title: "Test Project",
				description: "Test description",
				tags: ["test"],
			});

			const newTask = createTask({
				id: taskId,
				title: "New Task",
				description: "New task description",
				status: TaskStatus.TODO,
				projectId,
			});

			projectFindByIdSpy.mockResolvedValue(project);
			taskSaveSpy.mockResolvedValue(newTask);
			projectUpdateSpy.mockResolvedValue(project);

			const cacheEntries = [
				{ key: "ligue-lead:tasks:list:p1_l10_abc", value: { tasks: [] } },
				{ key: "ligue-lead:tasks:list:p2_l20_def", value: { tasks: [] } },

				{ key: CacheKeys.tasksByProject(projectId), value: { tasks: [] } },

				{ key: CacheKeys.project(projectId), value: { project: "data" } },
			];

			for (const entry of cacheEntries) {
				await mockCacheProvider.set(entry.key, entry.value);
			}

			await createTaskService.execute({
				title: "New Task",
				description: "New task description",
				status: TaskStatus.TODO,
				projectId,
			});

			expect(
				await mockCacheProvider.get("ligue-lead:tasks:list:p1_l10_abc"),
			).toBeNull();
			expect(
				await mockCacheProvider.get("ligue-lead:tasks:list:p2_l20_def"),
			).toBeNull();
			expect(
				await mockCacheProvider.get(CacheKeys.tasksByProject(projectId)),
			).toBeNull();
			expect(
				await mockCacheProvider.get(CacheKeys.project(projectId)),
			).toBeNull();
		});

		it("should not invalidate cache when project not found", async () => {
			const projectId = generateUUID();
			projectFindByIdSpy.mockResolvedValue(null);

			const cacheKey = CacheKeys.tasksByProject(projectId);
			await mockCacheProvider.set(cacheKey, { tasks: [] });

			await expect(
				createTaskService.execute({
					title: "New Task",
					description: "Description",
					status: TaskStatus.TODO,
					projectId,
				}),
			).rejects.toThrow(NotFoundError);

			expect(await mockCacheProvider.get(cacheKey)).toBeTruthy();
		});
	});

	describe("DeleteTaskService Cache Invalidation", () => {
		it("should invalidate all related caches when deleting a task", async () => {
			const taskId = generateUUID();
			const projectId = generateUUID();

			const task = createTask({
				id: taskId,
				title: "Task to Delete",
				description: "Will be deleted",
				status: TaskStatus.TODO,
				projectId,
			});

			const project = Project.create({
				title: "Project with Task",
				description: "Has tasks",
				tags: ["project"],
			});
			project.updateTaskIds([taskId, "other-task-id"]);

			taskFindByIdSpy.mockResolvedValue(task);
			projectFindByIdSpy.mockResolvedValue(project);
			projectUpdateSpy.mockResolvedValue(project);
			taskDeleteSpy.mockResolvedValue();

			const cacheEntries = [
				{ key: CacheKeys.task(taskId), value: task.toJSON() },

				{ key: "ligue-lead:tasks:list:p1_l10_abc", value: { tasks: [] } },
				{ key: "ligue-lead:tasks:list:p2_l20_def", value: { tasks: [] } },

				{ key: CacheKeys.tasksByProject(projectId), value: { tasks: [] } },

				{ key: CacheKeys.project(projectId), value: { project: "data" } },
			];

			for (const entry of cacheEntries) {
				await mockCacheProvider.set(entry.key, entry.value);
			}

			await deleteTaskService.execute({ id: taskId });

			expect(await mockCacheProvider.get(CacheKeys.task(taskId))).toBeNull();
			expect(
				await mockCacheProvider.get("ligue-lead:tasks:list:p1_l10_abc"),
			).toBeNull();
			expect(
				await mockCacheProvider.get("ligue-lead:tasks:list:p2_l20_def"),
			).toBeNull();
			expect(
				await mockCacheProvider.get(CacheKeys.tasksByProject(projectId)),
			).toBeNull();
			expect(
				await mockCacheProvider.get(CacheKeys.project(projectId)),
			).toBeNull();
		});

		it("should not invalidate cache when task not found", async () => {
			const taskId = generateUUID();
			taskFindByIdSpy.mockResolvedValue(null);

			const taskCacheKey = CacheKeys.task(taskId);
			await mockCacheProvider.set(taskCacheKey, { task: "data" });

			await expect(deleteTaskService.execute({ id: taskId })).rejects.toThrow(
				NotFoundError,
			);

			expect(await mockCacheProvider.get(taskCacheKey)).toBeTruthy();
		});

		it("should not invalidate cache when project not found", async () => {
			const taskId = generateUUID();
			const projectId = generateUUID();

			const task = createTask({
				id: taskId,
				projectId,
			});

			taskFindByIdSpy.mockResolvedValue(task);
			projectFindByIdSpy.mockResolvedValue(null);

			const taskCacheKey = CacheKeys.task(taskId);
			await mockCacheProvider.set(taskCacheKey, { task: "data" });

			await expect(deleteTaskService.execute({ id: taskId })).rejects.toThrow(
				NotFoundError,
			);

			expect(await mockCacheProvider.get(taskCacheKey)).toBeTruthy();
		});
	});

	describe("Cache Pattern Validation", () => {
		it("should use correct cache key patterns for task operations", async () => {
			const taskId = generateUUID();
			const projectId = generateUUID();

			const task = createTask({ id: taskId, projectId });
			taskFindByIdSpy.mockResolvedValue(task);
			taskUpdateSpy.mockResolvedValue(task);

			const deleteSpy = jest.spyOn(mockCacheProvider, "delete");
			const deleteByPatternSpy = jest.spyOn(
				mockCacheProvider,
				"deleteByPattern",
			);

			await updateTaskService.execute({
				id: taskId,
				title: "Updated",
			});

			expect(deleteSpy).toHaveBeenCalledWith(CacheKeys.task(taskId));
			expect(deleteSpy).toHaveBeenCalledWith(
				CacheKeys.tasksByProject(projectId),
			);
			expect(deleteSpy).toHaveBeenCalledWith(CacheKeys.project(projectId));

			expect(deleteByPatternSpy).toHaveBeenCalledWith(
				CacheKeys.allTasksLists(),
			);
		});
	});

	describe("Cross-Service Cache Consistency", () => {
		it("should maintain cache consistency across task and project operations", async () => {
			const taskId = generateUUID();
			const projectId = generateUUID();

			const task = createTask({ id: taskId, projectId });
			taskFindByIdSpy.mockResolvedValue(task);
			taskUpdateSpy.mockResolvedValue(task);

			const projectCacheKey = CacheKeys.project(projectId);
			await mockCacheProvider.set(projectCacheKey, {
				id: projectId,
				tasks: [task],
			});

			await updateTaskService.execute({
				id: taskId,
				title: "Updated Task",
			});

			expect(await mockCacheProvider.get(projectCacheKey)).toBeNull();
		});
	});
});
