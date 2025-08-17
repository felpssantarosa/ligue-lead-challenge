import {
	createTask,
	mockGetAllTasksServiceImplementation as getAllTasksService,
	mockTaskRepository,
} from "@/test/mocks";

describe("GetAllTasksService", () => {
	const findAllSpy = jest.spyOn(mockTaskRepository, "findAll");

	beforeEach(() => {
		mockTaskRepository.clear();
		jest.clearAllMocks();
	});

	describe("execute", () => {
		it("should get all tasks successfully", async () => {
			const task1 = createTask({ title: "Task 1" });
			const task2 = createTask({ title: "Task 2" });
			const tasks = [task1, task2];

			findAllSpy.mockResolvedValue(tasks);

			const result = await getAllTasksService.execute();

			expect(result).toEqual({
				tasks,
				total: 2,
				page: 1,
				limit: 10,
			});
			expect(findAllSpy).toHaveBeenCalledWith({
				limit: 10,
				page: 1,
				search: undefined,
			});
		});

		it("should return empty array when no tasks exist", async () => {
			findAllSpy.mockResolvedValue([]);

			const result = await getAllTasksService.execute();

			expect(result).toEqual({
				tasks: [],
				total: 0,
				page: 1,
				limit: 10,
			});
		});

		it("should handle pagination parameters", async () => {
			const task1 = createTask({ title: "Task 1" });
			const tasks = [task1];

			findAllSpy.mockResolvedValue(tasks);

			const result = await getAllTasksService.execute({
				page: 2,
				limit: 5,
			});

			expect(result).toEqual({
				tasks,
				total: 1,
				page: 2,
				limit: 5,
			});
			expect(findAllSpy).toHaveBeenCalledWith({
				limit: 5,
				page: 2,
				search: undefined,
			});
		});

		it("should handle search parameters", async () => {
			const task1 = createTask({ title: "Search Task" });
			const tasks = [task1];

			findAllSpy.mockResolvedValue(tasks);

			const result = await getAllTasksService.execute({
				search: "Search",
			});

			expect(result).toEqual({
				tasks,
				total: 1,
				page: 1,
				limit: 10,
			});
			expect(findAllSpy).toHaveBeenCalledWith({
				limit: 10,
				page: 1,
				search: "Search",
			});
		});

		it("should handle repository errors", async () => {
			findAllSpy.mockRejectedValue(new Error("Database connection failed"));

			await expect(getAllTasksService.execute()).rejects.toThrow(
				"Database connection failed",
			);
		});

		it("should use default parameters when none provided", async () => {
			const tasks = [createTask({})];

			findAllSpy.mockResolvedValue(tasks);

			const result = await getAllTasksService.execute({});

			expect(result.page).toBe(1);
			expect(result.limit).toBe(10);
			expect(findAllSpy).toHaveBeenCalledWith({
				limit: 10,
				page: 1,
				search: undefined,
			});
		});
	});
});
