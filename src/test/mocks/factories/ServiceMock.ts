import type { ProjectRepository } from "@/project/infra/repository/ProjectRepository";
import { CreateProjectService } from "@/project/service/CreateProjectService";
import { DeleteProjectService } from "@/project/service/DeleteProjectService";
import { GetAllProjectsService } from "@/project/service/GetAllProjectsService";
import { GetProjectService } from "@/project/service/GetProjectService";
import { UpdateProjectService } from "@/project/service/UpdateProjectService";
import { MockProjectRepository } from "@/test/mocks/repositories/MockProjectRepository";

const mockProjectRepository = new MockProjectRepository();

const createProjectService = new CreateProjectService(mockProjectRepository);
const getProjectService = new GetProjectService(mockProjectRepository);
const getAllProjectsService = new GetAllProjectsService(mockProjectRepository);
const updateProjectService = new UpdateProjectService(mockProjectRepository);
const deleteProjectService = new DeleteProjectService(mockProjectRepository);

// Mock repository methods for more granular testing
const mockRepository = {
	save: jest.fn(),
	findById: jest.fn(),
	findAll: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	clear: jest.fn(),
} as jest.Mocked<ProjectRepository>;

// Service instances with mocked repository
const mockCreateProjectService = new CreateProjectService(mockRepository);
const mockGetProjectService = new GetProjectService(mockRepository);
const mockGetAllProjectsService = new GetAllProjectsService(mockRepository);
const mockUpdateProjectService = new UpdateProjectService(mockRepository);
const mockDeleteProjectService = new DeleteProjectService(mockRepository);

export {
	// Real repository instances for integration-style tests
	createProjectService,
	getProjectService,
	getAllProjectsService,
	updateProjectService,
	deleteProjectService,
	mockProjectRepository,
	// Mocked repository instances for unit tests
	mockCreateProjectService,
	mockGetProjectService,
	mockGetAllProjectsService,
	mockUpdateProjectService,
	mockDeleteProjectService,
	mockRepository,
};
