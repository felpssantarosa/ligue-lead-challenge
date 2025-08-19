import "reflect-metadata";
import { Project } from "@/project/domain";
import { UpdateProjectService } from "@/project/service/update/UpdateProjectService";
import { CacheKeys } from "@/shared/cache";
import { ApplicationError } from "@/shared/Errors";
import { generateUUID } from "@/test/factories";
import {
	MockCacheProvider,
	mockCheckProjectOwnershipService,
	mockProjectRepository,
	mockUserService,
} from "@/test/mocks";
import { createUser } from "@/test/mocks/factories/UserMock";

describe("UpdateProjectService - Cache Invalidation", () => {
	let mockCacheProvider: MockCacheProvider;
	let updateProjectService: UpdateProjectService;
	const findByIdSpy = jest.spyOn(mockProjectRepository, "findById");
	const updateSpy = jest.spyOn(mockProjectRepository, "update");

	beforeEach(() => {
		mockCacheProvider = new MockCacheProvider();
		mockProjectRepository.clear();
		jest.clearAllMocks();

		updateProjectService = new UpdateProjectService(
			mockProjectRepository,
			mockCacheProvider,
			mockCheckProjectOwnershipService,
			mockUserService,
		);

		const testUser = createUser({ id: "test-owner-id" });
		(mockUserService.findById as jest.Mock).mockResolvedValue(testUser);

		(mockCheckProjectOwnershipService.execute as jest.Mock).mockResolvedValue(
			true,
		);
	});

	describe("Cache Invalidation on Update", () => {
		it("should invalidate project cache after successful update", async () => {
			const projectId = generateUUID();

			const existingProject = Project.create({
				title: "Original Project",
				description: "Original description",
				tags: ["original"],
				githubRepositories: [],
				ownerId: "test-owner-id",
			});

			findByIdSpy.mockResolvedValue(existingProject);

			const updatedProject = Project.create({
				title: "Updated Project",
				description: "Updated description",
				tags: ["updated"],
				githubRepositories: [],
				ownerId: "test-owner-id",
			});
			updateSpy.mockResolvedValue(updatedProject);

			const projectCacheKey = CacheKeys.project(projectId);
			const allProjectsListKey = CacheKeys.allProjectsLists();
			const allTasksByProjectKey = CacheKeys.allTasksByProject();

			await mockCacheProvider.set(projectCacheKey, {
				projectId: projectId,
				title: "Cached Project",
			});
			await mockCacheProvider.set(`${allProjectsListKey}:list1`, {
				projects: [],
			});
			await mockCacheProvider.set(`${allTasksByProjectKey}:project1`, {
				tasks: [],
			});

			expect(await mockCacheProvider.get(projectCacheKey)).toBeTruthy();
			expect(
				await mockCacheProvider.get(`${allProjectsListKey}:list1`),
			).toBeTruthy();
			expect(
				await mockCacheProvider.get(`${allTasksByProjectKey}:project1`),
			).toBeTruthy();

			const result = await updateProjectService.execute({
				projectId: projectId,
				githubRepositories: [],
				ownerId: "test-owner-id",
				title: "Updated Project",
				description: "Updated description",
			});

			expect(await mockCacheProvider.get(projectCacheKey)).toBeNull();

			expect(
				await mockCacheProvider.get(`${allProjectsListKey}:list1`),
			).toBeNull();
			expect(
				await mockCacheProvider.get(`${allTasksByProjectKey}:project1`),
			).toBeNull();

			expect(updateSpy).toHaveBeenCalledWith(existingProject);
			expect(result.title).toBe("Updated Project");
		});

		it("should invalidate multiple cache patterns correctly", async () => {
			const projectId = generateUUID();
			const existingProject = Project.create({
				title: "Test Project",
				description: "Test description",
				tags: ["test"],
				githubRepositories: [],
				ownerId: "test-owner-id",
			});

			findByIdSpy.mockResolvedValue(existingProject);
			updateSpy.mockResolvedValue(existingProject);

			const cacheEntries = [
				{ key: CacheKeys.project(projectId), value: { project: "data" } },

				{
					key: "ligue-lead:projects:list:p1_l10_abc123",
					value: { projects: ["list1"] },
				},
				{
					key: "ligue-lead:projects:list:p2_l20_def456",
					value: { projects: ["list2"] },
				},

				{ key: "ligue-lead:tasks:project:proj1", value: { tasks: ["task1"] } },
				{ key: "ligue-lead:tasks:project:proj2", value: { tasks: ["task2"] } },

				{ key: "ligue-lead:task:task123", value: { task: "individual" } },
				{ key: "ligue-lead:other:data", value: { other: "data" } },
			];

			for (const entry of cacheEntries) {
				await mockCacheProvider.set(entry.key, entry.value);
			}

			for (const entry of cacheEntries) {
				expect(await mockCacheProvider.get(entry.key)).toBeTruthy();
			}

			await updateProjectService.execute({
				projectId: projectId,
				githubRepositories: [],
				ownerId: "test-owner-id",
				title: "Updated Title",
			});

			expect(
				await mockCacheProvider.get(CacheKeys.project(projectId)),
			).toBeNull();
			expect(
				await mockCacheProvider.get("ligue-lead:projects:list:p1_l10_abc123"),
			).toBeNull();
			expect(
				await mockCacheProvider.get("ligue-lead:projects:list:p2_l20_def456"),
			).toBeNull();
			expect(
				await mockCacheProvider.get("ligue-lead:tasks:project:proj1"),
			).toBeNull();
			expect(
				await mockCacheProvider.get("ligue-lead:tasks:project:proj2"),
			).toBeNull();

			expect(
				await mockCacheProvider.get("ligue-lead:task:task123"),
			).toBeTruthy();
			expect(await mockCacheProvider.get("ligue-lead:other:data")).toBeTruthy();
		});
	});

	describe("Error Handling with Cache", () => {
		it("should not invalidate cache when project not found", async () => {
			const projectId = generateUUID();
			findByIdSpy.mockResolvedValue(null);

			const projectCacheKey = CacheKeys.project(projectId);
			await mockCacheProvider.set(projectCacheKey, {
				projectId: projectId,
				title: "Cached",
			});

			expect(await mockCacheProvider.get(projectCacheKey)).toBeTruthy();

			await expect(
				updateProjectService.execute({
					projectId: projectId,
					githubRepositories: [],
					ownerId: "test-owner-id",
					title: "New Title",
				}),
			).rejects.toThrow(ApplicationError);

			expect(await mockCacheProvider.get(projectCacheKey)).toBeTruthy();
			expect(updateSpy).not.toHaveBeenCalled();
		});

		it("should not invalidate cache when repository update fails", async () => {
			const projectId = generateUUID();
			const existingProject = Project.create({
				title: "Existing Project",
				description: "Existing description",
				tags: ["existing"],
				githubRepositories: [],
				ownerId: "test-owner-id",
			});

			findByIdSpy.mockResolvedValue(existingProject);
			updateSpy.mockRejectedValue(new Error("Database update failed"));

			const projectCacheKey = CacheKeys.project(projectId);
			await mockCacheProvider.set(projectCacheKey, {
				projectId: projectId,
				title: "Cached",
			});

			expect(await mockCacheProvider.get(projectCacheKey)).toBeTruthy();

			await expect(
				updateProjectService.execute({
					projectId: projectId,
					githubRepositories: [],
					ownerId: "test-owner-id",
					title: "New Title",
				}),
			).rejects.toThrow("Database update failed");

			expect(await mockCacheProvider.get(projectCacheKey)).toBeTruthy();
		});
	});

	describe("Cache Key Pattern Validation", () => {
		it("should use correct cache key patterns for invalidation", async () => {
			const projectId = generateUUID();
			const existingProject = Project.create({
				title: "Pattern Test Project",
				description: "Testing cache patterns",
				tags: ["pattern"],
				githubRepositories: [],
				ownerId: "test-owner-id",
			});

			findByIdSpy.mockResolvedValue(existingProject);
			updateSpy.mockResolvedValue(existingProject);

			const deleteSpy = jest.spyOn(mockCacheProvider, "delete");
			const deleteByPatternSpy = jest.spyOn(
				mockCacheProvider,
				"deleteByPattern",
			);

			await updateProjectService.execute({
				projectId: projectId,
				githubRepositories: [],
				ownerId: "test-owner-id",
				title: "Updated",
			});

			expect(deleteSpy).toHaveBeenCalledWith(CacheKeys.project(projectId));

			expect(deleteByPatternSpy).toHaveBeenCalledWith(
				CacheKeys.allProjectsLists(),
			);
			expect(deleteByPatternSpy).toHaveBeenCalledWith(
				CacheKeys.allTasksByProject(),
			);

			expect(deleteByPatternSpy).toHaveBeenCalledTimes(2);
		});
	});

	describe("Partial Updates", () => {
		it("should invalidate cache for partial updates", async () => {
			const projectId = generateUUID();
			const existingProject = Project.create({
				title: "Original Title",
				description: "Original description",
				tags: ["original", "tags"],
				githubRepositories: [],
				ownerId: "test-owner-id",
			});

			findByIdSpy.mockResolvedValue(existingProject);
			updateSpy.mockResolvedValue(existingProject);

			const projectCacheKey = CacheKeys.project(projectId);
			await mockCacheProvider.set(projectCacheKey, {
				projectId: projectId,
				title: "Cached",
			});

			await updateProjectService.execute({
				projectId: projectId,
				githubRepositories: [],
				ownerId: "test-owner-id",
				title: "New Title Only",
			});

			expect(await mockCacheProvider.get(projectCacheKey)).toBeNull();
		});

		it("should invalidate cache for tag-only updates", async () => {
			const projectId = generateUUID();
			const existingProject = Project.create({
				title: "Project Title",
				description: "Project description",
				tags: ["old", "tags"],
				githubRepositories: [],
				ownerId: "test-owner-id",
			});

			findByIdSpy.mockResolvedValue(existingProject);
			updateSpy.mockResolvedValue(existingProject);

			const projectCacheKey = CacheKeys.project(projectId);
			await mockCacheProvider.set(projectCacheKey, {
				projectId: projectId,
				tags: ["old", "tags"],
			});

			await updateProjectService.execute({
				projectId: projectId,
				githubRepositories: [],
				ownerId: "test-owner-id",
				tags: ["new", "tags"],
			});

			expect(await mockCacheProvider.get(projectCacheKey)).toBeNull();
		});
	});
});
