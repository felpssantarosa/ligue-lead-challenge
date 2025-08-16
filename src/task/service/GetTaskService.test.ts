import { NotFoundError } from "@/shared/Errors";
import { GetTaskService } from "@/task/service/GetTaskService";
import { generateUUID } from "@/test/factories/UUIDFactory";
import {
	createTask,
	mockTaskRepository,
} from "@/test/mocks/factories/TaskMock";

describe("GetTaskService", () => {
	let getTaskService: GetTaskService;

	beforeEach(() => {
		getTaskService = new GetTaskService(mockTaskRepository);
		jest.clearAllMocks();
	});

	describe("execute", () => {
		it("should return task when found", async () => {
			const taskId = generateUUID();
			const task = createTask({ id: taskId });
			mockTaskRepository.findById.mockResolvedValue(task);

			const result = await getTaskService.execute({ id: taskId });

			expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
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
			mockTaskRepository.findById.mockResolvedValue(null);

			await expect(getTaskService.execute({ id: taskId })).rejects.toThrow(
				NotFoundError,
			);
			expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
		});
	});
});
