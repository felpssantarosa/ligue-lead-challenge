import type { ProjectRepository } from "@/project/infra";
import type { ProjectService } from "@/project/service";
import type { TaskRepository } from "@/task/infra";
import type { UserService } from "@/user";

export const createProjectRepositoryMock = () =>
	({
		findById: jest.fn(),
		save: jest.fn(),
		findAll: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		clear: jest.fn(),
	}) as jest.Mocked<ProjectRepository>;

export const createMockTaskRepository = (): jest.Mocked<TaskRepository> =>
	({
		findById: jest.fn(),
		save: jest.fn(),
		findAll: jest.fn(),
		findByProjectId: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		deleteByProjectId: jest.fn(),
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

export const createUserServiceMock = () =>
	({
		authenticate: jest.fn(),
		login: jest.fn(),
		register: jest.fn(),
		findById: jest.fn(),
	}) as unknown as jest.Mocked<UserService>;
