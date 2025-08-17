import { NotFoundError } from "@/shared/Errors";
import { GetTaskService } from "@/task/service";
import { generateUUID } from "@/test/factories";
import { createTask, mockTaskRepository } from "@/test/mocks";

describe("GetTaskService", () => {
	let getTaskService: GetTaskService;
	const findByIdSpy = jest.spyOn(mockTaskRepository, "findById");

	beforeEach(() => {
		getTaskService = new GetTaskService(mockTaskRepository);
		jest.clearAllMocks();
	});

	describe("execute", () => {
		it("should return task when found", async () => {
			const taskId = generateUUID();
			const task = createTask({ id: taskId });

			findByIdSpy.mockResolvedValue(task);

			const result = await getTaskService.execute({ id: taskId });

			expect(findByIdSpy).toHaveBeenCalledWith(taskId);
			expect(result).toEqual({
				id: task.id,
				title: task.title,
				description: task.description,
				status: task.status,
				projectId: task.projectId,
				createdAt: task.createdAt,
				updatedAt: task.updatedAt,
			});
		});

		it("should throw NotFoundError when task not found", async () => {
			const taskId = generateUUID();
			findByIdSpy.mockResolvedValue(null);

			await expect(getTaskService.execute({ id: taskId })).rejects.toThrow(
				NotFoundError,
			);
			expect(findByIdSpy).toHaveBeenCalledWith(taskId);
		});
	});
});
