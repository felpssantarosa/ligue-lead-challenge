import { TaskStatus } from "@/shared/domain/TaskStatus";
import { createTask } from "@/test/mocks/factories/TaskMock";
import { MockTaskRepository } from "@/test/mocks/repositories/MockTaskRepository";

describe("MockTaskRepository", () => {
	let repository: MockTaskRepository;

	beforeEach(() => {
		repository = new MockTaskRepository();
	});

	describe("save", () => {
		it("should save a task and return it", async () => {
			const task = createTask({});

			const result = await repository.save(task);

			expect(result).toBe(task);
			expect(await repository.findById(task.id)).toBe(task);
		});
	});

	describe("findById", () => {
		it("should return task when found", async () => {
			const task = createTask({});
			await repository.save(task);

			const result = await repository.findById(task.id);

			expect(result).toBe(task);
		});

		it("should return null when task not found", async () => {
			const result = await repository.findById("non-existent-id");

			expect(result).toBeNull();
		});
	});

	describe("findByTaskId", () => {
		it("should return tasks matching the task ID", async () => {
			const task1 = createTask({});
			const task2 = createTask({});
			await repository.save(task1);
			await repository.save(task2);

			const result = await repository.findByTaskId(task1.id);

			expect(result).toEqual([task1]);
		});

		it("should return empty array when no tasks match", async () => {
			const result = await repository.findByTaskId("non-existent-id");

			expect(result).toEqual([]);
		});
	});

	describe("update", () => {
		it("should update a task and return it", async () => {
			const task = createTask({});
			await repository.save(task);

			const updatedTask = createTask({
				id: task.id,
				title: "Updated Title",
			});

			const result = await repository.update(updatedTask);

			expect(result).toBe(updatedTask);
			expect(await repository.findById(task.id)).toBe(updatedTask);
		});
	});

	describe("delete", () => {
		it("should delete a task", async () => {
			const task = createTask({});
			await repository.save(task);

			await repository.delete(task.id);

			expect(await repository.findById(task.id)).toBeNull();
		});
	});

	describe("deleteByProjectId", () => {
		it("should delete all tasks for a project", async () => {
			const projectId = "project-123";
			const task1 = createTask({ projectId });
			const task2 = createTask({ projectId });
			const task3 = createTask({ projectId: "different-project" });

			await repository.save(task1);
			await repository.save(task2);
			await repository.save(task3);

			await repository.deleteByProjectId(projectId);

			expect(await repository.findById(task1.id)).toBeNull();
			expect(await repository.findById(task2.id)).toBeNull();
			expect(await repository.findById(task3.id)).toBe(task3);
		});

		it("should handle empty project gracefully", async () => {
			await repository.deleteByProjectId("non-existent-project");
			// Should not throw an error
		});
	});

	describe("findByProjectId", () => {
		it("should return tasks for a specific project", async () => {
			const projectId = "project-123";
			const task1 = createTask({ projectId });
			const task2 = createTask({ projectId });
			const task3 = createTask({ projectId: "different-project" });

			await repository.save(task1);
			await repository.save(task2);
			await repository.save(task3);

			const result = await repository.findByProjectId(projectId);

			expect(result).toHaveLength(2);
			expect(result).toContain(task1);
			expect(result).toContain(task2);
			expect(result).not.toContain(task3);
		});

		it("should return empty array when no tasks for project", async () => {
			const result = await repository.findByProjectId("non-existent-project");

			expect(result).toEqual([]);
		});
	});

	describe("findAll", () => {
		beforeEach(async () => {
			await repository.save(
				createTask({ title: "Task 1", status: TaskStatus.TODO }),
			);
			await repository.save(
				createTask({ title: "Task 2", status: TaskStatus.IN_PROGRESS }),
			);
			await repository.save(
				createTask({ title: "Another Task", status: TaskStatus.DONE }),
			);
			await repository.save(
				createTask({ title: "Search Test", status: TaskStatus.TODO }),
			);
		});

		it("should return all tasks when no filters", async () => {
			const result = await repository.findAll({ page: 1, limit: 10 });

			expect(result).toHaveLength(4);
		});

		it("should filter by search term", async () => {
			const result = await repository.findAll({
				page: 1,
				limit: 10,
				search: "task",
			});

			expect(result).toHaveLength(3);
		});

		it("should handle case-insensitive search", async () => {
			const result = await repository.findAll({
				page: 1,
				limit: 10,
				search: "TASK",
			});

			expect(result).toHaveLength(3);
		});

		it("should handle pagination", async () => {
			const result = await repository.findAll({ page: 1, limit: 2 });

			expect(result).toHaveLength(2);
		});

		it("should handle second page of pagination", async () => {
			const result = await repository.findAll({ page: 2, limit: 2 });

			expect(result).toHaveLength(2);
		});

		it("should handle pagination beyond available data", async () => {
			const result = await repository.findAll({ page: 3, limit: 2 });

			expect(result).toHaveLength(0);
		});

		it("should combine search and pagination", async () => {
			const result = await repository.findAll({
				search: "task",
				page: 1,
				limit: 2,
			});

			expect(result).toHaveLength(2);
		});

		it("should handle empty search results", async () => {
			const result = await repository.findAll({
				page: 1,
				limit: 10,
				search: "nonexistent",
			});

			expect(result).toHaveLength(0);
		});
	});

	describe("clear", () => {
		it("should remove all tasks", async () => {
			const task1 = createTask({});
			const task2 = createTask({});
			await repository.save(task1);
			await repository.save(task2);

			repository.clear();

			expect(await repository.findById(task1.id)).toBeNull();
			expect(await repository.findById(task2.id)).toBeNull();
			expect(await repository.findAll({ page: 1, limit: 10 })).toEqual([]);
		});
	});
});
