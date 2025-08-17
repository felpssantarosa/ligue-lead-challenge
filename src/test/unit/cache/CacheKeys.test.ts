import { CacheKeys } from "@/shared/cache/CacheKeys";

describe("CacheKeys", () => {
	describe("project keys", () => {
		it("should generate consistent project cache keys", () => {
			const projectId = "project-123";
			const key = CacheKeys.project(projectId);

			expect(key).toBe("ligue-lead:project:project-123");
		});

		it("should generate pattern for all projects", () => {
			const pattern = CacheKeys.allProjects();

			expect(pattern).toBe("ligue-lead:project:*");
		});

		it("should generate consistent project list cache keys", () => {
			const page = 1;
			const limit = 10;
			const filters = { search: "test", tags: ["tag1"] };

			const key1 = CacheKeys.projectsList({ page, limit, filters });
			const key2 = CacheKeys.projectsList({ page, limit, filters });

			expect(key1).toBe(key2);
			expect(key1).toContain("ligue-lead:projects:list:p1_l10_");
		});

		it("should generate different keys for different filters", () => {
			const page = 1;
			const limit = 10;
			const filters1 = { search: "test1" };
			const filters2 = { search: "test2" };

			const key1 = CacheKeys.projectsList({ page, limit, filters: filters1 });
			const key2 = CacheKeys.projectsList({ page, limit, filters: filters2 });

			expect(key1).not.toBe(key2);
		});

		it("should generate pattern for all project lists", () => {
			const pattern = CacheKeys.allProjectsLists();

			expect(pattern).toBe("ligue-lead:projects:list:*");
		});
	});

	describe("task keys", () => {
		it("should generate consistent task cache keys", () => {
			const taskId = "task-456";
			const key = CacheKeys.task(taskId);

			expect(key).toBe("ligue-lead:task:task-456");
		});

		it("should generate pattern for all tasks", () => {
			const pattern = CacheKeys.allTasks();

			expect(pattern).toBe("ligue-lead:task:*");
		});

		it("should generate tasks by project key", () => {
			const projectId = "project-123";
			const key = CacheKeys.tasksByProject(projectId);

			expect(key).toBe("ligue-lead:tasks:project:project-123");
		});

		it("should generate pattern for all tasks by project", () => {
			const pattern = CacheKeys.allTasksByProject();

			expect(pattern).toBe("ligue-lead:tasks:project:*");
		});

		it("should generate consistent task list cache keys", () => {
			const page = 2;
			const limit = 20;
			const filters = { search: "bug" };

			const key1 = CacheKeys.tasksList({ page, limit, filters });
			const key2 = CacheKeys.tasksList({ page, limit, filters });

			expect(key1).toBe(key2);
			expect(key1).toContain("ligue-lead:tasks:list:p2_l20_");
		});

		it("should generate pattern for all task lists", () => {
			const pattern = CacheKeys.allTasksLists();

			expect(pattern).toBe("ligue-lead:tasks:list:*");
		});
	});

	describe("key uniqueness", () => {
		it("should generate unique keys for different entities", () => {
			const id = "same-id";

			const projectKey = CacheKeys.project(id);
			const taskKey = CacheKeys.task(id);
			const tasksByProjectKey = CacheKeys.tasksByProject(id);

			expect(projectKey).not.toBe(taskKey);
			expect(projectKey).not.toBe(tasksByProjectKey);
			expect(taskKey).not.toBe(tasksByProjectKey);
		});
	});
});
