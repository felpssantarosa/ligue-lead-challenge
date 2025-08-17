import { TaskStatus } from "@/shared/domain/TaskStatus";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import {
	CreateTaskController,
	DeleteTaskController,
	GetTaskController,
	UpdateTaskController,
} from "@/task/controller";
import type { TaskProps } from "@/task/domain";
import { Task } from "@/task/domain/Task";
import { DeleteByProjectIdService, TaskService } from "@/task/service";
import { CreateTaskService } from "@/task/service/CreateTaskService";
import { DeleteTaskService } from "@/task/service/DeleteTaskService";
import { GetAllTasksService } from "@/task/service/GetAllTasksService";
import { GetTaskService } from "@/task/service/GetTaskService";
import { GetTasksByProjectService } from "@/task/service/GetTasksByProjectService";
import { UpdateTaskService } from "@/task/service/UpdateTaskService";
import { generateUUID } from "@/test/factories/UUIDFactory";
import { MockCacheProvider } from "@/test/mocks/cache/MockCacheProvider";
import {
	mockProjectRepository,
	mockProjectService,
} from "@/test/mocks/factories/ProjectMock";
import { MockTaskRepository } from "@/test/mocks/repositories";

const mockTaskValidation = {
	execute: jest.fn(),
} as ValidationHandler & { execute: jest.Mock };

const mockTaskCacheProvider = new MockCacheProvider();
const mockTaskRepository = new MockTaskRepository();
const mockCreateTaskServiceImplementation = new CreateTaskService(
	mockTaskRepository,
	mockProjectRepository,
	mockTaskCacheProvider,
);
const mockGetTasksByProjectServiceImplementation = new GetTasksByProjectService(
	mockTaskRepository,
	mockProjectService,
	mockTaskCacheProvider,
);
const mockGetTaskServiceImplementation = new GetTaskService(
	mockTaskRepository,
	mockTaskCacheProvider,
);
const mockGetAllTasksServiceImplementation = new GetAllTasksService(
	mockTaskRepository,
	mockTaskCacheProvider,
);
const mockUpdateTaskServiceImplementation = new UpdateTaskService(
	mockTaskRepository,
	mockTaskCacheProvider,
);
const mockDeleteTaskServiceImplementation = new DeleteTaskService(
	mockTaskRepository,
	mockProjectRepository,
	mockTaskCacheProvider,
);
const mockDeleteTaskByProjectIdServiceImplementation = new DeleteByProjectIdService(
	mockTaskRepository,
	mockTaskCacheProvider,
);

const mockCreateTaskService = {
	execute: jest.fn(),
} as CreateTaskService & { execute: jest.Mock };

const mockGetTaskService = {
	execute: jest.fn(),
} as GetTaskService & { execute: jest.Mock };

const mockUpdateTaskService = {
	execute: jest.fn(),
} as UpdateTaskService & { execute: jest.Mock };

const mockDeleteTaskService = {
	execute: jest.fn(),
} as DeleteTaskService & { execute: jest.Mock };

const mockGetTaskController = new GetTaskController(
	mockGetTaskService,
	mockTaskValidation,
);
const mockGetAllTasksService = {
	execute: jest.fn(),
} as GetAllTasksService & { execute: jest.Mock };

const mockGetTasksByProjectService = {
	execute: jest.fn(),
} as GetTasksByProjectService & { execute: jest.Mock };

const mockCreateTaskController = new CreateTaskController(
	mockCreateTaskService,
	mockTaskValidation,
);
const mockDeleteTaskController = new DeleteTaskController(
	mockDeleteTaskService,
	mockTaskValidation,
);
const mockUpdateTaskController = new UpdateTaskController(
	mockUpdateTaskService,
	mockTaskValidation,
);

export function createTask(params: Partial<TaskProps>): Task {
	const defaults = {
		id: generateUUID(),
		title: "Test Task",
		description: "Test task description",
		status: TaskStatus.TODO,
		projectId: generateUUID(),
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const taskData = { ...defaults, ...params };

	return Task.fromJSON({
		id: taskData.id,
		title: taskData.title,
		description: taskData.description,
		status: taskData.status,
		projectId: taskData.projectId,
		createdAt: taskData.createdAt,
		updatedAt: taskData.updatedAt,
	});
}

const mockTaskService = new TaskService(
	mockCreateTaskServiceImplementation,
	mockGetAllTasksServiceImplementation,
	mockGetTaskServiceImplementation,
	mockUpdateTaskServiceImplementation,
	mockDeleteTaskServiceImplementation,
	mockDeleteTaskByProjectIdServiceImplementation
);

export {
	mockTaskValidation,
	mockCreateTaskService,
	mockGetTaskService,
	mockUpdateTaskService,
	mockDeleteTaskService,
	mockGetAllTasksService,
	mockGetTasksByProjectService,
	mockTaskRepository,
	mockCreateTaskServiceImplementation,
	mockGetTaskServiceImplementation,
	mockGetAllTasksServiceImplementation,
	mockUpdateTaskServiceImplementation,
	mockDeleteTaskServiceImplementation,
	mockDeleteTaskByProjectIdServiceImplementation,
	mockGetTasksByProjectServiceImplementation,
	mockUpdateTaskController,
	mockDeleteTaskController,
	mockCreateTaskController,
	mockGetTaskController,
	mockTaskService,
	mockProjectService,
	mockProjectRepository,
	mockTaskCacheProvider,
};
