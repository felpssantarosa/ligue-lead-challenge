import { container } from "tsyringe";
import { TaskStatus } from "@/shared/domain/TaskStatus";
import { TaskService } from "@/task/service/index";
import { createTask } from "@/test/mocks/factories/TaskMock";

interface MockCreateTaskService {
	execute: jest.Mock;
}

interface MockGetAllTasksService {
	execute: jest.Mock;
}

interface MockGetTaskService {
	execute: jest.Mock;
}

interface MockUpdateTaskService {
	execute: jest.Mock;
}

interface MockDeleteTaskService {
	execute: jest.Mock;
}

interface MockDeleteByProjectIdService {
	execute: jest.Mock;
}

describe("TaskService Orchestrator", () => {
	let taskService: TaskService;
	let mockCreateTaskService: MockCreateTaskService;
	let mockGetAllTasksService: MockGetAllTasksService;
	let mockGetTaskService: MockGetTaskService;
	let mockUpdateTaskService: MockUpdateTaskService;
	let mockDeleteTaskService: MockDeleteTaskService;
	let mockDeleteByProjectIdService: MockDeleteByProjectIdService;

	beforeEach(() => {
		container.clearInstances();

		mockCreateTaskService = { execute: jest.fn() };
		mockGetAllTasksService = { execute: jest.fn() };
		mockGetTaskService = { execute: jest.fn() };
		mockUpdateTaskService = { execute: jest.fn() };
		mockDeleteTaskService = { execute: jest.fn() };
		mockDeleteByProjectIdService = { execute: jest.fn() };

		taskService = new TaskService(
			mockCreateTaskService as never,
			mockGetAllTasksService as never,
			mockGetTaskService as never,
			mockUpdateTaskService as never,
			mockDeleteTaskService as never,
			mockDeleteByProjectIdService as never,
		);

		jest.clearAllMocks();
	});

	describe("create", () => {
		it("should delegate to CreateTaskService", async () => {
			const taskData = {
				title: "Test Task",
				description: "Test description",
				status: TaskStatus.TODO,
				projectId: "project-id",
				ownerId: "test-user-id",
			};
			const task = createTask({});
			mockCreateTaskService.execute.mockResolvedValue(task);

			const result = await taskService.create(taskData);

			expect(result).toEqual(task);
			expect(mockCreateTaskService.execute).toHaveBeenCalledWith(taskData);
		});
	});

	describe("getAll", () => {
		it("should delegate to GetAllTasksService", async () => {
			const params = { page: 1, limit: 10 };
			const tasks = [createTask({}), createTask({})];
			const paginated = { data: tasks, total: 2, page: 1, limit: 10 };

			mockGetAllTasksService.execute.mockResolvedValue(paginated);

			const result = await taskService.getAll(params);

			expect(result).toEqual(paginated);
			expect(mockGetAllTasksService.execute).toHaveBeenCalledWith(params);
		});
	});

	describe("get", () => {
		it("should delegate to GetTaskService", async () => {
			const task = createTask({});
			const params = { id: task.id };

			mockGetTaskService.execute.mockResolvedValue(task);

			const result = await taskService.get(params);

			expect(result).toEqual(task);
			expect(mockGetTaskService.execute).toHaveBeenCalledWith(params);
		});
	});

	describe("update", () => {
		it("should delegate to UpdateTaskService", async () => {
			const task = createTask({});
			const params = {
				taskId: task.id,
				ownerId: "test-user-id",
				title: "Updated Task",
			};
			const updatedTask = { ...task, title: "Updated Task" };

			mockUpdateTaskService.execute.mockResolvedValue(updatedTask);

			const result = await taskService.update(params);

			expect(result).toEqual(updatedTask);
			expect(mockUpdateTaskService.execute).toHaveBeenCalledWith(params);
		});
	});

	describe("delete", () => {
		it("should delegate to DeleteTaskService", async () => {
			const params = {
				taskId: "test-task-id",
				ownerId: "test-user-id",
			};

			mockDeleteTaskService.execute.mockResolvedValue(undefined);

			await taskService.delete(params);

			expect(mockDeleteTaskService.execute).toHaveBeenCalledWith(params);
		});
	});

	describe("deleteByProjectId", () => {
		it("should delegate to DeleteByProjectIdService", async () => {
			const projectId = "project-id-123";
			const result = {
				deletedTasksCount: 2,
				projectId: "project-id-123",
				deletedAt: new Date(),
			};

			mockDeleteByProjectIdService.execute.mockResolvedValue(result);

			const deleteResult = await taskService.deleteByProjectId(projectId);

			expect(deleteResult).toEqual(result);
			expect(mockDeleteByProjectIdService.execute).toHaveBeenCalledWith(
				projectId,
			);
		});
	});
});
