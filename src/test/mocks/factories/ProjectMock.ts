import {
	CreateProjectController,
	DeleteProjectController,
	GetAllProjectsController,
	GetProjectController,
	UpdateProjectController,
} from "@/project/controller";
import type { ProjectProps } from "@/project/domain";
import { Project } from "@/project/domain/Project";
import { ProjectService } from "@/project/service";
import { CreateProjectService } from "@/project/service/CreateProjectService";
import { DeleteProjectService } from "@/project/service/DeleteProjectService";
import { GetAllProjectsService } from "@/project/service/GetAllProjectsService";
import { GetProjectService } from "@/project/service/GetProjectService";
import { UpdateProjectService } from "@/project/service/UpdateProjectService";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import { generateUUID } from "@/test/factories";
import { MockProjectRepository } from "@/test/mocks/repositories";

const mockValidation = {
	execute: jest.fn(),
} as ValidationHandler & { execute: jest.Mock };

const mockProjectRepository = new MockProjectRepository();

const mockCreateProjectServiceImplementation = new CreateProjectService(
	mockProjectRepository,
);
const mockGetProjectServiceImplementation = new GetProjectService(
	mockProjectRepository,
);
const mockGetAllProjectsServiceImplementation = new GetAllProjectsService(
	mockProjectRepository,
);
const mockUpdateProjectServiceImplementation = new UpdateProjectService(
	mockProjectRepository,
);
const mockDeleteProjectServiceImplementation = new DeleteProjectService(
	mockProjectRepository,
);

const mockCreateProjectService = {
	execute: jest.fn(),
} as CreateProjectService & { execute: jest.Mock };

const mockGetProjectService = {
	execute: jest.fn(),
} as GetProjectService & { execute: jest.Mock };

const mockGetAllProjectsService = {
	execute: jest.fn(),
} as GetAllProjectsService & { execute: jest.Mock };

const mockUpdateProjectService = {
	execute: jest.fn(),
} as UpdateProjectService & { execute: jest.Mock };

const mockDeleteProjectService = {
	execute: jest.fn(),
} as DeleteProjectService & { execute: jest.Mock };

const mockCreateProjectController = new CreateProjectController(
	mockCreateProjectService,
	mockValidation,
);
const mockUpdateProjectController = new UpdateProjectController(
	mockUpdateProjectService,
	mockValidation,
);
const mockDeleteProjectController = new DeleteProjectController(
	mockDeleteProjectService,
	mockValidation,
);
const mockGetProjectController = new GetProjectController(
	mockGetProjectService,
	mockValidation,
);
const mockGetAllProjectsController = new GetAllProjectsController(
	mockGetAllProjectsService,
	mockValidation,
);

const mockProjectService = new ProjectService(
	mockCreateProjectServiceImplementation,
	mockGetAllProjectsServiceImplementation,
	mockGetProjectServiceImplementation,
	mockUpdateProjectServiceImplementation,
	mockDeleteProjectServiceImplementation,
);

export const createProject = (params: Partial<ProjectProps>) => {
	const defaults = {
		id: generateUUID(),
		title: "Test Project",
		description: "Test project description",
		tags: ["test"],
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const projectData = { ...defaults, ...params };

	return Project.fromJSON(projectData);
};

export {
	mockCreateProjectController,
	mockUpdateProjectController,
	mockDeleteProjectController,
	mockGetProjectController,
	mockGetAllProjectsController,
	mockCreateProjectService,
	mockGetProjectService,
	mockGetAllProjectsService,
	mockUpdateProjectService,
	mockDeleteProjectService,
	mockCreateProjectServiceImplementation,
	mockGetProjectServiceImplementation,
	mockGetAllProjectsServiceImplementation,
	mockUpdateProjectServiceImplementation,
	mockDeleteProjectServiceImplementation,
	mockValidation,
	mockProjectRepository,
	mockProjectService,
};
