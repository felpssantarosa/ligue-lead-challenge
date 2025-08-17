import type { ProjectRepository } from "@/project/infra";
import type { ProjectService } from "@/project/service";
import type { TaskRepository } from "@/task/infra";

export const createProjectRepositoryMock = () =>
	({
		findById: jest.fn(),
		save: jest.fn(),
		findAll: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		clear: jest.fn(),
	}) as jest.Mocked<ProjectRepository>;

export const createTaskRepositoryMock = () =>
	({
		findById: jest.fn(),
		save: jest.fn(),
		findAll: jest.fn(),
		findByProjectId: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		clear: jest.fn(),
	}) as jest.Mocked<TaskRepository>;

export const createProjectServiceMock = () =>
	({
		create: jest.fn(),
		getAll: jest.fn(),
		get: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	}) as unknown as jest.Mocked<ProjectService>;
