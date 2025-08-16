import type { ProjectRepository } from "@/project/infra/repository/ProjectRepository";

export * from "./MockProjectRepository";
export * from "./MockTaskRepository";

export const mockRepository = {
	save: jest.fn(),
	findById: jest.fn(),
	findAll: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	clear: jest.fn(),
} as jest.Mocked<ProjectRepository>;
