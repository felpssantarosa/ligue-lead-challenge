import "reflect-metadata";
import { DeleteProjectService } from "@/project/service/delete/DeleteProjectService";
import { CacheKeys } from "@/shared/cache";
import { ApplicationError, NotFoundError } from "@/shared/Errors";
import {
	createProject,
	MockCacheProvider,
	mockCheckProjectOwnershipService,
	mockProjectRepository,
	mockTaskService,
	mockUserService,
} from "@/test/mocks";
import { createUser } from "@/test/mocks/factories/UserMock";

describe("DeleteProjectService - Cache Invalidation", () => {
	let deleteProjectService: DeleteProjectService;
	let mockCacheProvider: MockCacheProvider;

	const findByIdSpy = jest.spyOn(mockProjectRepository, "findById");
	const deleteSpy = jest.spyOn(mockProjectRepository, "delete");
	const deleteByProjectIdSpy = jest.spyOn(mockTaskService, "deleteByProjectId");

	beforeEach(() => {
		mockCacheProvider = new MockCacheProvider();

		deleteProjectService = new DeleteProjectService(
			mockProjectRepository,
			mockCacheProvider,
			mockTaskService,
			mockCheckProjectOwnershipService,
			mockUserService,
		);

		mockProjectRepository.clear();
		jest.clearAllMocks();

		const testUser = createUser({ id: "test-owner-id" });
		(mockUserService.findById as jest.Mock).mockResolvedValue(testUser);

		(mockCheckProjectOwnershipService.execute as jest.Mock).mockResolvedValue(
			true,
		);
	});

	describe("Complete Project Deletion Cache Invalidation", () => {
		it("should invalidate all related caches when deleting a project", async () => {
			const projectId = "project-to-delete";

			const mockProject = createProject({
				id: projectId,
				ownerId: "test-user-id",
				title: "Project to Delete",
				description: "This project will be deleted",
				tags: ["delete", "test"],
			});

			findByIdSpy.mockResolvedValue(mockProject);
			deleteByProjectIdSpy.mockResolvedValue({
				projectId: projectId,
				deletedTasksCount: 5,
				deletedAt: new Date(),
			});
			deleteSpy.mockResolvedValue();

			const projectCacheKey = CacheKeys.project(projectId);
			const tasksByProjectKey = CacheKeys.tasksByProject(projectId);
			const projectsList1 = "ligue-lead:projects:list:p1_l10";
			const projectsList2 = "ligue-lead:projects:list:p2_l20_filter";
			const tasksList1 = "ligue-lead:tasks:list:p1_l10";
			const tasksList2 = "ligue-lead:tasks:list:p3_l15_search";
			const taskKey1 = CacheKeys.task("task-1");
			const taskKey2 = CacheKeys.task("task-2");

			await mockCacheProvider.set(projectCacheKey, mockProject);
			await mockCacheProvider.set(tasksByProjectKey, []);
			await mockCacheProvider.set(projectsList1, {
				projects: [mockProject],
				total: 1,
			});
			await mockCacheProvider.set(projectsList2, { projects: [], total: 0 });
			await mockCacheProvider.set(tasksList1, { tasks: [], total: 0 });
			await mockCacheProvider.set(tasksList2, { tasks: [], total: 0 });
			await mockCacheProvider.set(taskKey1, {
				id: "task-1",
				projectId: projectId,
			});
			await mockCacheProvider.set(taskKey2, {
				id: "task-2",
				projectId: projectId,
			});

			const result = await deleteProjectService.execute({
				projectId: projectId,
				ownerId: "test-owner-id",
			});

			expect(findByIdSpy).toHaveBeenCalledWith(projectId);
			expect(deleteByProjectIdSpy).toHaveBeenCalledWith(projectId);
			expect(deleteSpy).toHaveBeenCalledWith(projectId);

			expect(result).toEqual({
				projectId,
				message: "Project deleted successfully",
				deletedAt: expect.any(Date),
			});

			expect(await mockCacheProvider.get(projectCacheKey)).toBeNull();
			expect(await mockCacheProvider.get(tasksByProjectKey)).toBeNull();
			expect(await mockCacheProvider.get(projectsList1)).toBeNull();
			expect(await mockCacheProvider.get(projectsList2)).toBeNull();
			expect(await mockCacheProvider.get(tasksList1)).toBeNull();
			expect(await mockCacheProvider.get(tasksList2)).toBeNull();
			expect(await mockCacheProvider.get(taskKey1)).toBeNull();
			expect(await mockCacheProvider.get(taskKey2)).toBeNull();
		});

		it("should handle force deletion parameter", async () => {
			const projectId = "force-delete-project";

			const mockProject = createProject({
				id: projectId,
				ownerId: "test-user-id",
				title: "Force Delete Project",
			});

			findByIdSpy.mockResolvedValue(mockProject);
			deleteByProjectIdSpy.mockResolvedValue({
				projectId: projectId,
				deletedTasksCount: 0,
				deletedAt: new Date(),
			});
			deleteSpy.mockResolvedValue();

			const projectCacheKey = CacheKeys.project(projectId);
			await mockCacheProvider.set(projectCacheKey, mockProject);

			const result = await deleteProjectService.execute({
				projectId,
				ownerId: "test-user-id",
				force: true,
			});

			expect(result.message).toBe("Project deleted successfully");
			expect(await mockCacheProvider.get(projectCacheKey)).toBeNull();
		});
	});

	describe("Error Handling with Cache", () => {
		it("should not invalidate cache when project not found", async () => {
			const projectId = "non-existent-project";

			findByIdSpy.mockResolvedValue(null);

			const someCacheKey = CacheKeys.project("other-project");
			const projectsListKey = "ligue-lead:projects:list:p1_l10";
			await mockCacheProvider.set(someCacheKey, { id: "other-project" });
			await mockCacheProvider.set(projectsListKey, { projects: [], total: 0 });

			await expect(
				deleteProjectService.execute({ projectId, ownerId: "test-user-id" }),
			).rejects.toThrow(NotFoundError);

			expect(await mockCacheProvider.get(someCacheKey)).toBeTruthy();
			expect(await mockCacheProvider.get(projectsListKey)).toBeTruthy();

			expect(deleteByProjectIdSpy).not.toHaveBeenCalled();
			expect(deleteSpy).not.toHaveBeenCalled();
		});

		it("should wrap errors in ApplicationError", async () => {
			const projectId = "error-project";

			const mockProject = createProject({
				id: projectId,
				ownerId: "test-user-id",
			});

			findByIdSpy.mockResolvedValue(mockProject);
			deleteByProjectIdSpy.mockRejectedValue(new Error("Task deletion failed"));

			const projectCacheKey = CacheKeys.project(projectId);
			await mockCacheProvider.set(projectCacheKey, mockProject);

			await expect(
				deleteProjectService.execute({ projectId, ownerId: "test-user-id" }),
			).rejects.toThrow(ApplicationError);

			expect(await mockCacheProvider.get(projectCacheKey)).toBeTruthy();
		});

		it("should handle task service deletion errors", async () => {
			const projectId = "task-deletion-error-project";

			const mockProject = createProject({
				id: projectId,
				ownerId: "test-user-id",
			});

			findByIdSpy.mockResolvedValue(mockProject);
			deleteByProjectIdSpy.mockRejectedValue(new Error("Cannot delete tasks"));

			await expect(
				deleteProjectService.execute({ projectId, ownerId: "test-user-id" }),
			).rejects.toThrow(ApplicationError);

			expect(deleteSpy).not.toHaveBeenCalled();
		});

		it("should handle repository deletion errors", async () => {
			const projectId = "repo-deletion-error-project";

			const mockProject = createProject({
				id: projectId,
				ownerId: "test-user-id",
			});

			findByIdSpy.mockResolvedValue(mockProject);
			deleteByProjectIdSpy.mockResolvedValue({
				projectId: projectId,
				deletedTasksCount: 2,
				deletedAt: new Date(),
			});
			deleteSpy.mockRejectedValue(new Error("Database error"));

			await expect(
				deleteProjectService.execute({ projectId, ownerId: "test-user-id" }),
			).rejects.toThrow(ApplicationError);
		});
	});

	describe("Cache Pattern Validation", () => {
		it("should use correct cache key patterns for comprehensive invalidation", async () => {
			const projectId = "pattern-validation-project";

			const mockProject = createProject({
				id: projectId,
				ownerId: "test-user-id",
			});

			findByIdSpy.mockResolvedValue(mockProject);
			deleteByProjectIdSpy.mockResolvedValue({
				projectId: projectId,
				deletedTasksCount: 3,
				deletedAt: new Date(),
			});
			deleteSpy.mockResolvedValue();

			const expectedProjectKey = CacheKeys.project(projectId);
			const expectedTasksByProjectKey = CacheKeys.tasksByProject(projectId);

			await mockCacheProvider.set(expectedProjectKey, mockProject);
			await mockCacheProvider.set(expectedTasksByProjectKey, []);

			await mockCacheProvider.set("ligue-lead:projects:list:p1_l10", {
				projects: [],
				total: 0,
			});
			await mockCacheProvider.set("ligue-lead:projects:list:p2_l20_tags", {
				projects: [],
				total: 0,
			});
			await mockCacheProvider.set("ligue-lead:tasks:list:p1_l5", {
				tasks: [],
				total: 0,
			});
			await mockCacheProvider.set("ligue-lead:tasks:list:p3_l15_search", {
				tasks: [],
				total: 0,
			});

			await mockCacheProvider.set("ligue-lead:task:task-1", { id: "task-1" });
			await mockCacheProvider.set("ligue-lead:task:task-2", { id: "task-2" });

			await mockCacheProvider.set("other-system:cache:key", {
				data: "preserved",
			});

			await deleteProjectService.execute({
				projectId,
				ownerId: "test-user-id",
			});

			expect(await mockCacheProvider.get(expectedProjectKey)).toBeNull();
			expect(await mockCacheProvider.get(expectedTasksByProjectKey)).toBeNull();

			expect(
				await mockCacheProvider.get("ligue-lead:projects:list:p1_l10"),
			).toBeNull();
			expect(
				await mockCacheProvider.get("ligue-lead:projects:list:p2_l20_tags"),
			).toBeNull();
			expect(
				await mockCacheProvider.get("ligue-lead:tasks:list:p1_l5"),
			).toBeNull();
			expect(
				await mockCacheProvider.get("ligue-lead:tasks:list:p3_l15_search"),
			).toBeNull();
			expect(await mockCacheProvider.get("ligue-lead:task:task-1")).toBeNull();
			expect(await mockCacheProvider.get("ligue-lead:task:task-2")).toBeNull();

			expect(
				await mockCacheProvider.get("other-system:cache:key"),
			).toBeTruthy();
		});
	});

	describe("Task Integration", () => {
		it("should properly delegate task deletion to TaskService", async () => {
			const projectId = "task-integration-project";

			const mockProject = createProject({
				id: projectId,
				ownerId: "test-user-id",
			});
			const expectedTaskDeletionResult = {
				projectId: projectId,
				deletedTasksCount: 7,
				deletedAt: new Date(),
			};

			findByIdSpy.mockResolvedValue(mockProject);
			deleteByProjectIdSpy.mockResolvedValue(expectedTaskDeletionResult);
			deleteSpy.mockResolvedValue();

			await deleteProjectService.execute({
				projectId,
				ownerId: "test-user-id",
			});

			expect(deleteByProjectIdSpy).toHaveBeenCalledWith(projectId);
			expect(deleteByProjectIdSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe("Deletion Flow Validation", () => {
		it("should follow correct deletion order: tasks first, then project", async () => {
			const projectId = "deletion-order-project";

			const mockProject = createProject({
				id: projectId,
				ownerId: "test-user-id",
			});

			findByIdSpy.mockResolvedValue(mockProject);

			const callOrder: string[] = [];

			deleteByProjectIdSpy.mockImplementation(async () => {
				callOrder.push("deleteByProjectId");
				return {
					projectId: projectId,
					deletedTasksCount: 2,
					deletedAt: new Date(),
				};
			});

			deleteSpy.mockImplementation(async () => {
				callOrder.push("deleteProject");
			});

			await deleteProjectService.execute({
				projectId,
				ownerId: "test-user-id",
			});

			expect(callOrder).toEqual(["deleteByProjectId", "deleteProject"]);
		});
	});

	describe("Cache Performance", () => {
		it("should efficiently handle cache invalidation for projects with many associated caches", async () => {
			const projectId = "performance-test-project";

			const mockProject = createProject({
				id: projectId,
				ownerId: "test-user-id",
			});

			findByIdSpy.mockResolvedValue(mockProject);
			deleteByProjectIdSpy.mockResolvedValue({
				projectId: projectId,
				deletedTasksCount: 50,
				deletedAt: new Date(),
			});
			deleteSpy.mockResolvedValue();

			const numCaches = 50;
			for (let i = 0; i < numCaches; i++) {
				await mockCacheProvider.set(
					`ligue-lead:projects:list:p${i}_l${i * 2}`,
					{ projects: [], total: 0 },
				);
				await mockCacheProvider.set(`ligue-lead:tasks:list:p${i}_l${i * 3}`, {
					tasks: [],
					total: 0,
				});
				await mockCacheProvider.set(`ligue-lead:task:task-${i}`, {
					id: `task-${i}`,
				});
			}

			const startTime = Date.now();
			await deleteProjectService.execute({
				projectId,
				ownerId: "test-user-id",
			});
			const endTime = Date.now();

			expect(endTime - startTime).toBeLessThan(2000);

			for (let i = 0; i < 10; i++) {
				expect(
					await mockCacheProvider.get(
						`ligue-lead:projects:list:p${i}_l${i * 2}`,
					),
				).toBeNull();
				expect(
					await mockCacheProvider.get(`ligue-lead:tasks:list:p${i}_l${i * 3}`),
				).toBeNull();
				expect(
					await mockCacheProvider.get(`ligue-lead:task:task-${i}`),
				).toBeNull();
			}
		});
	});
});
