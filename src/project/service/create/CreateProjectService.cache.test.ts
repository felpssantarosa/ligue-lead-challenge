import "reflect-metadata";
import { CreateProjectService } from "@/project/service/create/CreateProjectService";
import { CacheKeys } from "@/shared/cache";
import {
	createProject,
	MockCacheProvider,
	mockProjectRepository,
} from "@/test/mocks";

describe("CreateProjectService - Cache Invalidation", () => {
	let createProjectService: CreateProjectService;
	let mockCacheProvider: MockCacheProvider;

	const saveSpy = jest.spyOn(mockProjectRepository, "save");

	beforeEach(() => {
		mockCacheProvider = new MockCacheProvider();

		createProjectService = new CreateProjectService(
			mockProjectRepository,
			mockCacheProvider,
		);

		mockProjectRepository.clear();
		jest.clearAllMocks();
	});

	describe("Cache Invalidation on Create", () => {
		it("should invalidate project list caches when creating a new project", async () => {
			const projectData = {
				title: "New Test Project",
				description: "A test project for cache invalidation",
				tags: ["test", "cache"],
			};

			const savedProject = createProject({
				title: projectData.title,
				description: projectData.description,
				tags: projectData.tags,
			});

			saveSpy.mockResolvedValue(savedProject);

			const projectsList1 = "ligue-lead:projects:list:p1_l10";
			const projectsList2 = "ligue-lead:projects:list:p2_l20_search";
			const projectsList3 = "ligue-lead:projects:list:p1_l5_tags";

			await mockCacheProvider.set(projectsList1, { projects: [], total: 0 });
			await mockCacheProvider.set(projectsList2, { projects: [], total: 0 });
			await mockCacheProvider.set(projectsList3, { projects: [], total: 0 });

			const taskCacheKey = CacheKeys.task("some-task");
			const tasksListKey = "ligue-lead:tasks:list:p1_l10";
			await mockCacheProvider.set(taskCacheKey, { id: "some-task" });
			await mockCacheProvider.set(tasksListKey, { tasks: [], total: 0 });

			const result = await createProjectService.execute(projectData);

			expect(saveSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					title: projectData.title,
					description: projectData.description,
					tags: projectData.tags,
				}),
			);

			expect(result).toEqual({
				id: savedProject.id,
				title: savedProject.title,
				description: savedProject.description,
				tags: savedProject.tags,
				createdAt: savedProject.createdAt,
				updatedAt: savedProject.updatedAt,
			});

			expect(await mockCacheProvider.get(projectsList1)).toBeNull();
			expect(await mockCacheProvider.get(projectsList2)).toBeNull();
			expect(await mockCacheProvider.get(projectsList3)).toBeNull();

			expect(await mockCacheProvider.get(taskCacheKey)).toBeTruthy();
			expect(await mockCacheProvider.get(tasksListKey)).toBeTruthy();
		});

		it("should handle empty tags array correctly", async () => {
			const projectData = {
				title: "Project Without Tags",
				description: "A project without any tags",
				tags: [],
			};

			const savedProject = createProject({
				title: projectData.title,
				description: projectData.description,
				tags: [],
			});

			saveSpy.mockResolvedValue(savedProject);

			const projectsListKey = "ligue-lead:projects:list:p1_l10";
			await mockCacheProvider.set(projectsListKey, { projects: [], total: 0 });

			const result = await createProjectService.execute(projectData);

			expect(result.tags).toEqual([]);
			expect(saveSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					tags: [],
				}),
			);

			expect(await mockCacheProvider.get(projectsListKey)).toBeNull();
		});

		it("should handle undefined tags by defaulting to empty array", async () => {
			const projectData = {
				title: "Project With Undefined Tags",
				description: "A project with undefined tags",
				tags: undefined as unknown as string[],
			};

			const savedProject = createProject({
				title: projectData.title,
				description: projectData.description,
				tags: [],
			});

			saveSpy.mockResolvedValue(savedProject);

			const projectsListKey = "ligue-lead:projects:list:p1_l10";
			await mockCacheProvider.set(projectsListKey, { projects: [], total: 0 });

			const result = await createProjectService.execute(projectData);

			expect(result.tags).toEqual([]);
			expect(saveSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					tags: [],
				}),
			);

			expect(await mockCacheProvider.get(projectsListKey)).toBeNull();
		});
	});

	describe("Input Validation", () => {
		it("should throw error for empty title", async () => {
			const projectData = {
				title: "",
				description: "Project with empty title",
				tags: ["test"],
			};

			const projectsListKey = "ligue-lead:projects:list:p1_l10";
			await mockCacheProvider.set(projectsListKey, { projects: [], total: 0 });

			await expect(createProjectService.execute(projectData)).rejects.toThrow(
				"Project title cannot be empty",
			);

			expect(saveSpy).not.toHaveBeenCalled();

			expect(await mockCacheProvider.get(projectsListKey)).toBeTruthy();
		});

		it("should throw error for whitespace-only title", async () => {
			const projectData = {
				title: "   ",
				description: "Project with whitespace-only title",
				tags: ["test"],
			};

			const projectsListKey = "ligue-lead:projects:list:p1_l10";
			await mockCacheProvider.set(projectsListKey, { projects: [], total: 0 });

			await expect(createProjectService.execute(projectData)).rejects.toThrow(
				"Project title cannot be empty",
			);

			expect(saveSpy).not.toHaveBeenCalled();
			expect(await mockCacheProvider.get(projectsListKey)).toBeTruthy();
		});
	});

	describe("Cache Pattern Validation", () => {
		it("should only invalidate project list caches with correct pattern", async () => {
			const projectData = {
				title: "Pattern Test Project",
				description: "Testing cache pattern specificity",
				tags: ["pattern", "test"],
			};

			const savedProject = createProject(projectData);
			saveSpy.mockResolvedValue(savedProject);

			const projectsList1 = "ligue-lead:projects:list:p1_l10";
			const projectsList2 = "ligue-lead:projects:list:p2_l20_filter";
			const tasksListKey = "ligue-lead:tasks:list:p1_l10";
			const individualProjectKey = CacheKeys.project("some-project");
			const tasksByProjectKey = CacheKeys.tasksByProject("some-project");

			await mockCacheProvider.set(projectsList1, { projects: [], total: 0 });
			await mockCacheProvider.set(projectsList2, { projects: [], total: 0 });
			await mockCacheProvider.set(tasksListKey, { tasks: [], total: 0 });
			await mockCacheProvider.set(individualProjectKey, { id: "some-project" });
			await mockCacheProvider.set(tasksByProjectKey, []);

			await createProjectService.execute(projectData);

			expect(await mockCacheProvider.get(projectsList1)).toBeNull();
			expect(await mockCacheProvider.get(projectsList2)).toBeNull();

			expect(await mockCacheProvider.get(tasksListKey)).toBeTruthy();
			expect(await mockCacheProvider.get(individualProjectKey)).toBeTruthy();
			expect(await mockCacheProvider.get(tasksByProjectKey)).toBeTruthy();
		});
	});

	describe("Error Handling with Cache", () => {
		it("should not invalidate cache when repository save fails", async () => {
			const projectData = {
				title: "Failing Project",
				description: "Project that will fail to save",
				tags: ["error"],
			};

			saveSpy.mockRejectedValue(new Error("Database connection failed"));

			const projectsListKey = "ligue-lead:projects:list:p1_l10";
			await mockCacheProvider.set(projectsListKey, { projects: [], total: 0 });

			await expect(createProjectService.execute(projectData)).rejects.toThrow(
				"Database connection failed",
			);

			expect(await mockCacheProvider.get(projectsListKey)).toBeTruthy();
		});
	});

	describe("Project Domain Creation", () => {
		it("should properly create Project domain entity before saving", async () => {
			const projectData = {
				title: "Domain Test Project",
				description: "Testing proper domain entity creation",
				tags: ["domain", "entity"],
			};

			const savedProject = createProject(projectData);
			saveSpy.mockResolvedValue(savedProject);

			await createProjectService.execute(projectData);

			const savedEntity = saveSpy.mock.calls[0][0];
			expect(savedEntity.title).toBe(projectData.title);
			expect(savedEntity.description).toBe(projectData.description);
			expect(savedEntity.tags).toEqual(projectData.tags);
			expect(savedEntity.id).toBeDefined();
			expect(savedEntity.createdAt).toBeInstanceOf(Date);
			expect(savedEntity.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe("Cache Performance", () => {
		it("should efficiently invalidate caches for high-frequency project creation", async () => {
			const projectData = {
				title: "Performance Test Project",
				description: "Testing cache invalidation performance",
				tags: ["performance"],
			};

			const savedProject = createProject(projectData);
			saveSpy.mockResolvedValue(savedProject);

			const cacheKeys = Array.from(
				{ length: 10 },
				(_, index) =>
					`ligue-lead:projects:list:p${index}_l${index * 5}_filter${index}`,
			);

			for (const key of cacheKeys) {
				await mockCacheProvider.set(key, { projects: [], total: 0 });
			}

			const startTime = Date.now();
			await createProjectService.execute(projectData);
			const endTime = Date.now();

			for (const key of cacheKeys) {
				expect(await mockCacheProvider.get(key)).toBeNull();
			}

			expect(endTime - startTime).toBeLessThan(1000);
		});
	});
});
