import { NotFoundError } from "@/shared/Errors";
import { DeleteTaskService } from "@/task/service/delete/DeleteTaskService";
import {
	createProject,
	createTask,
	MockCacheProvider,
	mockProjectRepository,
	mockTaskRepository,
} from "@/test/mocks";
import { mockCheckProjectOwnershipService } from "@/test/mocks/factories/ProjectMock";
import { createUserServiceMock } from "@/test/mocks/factories/MockFactory";
import { createUser } from "@/test/mocks/factories/UserMock";
import { generateUUID } from "@/test/factories/UUIDFactory";

describe("DeleteTaskService", () => {
	let deleteTaskService: DeleteTaskService;
	let userService: ReturnType<typeof createUserServiceMock>;
	const ownerId = generateUUID();
	const findTaskSpy = jest.spyOn(mockTaskRepository, "findById");
	const deleteTaskSpy = jest.spyOn(mockTaskRepository, "delete");
	const findProjectSpy = jest.spyOn(mockProjectRepository, "findById");
	const updateProjectSpy = jest.spyOn(mockProjectRepository, "update");

	beforeEach(() => {
		mockTaskRepository.clear();
		mockProjectRepository.clear();
		jest.clearAllMocks();

		userService = createUserServiceMock();
		deleteTaskService = new DeleteTaskService(
			mockTaskRepository,
			mockProjectRepository,
			new MockCacheProvider(),
			mockCheckProjectOwnershipService,
			userService,
		);

		const testUser = createUser({ id: ownerId });
		userService.findById.mockResolvedValue(testUser);
		mockCheckProjectOwnershipService.execute.mockResolvedValue(true);
	});

	describe("execute", () => {
		it("should delete task when found", async () => {
			const projectId = "project-id-123";
			const taskId = "task-id-123";
			const task = createTask({ id: taskId, projectId });
			const project = createProject({ id: projectId, taskIds: [taskId] });

			findTaskSpy.mockResolvedValue(task);
			findProjectSpy.mockResolvedValue(project);
			deleteTaskSpy.mockResolvedValue(undefined);
			updateProjectSpy.mockResolvedValue(project);

			await deleteTaskService.execute({ taskId: taskId, ownerId });

			expect(findTaskSpy).toHaveBeenCalledWith(taskId);
			expect(findProjectSpy).toHaveBeenCalledWith(projectId);
			expect(updateProjectSpy).toHaveBeenCalledWith(project);
			expect(deleteTaskSpy).toHaveBeenCalledWith(taskId);
		});

		it("should throw NotFoundError when task not found", async () => {
			const taskId = "non-existent-task-id";

			findTaskSpy.mockResolvedValue(null);

			await expect(
				deleteTaskService.execute({ taskId: taskId, ownerId }),
			).rejects.toThrow(NotFoundError);

			expect(findTaskSpy).toHaveBeenCalledWith(taskId);
			expect(deleteTaskSpy).not.toHaveBeenCalled();
		});

		it("should handle repository errors gracefully", async () => {
			const projectId = "project-id-123";
			const taskId = "task-id-123";
			const task = createTask({ id: taskId, projectId });
			const project = createProject({ id: projectId, taskIds: [taskId] });

			findTaskSpy.mockResolvedValue(task);
			findProjectSpy.mockResolvedValue(project);
			deleteTaskSpy.mockRejectedValue(new Error("Database connection failed"));

			await expect(
				deleteTaskService.execute({ taskId: taskId, ownerId }),
			).rejects.toThrow("Database connection failed");

			expect(findTaskSpy).toHaveBeenCalledWith(taskId);
			expect(findProjectSpy).toHaveBeenCalledWith(projectId);
			expect(deleteTaskSpy).toHaveBeenCalledWith(taskId);
		});
	});
});
