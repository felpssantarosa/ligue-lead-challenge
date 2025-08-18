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
	mockCheckProjectOwnershipService,
	mockProjectRepository,
	mockTaskRepository,
	mockUserService,
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
		(mockCheckProjectOwnershipService.execute as jest.Mock).mockResolvedValue(true);
		(mockUserService.findById as jest.Mock).mockResolvedValue({
			id: "test-user-id",
			name: "Test User",
			email: "test@example.com",
		});
		
		updateTaskService = new UpdateTaskService(
			mockTaskRepository,
			mockCacheProvider,
			mockCheckProjectOwnershipService,
			mockUserService,
		);

		createTaskService = new CreateTaskService(
			mockTaskRepository,
			mockProjectRepository,
			mockCacheProvider,
			mockCheckProjectOwnershipService,
			mockUserService,
		);

		deleteTaskService = new DeleteTaskService(
			mockTaskRepository,
			mockProjectRepository,
			mockCacheProvider,
			mockCheckProjectOwnershipService,
			mockUserService,
		);

		mockTaskRepository.clear();
		mockProjectRepository.clear();
		jest.clearAllMocks();
	});

	describe("UpdateTaskService Cache Invalidation", () => {
		it("should invalidate all related caches when updating a task", async () => {
			const taskId = generateUUID();
			const projectId = "725f34a7-1237-4467-8ac7-e8d2eabad75e";

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

			const project = Project.fromJSON({
				id: projectId,
				title: "Test Project",
				description: "Project for testing",
				tags: ["test"],
				ownerId: "test-user-id",
				taskIds: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			taskFindByIdSpy.mockResolvedValue(existingTask);
			taskUpdateSpy.mockResolvedValue(updatedTask);
			projectFindByIdSpy.mockResolvedValue(project);

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
				taskId,
				ownerId: "test-user-id",
				title: "Updated Task",
				description: "Updated description",
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
					taskId,
					ownerId: "test-user-id",
					title: "New Title",
				}),
			).rejects.toThrow(NotFoundError);

			expect(await mockCacheProvider.get(taskCacheKey)).toBeTruthy();
		});
	});

	describe("CreateTaskService Cache Invalidation", () => {
		it("should invalidate related caches when creating a task", async () => {
			const projectId = "c72930fa-4782-4942-a2cc-3a53edc77986";
			const taskId = generateUUID();

			const project = Project.fromJSON({
				id: projectId,
				title: "Test Project",
				description: "Test description",
				tags: ["test"],
				ownerId: "test-user-id",
				taskIds: [],
				createdAt: new Date(),
				updatedAt: new Date(),
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
				ownerId: "test-user-id",
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
					ownerId: "test-user-id",
				}),
			).rejects.toThrow(NotFoundError);

			expect(await mockCacheProvider.get(cacheKey)).toBeTruthy();
		});
	});

	describe("DeleteTaskService Cache Invalidation", () => {
		it("should invalidate all related caches when deleting a task", async () => {
			const taskId = generateUUID();
			const projectId = "21d1054c-ca45-4355-9059-b618fe5abf48";

			const task = createTask({
				id: taskId,
				title: "Task to Delete",
				description: "Will be deleted",
				status: TaskStatus.TODO,
				projectId,
			});

			const project = Project.fromJSON({
				id: projectId,
				title: "Project with Task",
				description: "Has tasks",
				tags: ["project"],
				ownerId: "test-user-id",
				taskIds: [taskId, "other-task-id"],
				createdAt: new Date(),
				updatedAt: new Date(),
			});

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

			await deleteTaskService.execute({ taskId, ownerId: "test-user-id" });

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

			await expect(
				deleteTaskService.execute({ taskId, ownerId: "test-user-id" }),
			).rejects.toThrow(NotFoundError);

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

			await expect(
				deleteTaskService.execute({ taskId, ownerId: "test-user-id" }),
			).rejects.toThrow(NotFoundError);

			expect(await mockCacheProvider.get(taskCacheKey)).toBeTruthy();
		});
	});

	describe("Cache Pattern Validation", () => {
		it("should use correct cache key patterns for task operations", async () => {
			const taskId = generateUUID();
			const projectId = "ecdb6b43-8045-43fe-aca9-4d4814c593ce";

			const task = createTask({ id: taskId, projectId });
			const project = Project.fromJSON({
				id: projectId,
				title: "Test Project",
				description: "Test description",
				tags: ["test"],
				ownerId: "test-user-id",
				taskIds: [taskId],
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			taskFindByIdSpy.mockResolvedValue(task);
			taskUpdateSpy.mockResolvedValue(task);
			projectFindByIdSpy.mockResolvedValue(project);

			const deleteSpy = jest.spyOn(mockCacheProvider, "delete");
			const deleteByPatternSpy = jest.spyOn(
				mockCacheProvider,
				"deleteByPattern",
			);

			await updateTaskService.execute({
				taskId,
				ownerId: "test-user-id",
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
			const projectId = "e0d51300-bb51-480f-b824-9e8a723e849c";

			const task = createTask({ id: taskId, projectId });
			const project = Project.fromJSON({
				id: projectId,
				title: "Test Project",
				description: "Test description",
				tags: ["test"],
				ownerId: "test-user-id",
				taskIds: [taskId],
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			taskFindByIdSpy.mockResolvedValue(task);
			taskUpdateSpy.mockResolvedValue(task);
			projectFindByIdSpy.mockResolvedValue(project);

			const projectCacheKey = CacheKeys.project(projectId);
			await mockCacheProvider.set(projectCacheKey, {
				id: projectId,
				ownerId: "test-user-id",
				tasks: [task],
			});

			await updateTaskService.execute({
				taskId,
				ownerId: "test-user-id",
				title: "Updated Task",
			});

			expect(await mockCacheProvider.get(projectCacheKey)).toBeNull();
		});
	});
});
