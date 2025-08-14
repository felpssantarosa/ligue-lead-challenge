import {
	CreateProjectController,
	DeleteProjectController,
	GetAllProjectsController,
	GetProjectController,
	UpdateProjectController,
} from "@/project/controller";
import type { CreateProjectService } from "@/project/service/CreateProjectService";
import type { DeleteProjectService } from "@/project/service/DeleteProjectService";
import type { GetAllProjectsService } from "@/project/service/GetAllProjectsService";
import type { GetProjectService } from "@/project/service/GetProjectService";
import type { UpdateProjectService } from "@/project/service/UpdateProjectService";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";

const mockValidation = {
	execute: jest.fn(),
} as ValidationHandler & { execute: jest.Mock };

const mockCreateService = {
	execute: jest.fn(),
} as CreateProjectService & { execute: jest.Mock };

const mockGetService = {
	execute: jest.fn(),
} as GetProjectService & { execute: jest.Mock };

const mockGetAllService = {
	execute: jest.fn(),
} as GetAllProjectsService & { execute: jest.Mock };

const mockUpdateService = {
	execute: jest.fn(),
} as UpdateProjectService & { execute: jest.Mock };

const mockDeleteService = {
	execute: jest.fn(),
} as DeleteProjectService & { execute: jest.Mock };

const mockCreateProjectController = new CreateProjectController(
	mockCreateService,
	mockValidation,
);
const mockUpdateProjectController = new UpdateProjectController(
	mockUpdateService,
	mockValidation,
);
const mockDeleteProjectController = new DeleteProjectController(
	mockDeleteService,
	mockValidation,
);
const mockGetProjectController = new GetProjectController(
	mockGetService,
	mockValidation,
);
const mockGetAllProjectsController = new GetAllProjectsController(
	mockGetAllService,
	mockValidation,
);

export {
	mockCreateProjectController,
	mockUpdateProjectController,
	mockDeleteProjectController,
	mockGetProjectController,
	mockGetAllProjectsController,
	mockCreateService,
	mockGetService,
	mockGetAllService,
	mockUpdateService,
	mockDeleteService,
	mockValidation,
};
