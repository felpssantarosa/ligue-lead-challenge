import type { ProjectRepository } from "@/project/infra/repository/ProjectRepository";

export * from "./MockProjectRepository";
export * from "./MockTaskRepository";
export * from "./MockUserRepository";

export const mockRepository = {
	save: jest.fn(),
	findById: jest.fn(),
	findAll: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	clear: jest.fn(),
} as jest.Mocked<ProjectRepository>;
