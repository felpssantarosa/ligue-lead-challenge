import "reflect-metadata";
import { GetAllProjectsService } from "@/project/service/get-all/GetAllProjectsService";
import { CacheKeys } from "@/shared/cache";
import { TaskStatus } from "@/shared/domain/TaskStatus";
import { GetAllTasksService } from "@/task/service/get-all/GetAllTasksService";
import {
	createProject,
	createTask,
	MockCacheProvider,
	mockProjectRepository,
	mockTaskRepository,
} from "@/test/mocks";

describe("List Services - Cache Behavior", () => {
	let getAllTasksService: GetAllTasksService;
	let getAllProjectsService: GetAllProjectsService;
	let mockCacheProvider: MockCacheProvider;

	const taskFindAllSpy = jest.spyOn(mockTaskRepository, "findAll");
	const projectFindAllSpy = jest.spyOn(mockProjectRepository, "findAll");

	beforeEach(() => {
		mockCacheProvider = new MockCacheProvider();

		getAllTasksService = new GetAllTasksService(
			mockTaskRepository,
			mockCacheProvider,
		);

		getAllProjectsService = new GetAllProjectsService(
			mockProjectRepository,
			mockCacheProvider,
		);

		mockTaskRepository.clear();
		mockProjectRepository.clear();
		jest.clearAllMocks();
	});

	describe("GetAllTasksService Cache Behavior", () => {
		it("should cache task list results with correct cache keys", async () => {
			const tasks = [
				createTask({ title: "Task 1", status: TaskStatus.TODO }),
				createTask({ title: "Task 2", status: TaskStatus.IN_PROGRESS }),
			];

			taskFindAllSpy.mockResolvedValue(tasks);

			const params = { page: 1, limit: 10, search: "test query" };
			const filters = { search: "test query" };
			const expectedCacheKey = CacheKeys.tasksList({
				page: 1,
				limit: 10,
				filters,
			});

			expect(await mockCacheProvider.get(expectedCacheKey)).toBeNull();

			const result1 = await getAllTasksService.execute(params);

			expect(taskFindAllSpy).toHaveBeenCalledWith({
				limit: 10,
				page: 1,
				search: "test query",
			});

			expect(result1).toEqual({
				tasks,
				total: 2,
				page: 1,
				limit: 10,
			});

			const cachedResult = await mockCacheProvider.get(expectedCacheKey);
			expect(cachedResult).toEqual(result1);

			const result2 = await getAllTasksService.execute(params);

			expect(result2).toEqual(result1);

			expect(taskFindAllSpy).toHaveBeenCalledTimes(1);
		});

		it("should generate different cache keys for different parameters", async () => {
			const tasks = [createTask({ title: "Task" })];
			taskFindAllSpy.mockResolvedValue(tasks);

			const paramSets = [
				{ page: 1, limit: 10 },
				{ page: 2, limit: 10 },
				{ page: 1, limit: 20 },
				{ page: 1, limit: 10, search: "query1" },
				{ page: 1, limit: 10, search: "query2" },
			];

			const cacheKeys: string[] = [];

			for (const params of paramSets) {
				const filters = { search: params.search };
				const cacheKey = CacheKeys.tasksList({
					page: params.page,
					limit: params.limit,
					filters,
				});

				cacheKeys.push(cacheKey);

				await getAllTasksService.execute(params);

				const cached = await mockCacheProvider.get(cacheKey);
				expect(cached).toBeDefined();
			}

			const uniqueKeys = new Set(cacheKeys);
			expect(uniqueKeys.size).toBe(paramSets.length);

			expect(taskFindAllSpy).toHaveBeenCalledTimes(paramSets.length);
		});

		it("should handle default parameters correctly in cache keys", async () => {
			const tasks = [createTask({ title: "Default Task" })];
			taskFindAllSpy.mockResolvedValue(tasks);

			const result1 = await getAllTasksService.execute();

			const result2 = await getAllTasksService.execute({ page: 1, limit: 10 });

			expect(result1).toEqual(result2);
			expect(taskFindAllSpy).toHaveBeenCalledTimes(1);
		});

		it("should respect cache TTL settings", async () => {
			const tasks = [createTask({ title: "TTL Task" })];
			taskFindAllSpy.mockResolvedValue(tasks);

			const params = { page: 1, limit: 10 };
			const filters = { search: undefined };
			const cacheKey = CacheKeys.tasksList({ page: 1, limit: 10, filters });

			await getAllTasksService.execute(params);

			const ttl = await mockCacheProvider.getTtl(cacheKey);
			expect(ttl).toBeGreaterThan(590);
			expect(ttl).toBeLessThanOrEqual(600);
		});
	});

	describe("GetAllProjectsService Cache Behavior", () => {
		it("should cache project list results with filters", async () => {
			const projects = [
				createProject({ title: "Project 1", tags: ["web"] }),
				createProject({ title: "Project 2", tags: ["mobile"] }),
			];

			projectFindAllSpy.mockResolvedValue(projects);

			const params = {
				page: 1,
				limit: 10,
				search: "project",
				tags: ["web", "mobile"],
			};

			const result1 = await getAllProjectsService.execute(params);

			expect(result1).toEqual({
				projects: projects.map((p) => ({
					id: p.id,
					title: p.title,
					description: p.description,
					githubRepositories: p.githubRepositories,
					tags: p.tags,
					createdAt: p.createdAt,
					updatedAt: p.updatedAt,
				})),
				total: 2,
			});

			projectFindAllSpy.mockClear();
			const result2 = await getAllProjectsService.execute(params);
			expect(result2).toEqual(result1);
			expect(projectFindAllSpy).not.toHaveBeenCalled();
		});

		it("should handle complex filter combinations in cache keys", async () => {
			const projects = [createProject({ title: "Test Project" })];
			projectFindAllSpy.mockResolvedValue(projects);

			const filterCombinations = [
				{ search: "test", tags: ["web"] },
				{ search: "test", tags: ["mobile"] },
				{ search: "other", tags: ["web"] },
				{ tags: ["web", "mobile"] },
				{ search: "query" },
				{},
			];

			const cacheKeys: string[] = [];

			for (const filters of filterCombinations) {
				const params = { page: 1, limit: 10, ...filters };
				const cacheKey = CacheKeys.projectsList({
					page: 1,
					limit: 10,
					filters,
				});

				cacheKeys.push(cacheKey);
				await getAllProjectsService.execute(params);
			}

			const uniqueKeys = new Set(cacheKeys);
			expect(uniqueKeys.size).toBe(filterCombinations.length);
		});
	});

	describe("Cache Invalidation Impact on Lists", () => {
		it("should handle list cache invalidation patterns correctly", async () => {
			const listCaches = [
				{
					key: "ligue-lead:tasks:list:p1_l10_abc123",
					value: { tasks: ["task1"] },
				},
				{
					key: "ligue-lead:tasks:list:p2_l20_def456",
					value: { tasks: ["task2"] },
				},
				{
					key: "ligue-lead:projects:list:p1_l10_xyz789",
					value: { projects: ["proj1"] },
				},
			];

			for (const cache of listCaches) {
				await mockCacheProvider.set(cache.key, cache.value);
			}

			for (const cache of listCaches) {
				expect(await mockCacheProvider.get(cache.key)).toBeTruthy();
			}

			await mockCacheProvider.deleteByPattern(CacheKeys.allTasksLists());

			expect(
				await mockCacheProvider.get("ligue-lead:tasks:list:p1_l10_abc123"),
			).toBeNull();
			expect(
				await mockCacheProvider.get("ligue-lead:tasks:list:p2_l20_def456"),
			).toBeNull();

			expect(
				await mockCacheProvider.get("ligue-lead:projects:list:p1_l10_xyz789"),
			).toBeTruthy();
		});
	});

	describe("Cache Performance Scenarios", () => {
		it("should handle high-frequency list requests efficiently", async () => {
			const tasks = [createTask({ title: "Frequent Task" })];
			taskFindAllSpy.mockResolvedValue(tasks);

			const params = { page: 1, limit: 10 };

			await getAllTasksService.execute(params);
			expect(taskFindAllSpy).toHaveBeenCalledTimes(1);

			await getAllTasksService.execute(params);
			await getAllTasksService.execute(params);
			await getAllTasksService.execute(params);
			await getAllTasksService.execute(params);

			expect(taskFindAllSpy).toHaveBeenCalledTimes(1);
		});

		it("should handle cache expiration for list data", async () => {
			const tasks = [createTask({ title: "Expiring List Task" })];
			taskFindAllSpy.mockResolvedValue(tasks);

			const params = { page: 1, limit: 10 };
			const filters = { search: undefined };
			const cacheKey = CacheKeys.tasksList({ page: 1, limit: 10, filters });

			await mockCacheProvider.set(cacheKey, { cached: "data" }, 1);

			await new Promise((resolve) => setTimeout(resolve, 1100));

			expect(await mockCacheProvider.get(cacheKey)).toBeNull();

			const result = await getAllTasksService.execute(params);

			expect(taskFindAllSpy).toHaveBeenCalledTimes(1);
			expect(result.tasks).toEqual(tasks);
		});
	});

	describe("Error Handling with List Caches", () => {
		it("should not cache results when database errors occur", async () => {
			const params = { page: 1, limit: 10 };
			const filters = { search: undefined };
			const cacheKey = CacheKeys.tasksList({ page: 1, limit: 10, filters });

			taskFindAllSpy.mockRejectedValue(new Error("Database error"));

			await expect(getAllTasksService.execute(params)).rejects.toThrow(
				"Database error",
			);

			expect(await mockCacheProvider.get(cacheKey)).toBeNull();
		});

		it("should handle invalid pagination parameters", async () => {
			const invalidParams = { page: -1, limit: 0 };

			await expect(
				getAllProjectsService.execute(invalidParams),
			).rejects.toThrow("Invalid pagination parameters");

			expect(projectFindAllSpy).not.toHaveBeenCalled();
		});
	});
});
