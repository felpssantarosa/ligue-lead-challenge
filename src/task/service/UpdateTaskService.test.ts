import { TaskStatus } from "@/shared/domain/TaskStatus";
import { NotFoundError } from "@/shared/Errors";
import { UpdateTaskService } from "@/task/service/UpdateTaskService";
import { generateUUID } from "@/test/factories/UUIDFactory";
import {
	createTask,
	mockTaskRepository,
} from "@/test/mocks/factories/TaskMock";

describe("UpdateTaskService", () => {
	let updateTaskService: UpdateTaskService;
	const findByIdSpy = jest.spyOn(mockTaskRepository, "findById");
	const updateSpy = jest.spyOn(mockTaskRepository, "update");

	beforeEach(() => {
		updateTaskService = new UpdateTaskService(mockTaskRepository);
		jest.clearAllMocks();
	});

	describe("execute", () => {
		it("should update task when found", async () => {
			const taskId = generateUUID();
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

			findByIdSpy.mockResolvedValue(originalTask);
			updateSpy.mockResolvedValue(updatedTask);

			const result = await updateTaskService.execute({
				id: taskId,
				title: "Updated Title",
				description: "Updated Description",
				status: TaskStatus.IN_PROGRESS,
			});

			expect(findByIdSpy).toHaveBeenCalledWith(taskId);
			expect(updateSpy).toHaveBeenCalledWith(originalTask);
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
			const taskId = generateUUID();
			findByIdSpy.mockResolvedValue(null);

			await expect(
				updateTaskService.execute({
					id: taskId,
					title: "New Title",
				}),
			).rejects.toThrow(NotFoundError);

			expect(findByIdSpy).toHaveBeenCalledWith(taskId);
			expect(updateSpy).not.toHaveBeenCalled();
		});

		it("should update only provided fields", async () => {
			const taskId = generateUUID();
			const originalTask = createTask({
				id: taskId,
				title: "Original Title",
				description: "Original Description",
				status: TaskStatus.TODO,
			});

			findByIdSpy.mockResolvedValue(originalTask);
			updateSpy.mockResolvedValue(originalTask);

			await updateTaskService.execute({
				id: taskId,
				title: "Updated Title Only",
			});

			expect(findByIdSpy).toHaveBeenCalledWith(taskId);
			expect(updateSpy).toHaveBeenCalledWith(originalTask);
		});
	});
});
