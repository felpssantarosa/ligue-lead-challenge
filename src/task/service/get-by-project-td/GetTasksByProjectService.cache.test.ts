import "reflect-metadata";
import { Project } from "@/project/domain/Project";
import type { GetProjectServiceResponse } from "@/project/service/get/GetProjectService";
import { CacheKeys } from "@/shared/cache";
import { TaskStatus } from "@/shared/domain/TaskStatus";
import { ApplicationError, NotFoundError } from "@/shared/Errors";
import { GetTasksByProjectService } from "@/task/service/get-by-project-td/GetTasksByProjectService";
import { generateUUID } from "@/test/factories";
import {
	createProjectServiceMock,
	createTask,
	MockCacheProvider,
	mockTaskRepository,
} from "@/test/mocks";

// Helper function to convert Project to GetProjectServiceResponse
const projectToResponse = (project: Project): GetProjectServiceResponse => ({
	id: project.id,
	title: project.title,
	description: project.description,
	tags: project.tags,
	tasks: [],
	createdAt: project.createdAt,
	updatedAt: project.updatedAt,
});

describe("GetTasksByProjectService - Cache Behavior", () => {
	let getTasksByProjectService: GetTasksByProjectService;
	let mockCacheProvider: MockCacheProvider;
	let mockProjectService: ReturnType<typeof createProjectServiceMock>;

	const taskFindByProjectIdSpy = jest.spyOn(
		mockTaskRepository,
		"findByProjectId",
	);

	beforeEach(() => {
		mockCacheProvider = new MockCacheProvider();
		mockProjectService = createProjectServiceMock();

		getTasksByProjectService = new GetTasksByProjectService(
			mockTaskRepository,
			mockProjectService,
			mockCacheProvider,
		);

		mockTaskRepository.clear();
		jest.clearAllMocks();
	});

	describe("Cache Hit Scenarios", () => {
		it("should return cached tasks when cache hit occurs", async () => {
			const projectId = generateUUID();
			const cachedTasks = {
				tasks: [
					{
						id: generateUUID(),
						title: "Cached Task 1",
						description: "From cache",
						status: TaskStatus.TODO,
						projectId,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					{
						id: generateUUID(),
						title: "Cached Task 2",
						description: "Also from cache",
						status: TaskStatus.IN_PROGRESS,
						projectId,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
				projectId,
			};

			const cacheKey = CacheKeys.tasksByProject(projectId);
			await mockCacheProvider.set(cacheKey, cachedTasks);

			const result = await getTasksByProjectService.execute({ projectId });

			expect(result).toEqual(cachedTasks);

			expect(mockProjectService.get).not.toHaveBeenCalled();
			expect(taskFindByProjectIdSpy).not.toHaveBeenCalled();
		});

		it("should handle empty cached task list", async () => {
			const projectId = generateUUID();
			const emptyCachedResult = {
				projectId,
				tasks: [],
			};

			const cacheKey = CacheKeys.tasksByProject(projectId);
			await mockCacheProvider.set(cacheKey, emptyCachedResult);

			const result = await getTasksByProjectService.execute({ projectId });

			expect(result.tasks).toHaveLength(0);
			expect(result.projectId).toBe(projectId);
			expect(mockProjectService.get).not.toHaveBeenCalled();
		});
	});

	describe("Cache Miss Scenarios", () => {
		it("should fetch from database and cache result when cache miss", async () => {
			const projectId = generateUUID();
			const projectData = Project.fromJSON({
				id: projectId,
				title: "Test Project",
				description: "Test description",
				tags: ["test"],
				taskIds: [],
				ownerId: "test-owner-id",
				githubRepositories: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			const tasks = [
				createTask({
					title: "Database Task 1",
					description: "From database",
					status: TaskStatus.TODO,
					projectId,
				}),
				createTask({
					title: "Database Task 2",
					description: "Also from database",
					status: TaskStatus.DONE,
					projectId,
				}),
			];

			const projectResponse = {
				id: projectData.id,
				title: projectData.title,
				description: projectData.description,
				tags: projectData.tags,
				tasks: [],
				createdAt: projectData.createdAt,
				updatedAt: projectData.updatedAt,
			};

			mockProjectService.get.mockResolvedValue(projectResponse);
			taskFindByProjectIdSpy.mockResolvedValue(tasks);

			const cacheKey = CacheKeys.tasksByProject(projectId);
			expect(await mockCacheProvider.get(cacheKey)).toBeNull();

			const result = await getTasksByProjectService.execute({ projectId });

			expect(mockProjectService.get).toHaveBeenCalledWith({ id: projectId });
			expect(taskFindByProjectIdSpy).toHaveBeenCalledWith(projectId);

			expect(result.tasks).toHaveLength(2);
			expect(result.projectId).toBe(projectId);
			expect(result.tasks[0].title).toBe("Database Task 1");
			expect(result.tasks[1].title).toBe("Database Task 2");

			const cachedResult = await mockCacheProvider.get(cacheKey);
			expect(cachedResult).toEqual(result);

			const ttl = await mockCacheProvider.getTtl(cacheKey);
			expect(ttl).toBeGreaterThan(590);
			expect(ttl).toBeLessThanOrEqual(600);
		});

		it("should handle project with no tasks", async () => {
			const projectId = generateUUID();
			const projectData = Project.fromJSON({
				id: projectId,
				title: "Empty Project",
				description: "No tasks",
				tags: [],
				taskIds: [],
				ownerId: "test-owner-id",
				githubRepositories: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			mockProjectService.get.mockResolvedValue(projectToResponse(projectData));
			taskFindByProjectIdSpy.mockResolvedValue([]);

			const result = await getTasksByProjectService.execute({ projectId });

			expect(result.tasks).toHaveLength(0);
			expect(result.projectId).toBe(projectId);

			const cacheKey = CacheKeys.tasksByProject(projectId);
			const cachedResult = await mockCacheProvider.get(cacheKey);
			expect(cachedResult).toEqual(result);
		});
	});

	describe("Error Scenarios", () => {
		it("should throw NotFoundError when project not found", async () => {
			const projectId = generateUUID();
			mockProjectService.get.mockResolvedValue(null);

			await expect(
				getTasksByProjectService.execute({ projectId }),
			).rejects.toThrow(NotFoundError);

			const cacheKey = CacheKeys.tasksByProject(projectId);
			const cachedResult = await mockCacheProvider.get(cacheKey);
			expect(cachedResult).toBeNull();

			expect(taskFindByProjectIdSpy).not.toHaveBeenCalled();
		});

		it("should throw ApplicationError when project ID mismatch occurs", async () => {
			const requestedProjectId = generateUUID();
			const returnedProjectId = generateUUID();

			const projectData = Project.fromJSON({
				id: returnedProjectId,
				title: "Wrong Project",
				description: "ID mismatch",
				tags: [],
				taskIds: [],
				ownerId: "test-owner-id",
				githubRepositories: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			mockProjectService.get.mockResolvedValue(projectToResponse(projectData));

			await expect(
				getTasksByProjectService.execute({ projectId: requestedProjectId }),
			).rejects.toThrow(ApplicationError);

			const cacheKey = CacheKeys.tasksByProject(requestedProjectId);
			const cachedResult = await mockCacheProvider.get(cacheKey);
			expect(cachedResult).toBeNull();
		});

		it("should handle task repository errors gracefully", async () => {
			const projectId = generateUUID();
			const projectData = Project.fromJSON({
				id: projectId,
				title: "Test Project",
				description: "Test description",
				tags: ["test"],
				taskIds: [],
				ownerId: "test-owner-id",
				githubRepositories: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			mockProjectService.get.mockResolvedValue(projectToResponse(projectData));
			taskFindByProjectIdSpy.mockRejectedValue(
				new Error("Task repository error"),
			);

			await expect(
				getTasksByProjectService.execute({ projectId }),
			).rejects.toThrow("Task repository error");

			const cacheKey = CacheKeys.tasksByProject(projectId);
			const cachedResult = await mockCacheProvider.get(cacheKey);
			expect(cachedResult).toBeNull();
		});
	});

	describe("Cache Invalidation Impact", () => {
		it("should handle cache expiration correctly", async () => {
			const projectId = generateUUID();
			const expiredData = {
				tasks: [
					{
						id: generateUUID(),
						title: "Expired Task",
						description: "Should be refreshed",
						status: TaskStatus.TODO,
						projectId,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
				projectId,
			};

			const cacheKey = CacheKeys.tasksByProject(projectId);
			await mockCacheProvider.set(cacheKey, expiredData, 1);

			await new Promise((resolve) => setTimeout(resolve, 1100));

			expect(await mockCacheProvider.get(cacheKey)).toBeNull();

			const projectData = Project.fromJSON({
				id: projectId,
				title: "Fresh Project",
				description: "After expiration",
				tags: ["fresh"],
				taskIds: [],
				ownerId: "test-owner-id",
				githubRepositories: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			const freshTasks = [
				createTask({
					title: "Fresh Task",
					description: "From database after expiration",
					status: TaskStatus.IN_PROGRESS,
					projectId,
				}),
			];

			mockProjectService.get.mockResolvedValue(projectToResponse(projectData));
			taskFindByProjectIdSpy.mockResolvedValue(freshTasks);

			const result = await getTasksByProjectService.execute({ projectId });

			expect(mockProjectService.get).toHaveBeenCalledWith({ id: projectId });
			expect(taskFindByProjectIdSpy).toHaveBeenCalledWith(projectId);
			expect(result.tasks[0].title).toBe("Fresh Task");
		});
	});

	describe("Cache Key Specificity", () => {
		it("should use project-specific cache keys", async () => {
			const projectId1 = generateUUID();
			const projectId2 = generateUUID();

			const project1Tasks = {
				tasks: [
					{
						id: generateUUID(),
						title: "Project 1 Task",
						description: "Belongs to project 1",
						status: TaskStatus.TODO,
						projectId: projectId1,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
				projectId: projectId1,
			};

			const project2Tasks = {
				tasks: [
					{
						id: generateUUID(),
						title: "Project 2 Task",
						description: "Belongs to project 2",
						status: TaskStatus.DONE,
						projectId: projectId2,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
				projectId: projectId2,
			};

			await mockCacheProvider.set(
				CacheKeys.tasksByProject(projectId1),
				project1Tasks,
			);
			await mockCacheProvider.set(
				CacheKeys.tasksByProject(projectId2),
				project2Tasks,
			);

			const result1 = await getTasksByProjectService.execute({
				projectId: projectId1,
			});
			const result2 = await getTasksByProjectService.execute({
				projectId: projectId2,
			});

			expect(result1.tasks[0].title).toBe("Project 1 Task");
			expect(result2.tasks[0].title).toBe("Project 2 Task");
			expect(result1.projectId).toBe(projectId1);
			expect(result2.projectId).toBe(projectId2);

			expect(mockProjectService.get).not.toHaveBeenCalled();
			expect(taskFindByProjectIdSpy).not.toHaveBeenCalled();
		});
	});

	describe("Data Consistency", () => {
		it("should maintain consistent data structure between cache and database", async () => {
			const projectId = generateUUID();
			const projectData = Project.fromJSON({
				id: projectId,
				title: "Consistency Test",
				description: "Testing data consistency",
				tags: ["consistency"],
				taskIds: [],
				ownerId: "test-owner-id",
				githubRepositories: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			const dbTasks = [
				createTask({
					title: "Consistent Task",
					description: "Should be consistent",
					status: TaskStatus.IN_PROGRESS,
					projectId,
				}),
			];

			mockProjectService.get.mockResolvedValue(projectToResponse(projectData));
			taskFindByProjectIdSpy.mockResolvedValue(dbTasks);

			const resultFromDb = await getTasksByProjectService.execute({
				projectId,
			});

			const resultFromCache = await getTasksByProjectService.execute({
				projectId,
			});

			expect(resultFromDb).toEqual(resultFromCache);
			expect(resultFromDb.tasks[0]).toHaveProperty("id");
			expect(resultFromDb.tasks[0]).toHaveProperty("title");
			expect(resultFromDb.tasks[0]).toHaveProperty("description");
			expect(resultFromDb.tasks[0]).toHaveProperty("status");
			expect(resultFromDb.tasks[0]).toHaveProperty("projectId");
			expect(resultFromDb.tasks[0]).toHaveProperty("createdAt");
			expect(resultFromDb.tasks[0]).toHaveProperty("updatedAt");

			expect(mockProjectService.get).toHaveBeenCalledTimes(1);
			expect(taskFindByProjectIdSpy).toHaveBeenCalledTimes(1);
		});
	});
});
