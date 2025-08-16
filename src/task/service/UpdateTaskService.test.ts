import { TaskStatus } from "@/shared/domain/TaskStatus";
import { NotFoundError } from "@/shared/Errors";
import { UpdateTaskService } from "@/task/service/UpdateTaskService";
import { generateUuid } from "@/test/factories/UUIDFactory";
import {
	createTask,
	mockTaskRepository,
} from "@/test/mocks/factories/TaskMock";

describe("UpdateTaskService", () => {
	let updateTaskService: UpdateTaskService;

	beforeEach(() => {
		updateTaskService = new UpdateTaskService(mockTaskRepository);
		jest.clearAllMocks();
	});

	describe("execute", () => {
		it("should update task when found", async () => {
			const taskId = generateUuid();
			const originalTask = createTask({
				id: taskId,
				title: "Original Title",
				description: "Original Description",
				status: TaskStatus.TODO,
			});

			const updatedTask = createTask({
				id: taskId,
				title: "Updated Title",
				description: "Updated Description",
				status: TaskStatus.IN_PROGRESS,
			});

			mockTaskRepository.findById.mockResolvedValue(originalTask);
			mockTaskRepository.update.mockResolvedValue(updatedTask);

			const result = await updateTaskService.execute({
				id: taskId,
				title: "Updated Title",
				description: "Updated Description",
				status: TaskStatus.IN_PROGRESS,
			});

			expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
			expect(mockTaskRepository.update).toHaveBeenCalledWith(originalTask);
			expect(result).toEqual({
				id: updatedTask.id,
				title: updatedTask.title,
				description: updatedTask.description,
				status: updatedTask.status,
				projectId: updatedTask.projectId,
				createdAt: updatedTask.createdAt,
				updatedAt: updatedTask.updatedAt,
			});
		});

		it("should throw NotFoundError when task not found", async () => {
			const taskId = generateUuid();
			mockTaskRepository.findById.mockResolvedValue(null);

			await expect(
				updateTaskService.execute({
					id: taskId,
					title: "New Title",
				}),
			).rejects.toThrow(NotFoundError);

			expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
			expect(mockTaskRepository.update).not.toHaveBeenCalled();
		});

		it("should update only provided fields", async () => {
			const taskId = generateUuid();
			const originalTask = createTask({
				id: taskId,
				title: "Original Title",
				description: "Original Description",
				status: TaskStatus.TODO,
			});

			mockTaskRepository.findById.mockResolvedValue(originalTask);
			mockTaskRepository.update.mockResolvedValue(originalTask);

			await updateTaskService.execute({
				id: taskId,
				title: "Updated Title Only",
			});

			expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
			expect(mockTaskRepository.update).toHaveBeenCalledWith(originalTask);
		});
	});
});
