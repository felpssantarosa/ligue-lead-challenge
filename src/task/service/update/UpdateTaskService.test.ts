import { TaskStatus } from "@/shared/domain/TaskStatus";
import { NotFoundError } from "@/shared/Errors";
import { UpdateTaskService } from "@/task/service";
import { generateUUID } from "@/test/factories";
import {
	createTask,
	MockCacheProvider,
	mockTaskRepository,
} from "@/test/mocks";
import { mockCheckProjectOwnershipService } from "@/test/mocks/factories/ProjectMock";
import { createUserServiceMock } from "@/test/mocks/factories/MockFactory";
import { createUser } from "@/test/mocks/factories/UserMock";

describe("UpdateTaskService", () => {
	let updateTaskService: UpdateTaskService;
	let userService: ReturnType<typeof createUserServiceMock>;
	const ownerId = generateUUID();
	const findByIdSpy = jest.spyOn(mockTaskRepository, "findById");
	const updateSpy = jest.spyOn(mockTaskRepository, "update");

	beforeEach(() => {
		userService = createUserServiceMock();
		updateTaskService = new UpdateTaskService(
			mockTaskRepository,
			new MockCacheProvider(),
			mockCheckProjectOwnershipService,
			userService,
		);

		const testUser = createUser({ id: ownerId });
		userService.findById.mockResolvedValue(testUser);
		mockCheckProjectOwnershipService.execute.mockResolvedValue(true);

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
				taskId: taskId,
				ownerId,
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
					taskId: taskId,
					ownerId,
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
				taskId: taskId,
				ownerId,
				title: "Updated Title Only",
			});

			expect(findByIdSpy).toHaveBeenCalledWith(taskId);
			expect(updateSpy).toHaveBeenCalledWith(originalTask);
		});
	});
});
