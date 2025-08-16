import type { EntityId } from "@/shared/domain/Entity";
import { TaskStatus } from "@/shared/domain/TaskStatus";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import { Task } from "@/task/domain/Task";
import type { TaskRepository } from "@/task/infra/repository/TaskRepository";
import type { CreateTaskService } from "@/task/service/CreateTaskService";
import type { DeleteTaskService } from "@/task/service/DeleteTaskService";
import type { GetAllTasksService } from "@/task/service/GetAllTasksService";
import type { GetTaskService } from "@/task/service/GetTaskService";
import type { GetTasksByProjectService } from "@/task/service/GetTasksByProjectService";
import type { UpdateTaskService } from "@/task/service/UpdateTaskService";
import { generateUuid } from "@/test/factories/UUIDFactory";

const mockValidation = {
	execute: jest.fn(),
} as ValidationHandler & { execute: jest.Mock };

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

const mockGetAllTasksService = {
	execute: jest.fn(),
} as GetAllTasksService & { execute: jest.Mock };

const mockGetTasksByProjectService = {
	execute: jest.fn(),
} as GetTasksByProjectService & { execute: jest.Mock };

const mockTaskRepository = {
	save: jest.fn(),
	findById: jest.fn(),
	findByProjectId: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	findAll: jest.fn(),
} as TaskRepository & {
	save: jest.Mock;
	findById: jest.Mock;
	findByProjectId: jest.Mock;
	update: jest.Mock;
	delete: jest.Mock;
	findAll: jest.Mock;
};

export function createTask(
	overrides: Partial<{
		id: EntityId;
		title: string;
		description: string;
		status: TaskStatus;
		projectId: EntityId;
		createdAt: Date;
		updatedAt: Date;
	}> = {},
): Task {
	const defaults = {
		id: generateUuid(),
		title: "Test Task",
		description: "Test task description",
		status: TaskStatus.TODO,
		projectId: generateUuid(),
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const taskData = { ...defaults, ...overrides };

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

export {
	mockValidation,
	mockCreateTaskService,
	mockGetTaskService,
	mockUpdateTaskService,
	mockDeleteTaskService,
	mockGetAllTasksService,
	mockGetTasksByProjectService,
	mockTaskRepository,
};
