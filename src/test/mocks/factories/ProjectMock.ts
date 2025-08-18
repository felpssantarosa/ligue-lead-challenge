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
import { CheckProjectOwnershipService } from "@/project/service/check-ownership/CheckProjectOwnershipService";
import { CreateProjectService } from "@/project/service/create/CreateProjectService";
import { DeleteProjectService } from "@/project/service/delete/DeleteProjectService";
import { GetProjectService } from "@/project/service/get/GetProjectService";
import { GetAllProjectsService } from "@/project/service/get-all/GetAllProjectsService";
import { UpdateProjectService } from "@/project/service/update/UpdateProjectService";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import { generateUUID } from "@/test/factories";
import { MockCacheProvider } from "@/test/mocks/cache/MockCacheProvider";
import { createUserServiceMock } from "@/test/mocks/factories/MockFactory";
import { mockTaskService } from "@/test/mocks/factories/TaskMock";
import { MockProjectRepository } from "@/test/mocks/repositories";

const mockValidation = {
	execute: jest.fn(),
} as ValidationHandler & { execute: jest.Mock };

const mockCheckProjectOwnershipService = {
	execute: jest.fn(),
} as CheckProjectOwnershipService & { execute: jest.Mock };

const mockProjectRepository = new MockProjectRepository();
const mockProjectCacheProvider = new MockCacheProvider();
const mockUserService = createUserServiceMock();

const mockCreateProjectServiceImplementation = new CreateProjectService(
	mockProjectRepository,
	mockProjectCacheProvider,
	mockUserService,
);
const mockGetProjectServiceImplementation = new GetProjectService(
	mockProjectRepository,
	mockTaskService,
	mockProjectCacheProvider,
);
const mockGetAllProjectsServiceImplementation = new GetAllProjectsService(
	mockProjectRepository,
	mockProjectCacheProvider,
);
const mockCheckProjectOwnershipImplementation =
	new CheckProjectOwnershipService(mockProjectRepository);
const mockUpdateProjectServiceImplementation = new UpdateProjectService(
	mockProjectRepository,
	mockProjectCacheProvider,
	mockCheckProjectOwnershipService,
	mockUserService,
);
const mockDeleteProjectServiceImplementation = new DeleteProjectService(
	mockProjectRepository,
	mockProjectCacheProvider,
	mockTaskService,
	mockCheckProjectOwnershipService,
	mockUserService,
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
		taskIds: [],
		ownerId: "test-owner-id",
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
	mockCheckProjectOwnershipService,
	mockCreateProjectServiceImplementation,
	mockGetProjectServiceImplementation,
	mockGetAllProjectsServiceImplementation,
	mockUpdateProjectServiceImplementation,
	mockDeleteProjectServiceImplementation,
	mockCheckProjectOwnershipImplementation,
	mockValidation,
	mockProjectRepository,
	mockProjectService,
	mockProjectCacheProvider,
	mockUserService,
};
