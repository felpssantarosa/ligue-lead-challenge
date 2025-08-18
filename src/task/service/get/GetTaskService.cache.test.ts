import "reflect-metadata";
import { CacheKeys } from "@/shared/cache";
import { TaskStatus } from "@/shared/domain/TaskStatus";
import { NotFoundError } from "@/shared/Errors";
import { Task } from "@/task/domain";
import { GetTaskService } from "@/task/service/get/GetTaskService";
import { generateUUID } from "@/test/factories";
import {
	createTask,
	MockCacheProvider,
	mockTaskRepository,
} from "@/test/mocks";

describe("GetTaskService - Cache Behavior", () => {
	let getTaskService: GetTaskService;
	let mockCacheProvider: MockCacheProvider;
	const findByIdSpy = jest.spyOn(mockTaskRepository, "findById");

	beforeEach(() => {
		mockCacheProvider = new MockCacheProvider();
		getTaskService = new GetTaskService(mockTaskRepository, mockCacheProvider);

		mockTaskRepository.clear();
		jest.clearAllMocks();
	});

	describe("Cache Hit Scenarios", () => {
		it("should return cached task when cache hit occurs", async () => {
			const taskId = generateUUID();
			const cachedTaskData = {
				id: taskId,
				title: "Cached Task",
				description: "From cache",
				status: "IN_PROGRESS",
				projectId: generateUUID(),
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const cacheKey = CacheKeys.task(taskId);
			await mockCacheProvider.set(cacheKey, cachedTaskData);

			const result = await getTaskService.execute({ id: taskId });

			expect(result).toBeInstanceOf(Task);
			expect(result.title).toBe("Cached Task");
			expect(result.description).toBe("From cache");
			expect(result.status).toBe("IN_PROGRESS");

			expect(findByIdSpy).not.toHaveBeenCalled();
		});

		it("should handle cached task with all statuses correctly", async () => {
			const statuses = [
				TaskStatus.TODO,
				TaskStatus.IN_PROGRESS,
				TaskStatus.DONE,
			] as const;

			for (const status of statuses) {
				const taskId = generateUUID();
				const cachedTaskData = {
					id: taskId,
					title: `Task ${status}`,
					description: `Task with status ${status}`,
					status,
					projectId: generateUUID(),
					createdAt: new Date(),
					updatedAt: new Date(),
				};

				const cacheKey = CacheKeys.task(taskId);
				await mockCacheProvider.set(cacheKey, cachedTaskData);

				const result = await getTaskService.execute({ id: taskId });

				expect(result.status).toBe(status);
				expect(result.title).toBe(`Task ${status}`);
			}

			expect(findByIdSpy).not.toHaveBeenCalled();
		});
	});

	describe("Cache Miss Scenarios", () => {
		it("should fetch from database and cache result when cache miss", async () => {
			const taskId = generateUUID();
			const projectId = generateUUID();
			const task = createTask({
				id: taskId,
				title: "Database Task",
				description: "From database",
				status: TaskStatus.TODO,
				projectId,
			});

			findByIdSpy.mockResolvedValue(task);

			const cacheKey = CacheKeys.task(taskId);
			expect(await mockCacheProvider.get(cacheKey)).toBeNull();

			const result = await getTaskService.execute({ id: taskId });

			expect(findByIdSpy).toHaveBeenCalledWith(taskId);

			expect(result).toBeInstanceOf(Task);
			expect(result.title).toBe("Database Task");
			expect(result.description).toBe("From database");

			const cachedResult = await mockCacheProvider.get(cacheKey);
			expect(cachedResult).toBeDefined();
			expect(cachedResult).toEqual(result.toJSON());

			const ttl = await mockCacheProvider.getTtl(cacheKey);
			expect(ttl).toBeGreaterThan(590);
			expect(ttl).toBeLessThanOrEqual(600);
		});

		it("should create Task instance from database result", async () => {
			const taskId = generateUUID();
			const dbTask = createTask({
				id: taskId,
				title: "DB Task",
				description: "Database task",
				status: TaskStatus.IN_PROGRESS,
				projectId: generateUUID(),
			});

			findByIdSpy.mockResolvedValue(dbTask);

			const result = await getTaskService.execute({ id: taskId });

			expect(result).toBeInstanceOf(Task);
			expect(typeof result.update).toBe("function");
			expect(typeof result.toJSON).toBe("function");
			expect(result.title).toBe("DB Task");
		});
	});

	describe("Error Scenarios", () => {
		it("should throw NotFoundError and not cache when task not found", async () => {
			const taskId = generateUUID();
			findByIdSpy.mockResolvedValue(null);

			await expect(getTaskService.execute({ id: taskId })).rejects.toThrow(
				NotFoundError,
			);

			const cacheKey = CacheKeys.task(taskId);
			const cachedResult = await mockCacheProvider.get(cacheKey);
			expect(cachedResult).toBeNull();
		});

		it("should handle repository errors without caching", async () => {
			const taskId = generateUUID();
			findByIdSpy.mockRejectedValue(new Error("Database connection error"));

			await expect(getTaskService.execute({ id: taskId })).rejects.toThrow(
				"Database connection error",
			);

			const cacheKey = CacheKeys.task(taskId);
			const cachedResult = await mockCacheProvider.get(cacheKey);
			expect(cachedResult).toBeNull();
		});
	});

	describe("Cache Invalidation Tests", () => {
		it("should handle cache expiration correctly", async () => {
			const taskId = generateUUID();
			const expiredTaskData = {
				id: taskId,
				title: "Expiring Task",
				description: "Will expire",
				status: "TODO",
				projectId: generateUUID(),
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const cacheKey = CacheKeys.task(taskId);
			await mockCacheProvider.set(cacheKey, expiredTaskData, 1);

			await new Promise((resolve) => setTimeout(resolve, 1100));

			expect(await mockCacheProvider.get(cacheKey)).toBeNull();

			const freshTask = createTask({
				id: taskId,
				title: "Fresh Task",
				description: "From database after expiration",
				status: TaskStatus.IN_PROGRESS,
			});
			findByIdSpy.mockResolvedValue(freshTask);

			const result = await getTaskService.execute({ id: taskId });

			expect(findByIdSpy).toHaveBeenCalledWith(taskId);
			expect(result.title).toBe("Fresh Task");
			expect(result.status).toBe(TaskStatus.IN_PROGRESS);
		});
	});

	describe("Cache Key Generation", () => {
		it("should use correct cache keys for different tasks", async () => {
			const taskId1 = generateUUID();
			const taskId2 = generateUUID();

			const task1Data = {
				id: taskId1,
				title: "Task 1",
				description: "First task",
				status: "TODO",
				projectId: generateUUID(),
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const task2Data = {
				id: taskId2,
				title: "Task 2",
				description: "Second task",
				status: "DONE",
				projectId: generateUUID(),
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			await mockCacheProvider.set(CacheKeys.task(taskId1), task1Data);
			await mockCacheProvider.set(CacheKeys.task(taskId2), task2Data);

			const result1 = await getTaskService.execute({ id: taskId1 });
			const result2 = await getTaskService.execute({ id: taskId2 });

			expect(result1.title).toBe("Task 1");
			expect(result1.status).toBe("TODO");
			expect(result2.title).toBe("Task 2");
			expect(result2.status).toBe("DONE");

			expect(findByIdSpy).not.toHaveBeenCalled();
		});
	});

	describe("Task Instance Consistency", () => {
		it("should return consistent Task instances from cache and database", async () => {
			const taskId = generateUUID();

			const dbTask = createTask({
				id: taskId,
				title: "Consistent Task",
				description: "Should behave the same",
				status: TaskStatus.IN_PROGRESS,
				projectId: generateUUID(),
			});
			findByIdSpy.mockResolvedValue(dbTask);
			const resultFromDb = await getTaskService.execute({ id: taskId });

			const resultFromCache = await getTaskService.execute({ id: taskId });

			expect(resultFromDb).toBeInstanceOf(Task);
			expect(resultFromCache).toBeInstanceOf(Task);

			expect(resultFromDb.title).toBe(resultFromCache.title);
			expect(resultFromDb.description).toBe(resultFromCache.description);
			expect(resultFromDb.status).toBe(resultFromCache.status);
			expect(resultFromDb.id).toBe(resultFromCache.id);

			expect(findByIdSpy).toHaveBeenCalledTimes(1);
		});
	});
});
