import "reflect-metadata";
import { Project } from "@/project/domain";
import { GetProjectService } from "@/project/service/get/GetProjectService";
import { CacheKeys } from "@/shared/cache";
import { NotFoundError } from "@/shared/Errors";
import { generateUUID } from "@/test/factories";
import {
	createTask,
	MockCacheProvider,
	mockProjectRepository,
	mockTaskService,
} from "@/test/mocks";

describe("GetProjectService - Cache Behavior", () => {
	let getProjectService: GetProjectService;
	let mockCacheProvider: MockCacheProvider;
	const findByIdSpy = jest.spyOn(mockProjectRepository, "findById");
	const taskServiceGetSpy = jest.spyOn(mockTaskService, "get");

	beforeEach(() => {
		mockCacheProvider = new MockCacheProvider();
		getProjectService = new GetProjectService(
			mockProjectRepository,
			mockTaskService,
			mockCacheProvider,
		);

		mockProjectRepository.clear();
		jest.clearAllMocks();
	});

	describe("Cache Hit Scenarios", () => {
		it("should return cached project when cache hit occurs", async () => {
			const projectId = generateUUID();
			const cachedProject = {
				id: projectId,
				title: "Cached Project",
				description: "From cache",
				tags: ["cached"],
				tasks: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const cacheKey = CacheKeys.project(projectId);
			await mockCacheProvider.set(cacheKey, cachedProject);

			const result = await getProjectService.execute({ id: projectId });

			expect(result).toEqual(cachedProject);

			expect(findByIdSpy).not.toHaveBeenCalled();
			expect(taskServiceGetSpy).not.toHaveBeenCalled();
		});

		it("should handle cache with tasks correctly", async () => {
			const projectId = generateUUID();
			const task1 = createTask({ title: "Task 1" });
			const task2 = createTask({ title: "Task 2" });

			const cachedProject = {
				id: projectId,
				title: "Project with Tasks",
				description: "Has tasks in cache",
				tags: ["project", "tasks"],
				tasks: [task1, task2],
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const cacheKey = CacheKeys.project(projectId);
			await mockCacheProvider.set(cacheKey, cachedProject);

			const result = await getProjectService.execute({ id: projectId });

			expect(result).toEqual(cachedProject);
			expect(result?.tasks).toHaveLength(2);
			expect(findByIdSpy).not.toHaveBeenCalled();
		});
	});

	describe("Cache Miss Scenarios", () => {
		it("should fetch from database and cache result when cache miss", async () => {
			const projectId = generateUUID();
			const project = Project.create({
				title: "Database Project",
				description: "From database",
				tags: ["db"],
				githubRepositories: [],
				ownerId: "test-owner-id",
			});
			project.updateTaskIds([generateUUID(), generateUUID()]);

			const task1 = createTask({ title: "DB Task 1" });
			const task2 = createTask({ title: "DB Task 2" });

			findByIdSpy.mockResolvedValue(project);
			taskServiceGetSpy
				.mockResolvedValueOnce(task1)
				.mockResolvedValueOnce(task2);

			const cacheKey = CacheKeys.project(projectId);
			expect(await mockCacheProvider.get(cacheKey)).toBeNull();

			const result = await getProjectService.execute({ id: projectId });

			expect(findByIdSpy).toHaveBeenCalledWith(projectId);
			expect(taskServiceGetSpy).toHaveBeenCalledTimes(2);
			expect(result).toBeDefined();
			expect(result?.title).toBe("Database Project");

			const cachedResult = await mockCacheProvider.get(cacheKey);
			expect(cachedResult).toEqual({
				id: expect.any(String),
				title: "Database Project",
				description: "From database",
				tags: ["db"],
				tasks: [
					expect.objectContaining({
						title: "DB Task 1",
						description: "Test task description",
						status: "todo",
						projectId: expect.any(String),
					}),
					expect.objectContaining({
						title: "DB Task 2",
						description: "Test task description",
						status: "todo",
						projectId: expect.any(String),
					}),
				],
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});

			const ttl = await mockCacheProvider.getTtl(cacheKey);
			expect(ttl).toBeGreaterThan(590);
			expect(ttl).toBeLessThanOrEqual(600);
		});

		it("should handle project with no tasks correctly", async () => {
			const projectId = generateUUID();
			const project = Project.create({
				title: "Empty Project",
				description: "No tasks",
				tags: ["empty"],
				githubRepositories: [],
				ownerId: "test-owner-id",
			});

			findByIdSpy.mockResolvedValue(project);

			const result = await getProjectService.execute({ id: projectId });

			expect(result?.tasks).toEqual([]);
			expect(taskServiceGetSpy).not.toHaveBeenCalled();

			const cacheKey = CacheKeys.project(projectId);
			const cachedResult = await mockCacheProvider.get(cacheKey);
			expect(cachedResult).toBeDefined();
		});
	});

	describe("Error Scenarios", () => {
		it("should throw NotFoundError and not cache when project not found", async () => {
			const projectId = generateUUID();
			findByIdSpy.mockResolvedValue(null);

			await expect(
				getProjectService.execute({ id: projectId }),
			).rejects.toThrow(NotFoundError);

			const cacheKey = CacheKeys.project(projectId);
			const cachedResult = await mockCacheProvider.get(cacheKey);
			expect(cachedResult).toBeNull();
		});

		it("should handle task service errors gracefully", async () => {
			const projectId = generateUUID();
			const project = Project.create({
				title: "Project with Failed Tasks",
				description: "Task loading will fail",
				tags: ["error"],
				githubRepositories: [],
				ownerId: "test-owner-id",
			});
			project.updateTaskIds([generateUUID()]);

			findByIdSpy.mockResolvedValue(project);
			taskServiceGetSpy.mockRejectedValue(new Error("Task service error"));

			await expect(
				getProjectService.execute({ id: projectId }),
			).rejects.toThrow("Task service error");

			const cacheKey = CacheKeys.project(projectId);
			const cachedResult = await mockCacheProvider.get(cacheKey);
			expect(cachedResult).toBeNull();
		});
	});

	describe("Cache Invalidation Tests", () => {
		it("should handle cache expiration correctly", async () => {
			const projectId = generateUUID();
			const project = Project.create({
				title: "Expiring Project",
				description: "Will expire",
				tags: ["expire"],
				githubRepositories: [],
				ownerId: "test-owner-id",
			});

			const cacheKey = CacheKeys.project(projectId);
			await mockCacheProvider.set(
				cacheKey,
				{
					id: projectId,
					title: "Cached Version",
					description: "Should expire",
					tags: ["cached"],
					tasks: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				1,
			);

			await new Promise((resolve) => setTimeout(resolve, 1100));

			expect(await mockCacheProvider.get(cacheKey)).toBeNull();

			findByIdSpy.mockResolvedValue(project);

			const result = await getProjectService.execute({ id: projectId });

			expect(findByIdSpy).toHaveBeenCalledWith(projectId);
			expect(result?.title).toBe("Expiring Project");
		});
	});

	describe("Cache Key Generation", () => {
		it("should use correct cache keys for different projects", async () => {
			const projectId1 = generateUUID();
			const projectId2 = generateUUID();

			const project1Data = {
				id: projectId1,
				title: "Project 1",
				description: "First project",
				tags: ["p1"],
				tasks: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const project2Data = {
				id: projectId2,
				title: "Project 2",
				description: "Second project",
				tags: ["p2"],
				tasks: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			await mockCacheProvider.set(CacheKeys.project(projectId1), project1Data);
			await mockCacheProvider.set(CacheKeys.project(projectId2), project2Data);

			const result1 = await getProjectService.execute({ id: projectId1 });
			const result2 = await getProjectService.execute({ id: projectId2 });

			expect(result1?.title).toBe("Project 1");
			expect(result2?.title).toBe("Project 2");

			expect(findByIdSpy).not.toHaveBeenCalled();
		});
	});
});
