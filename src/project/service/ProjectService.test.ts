import { container } from "tsyringe";
import { ProjectService } from "@/project/service";
import { createProject } from "@/test/mocks/factories/ProjectMock";

interface MockCreateProjectService {
	execute: jest.Mock;
}

interface MockGetAllProjectsService {
	execute: jest.Mock;
}

interface MockGetProjectService {
	execute: jest.Mock;
}

interface MockUpdateProjectService {
	execute: jest.Mock;
}

interface MockDeleteProjectService {
	execute: jest.Mock;
}

describe("ProjectService Orchestrator", () => {
	let projectService: ProjectService;
	let mockCreateProjectService: MockCreateProjectService;
	let mockGetAllProjectsService: MockGetAllProjectsService;
	let mockGetProjectService: MockGetProjectService;
	let mockUpdateProjectService: MockUpdateProjectService;
	let mockDeleteProjectService: MockDeleteProjectService;

	beforeEach(() => {
		container.clearInstances();

		mockCreateProjectService = { execute: jest.fn() };
		mockGetAllProjectsService = { execute: jest.fn() };
		mockGetProjectService = { execute: jest.fn() };
		mockUpdateProjectService = { execute: jest.fn() };
		mockDeleteProjectService = { execute: jest.fn() };

		projectService = new ProjectService(
			mockCreateProjectService as never,
			mockGetAllProjectsService as never,
			mockGetProjectService as never,
			mockUpdateProjectService as never,
			mockDeleteProjectService as never,
		);

		jest.clearAllMocks();
	});

	describe("create", () => {
		it("should delegate to CreateProjectService", async () => {
			const projectData = {
				title: "Test Project",
				description: "Test description",
				tags: ["test"],
				ownerId: "test-owner-id",
			};
			const project = createProject({});
			mockCreateProjectService.execute.mockResolvedValue(project);

			const result = await projectService.create(projectData);

			expect(result).toEqual(project);
			expect(mockCreateProjectService.execute).toHaveBeenCalledWith(
				projectData,
			);
		});
	});

	describe("getAll", () => {
		it("should delegate to GetAllProjectsService", async () => {
			const params = { page: 1, limit: 10 };
			const projects = [createProject({}), createProject({})];
			const paginated = { data: projects, total: 2, page: 1, limit: 10 };

			mockGetAllProjectsService.execute.mockResolvedValue(paginated);

			const result = await projectService.getAll(params);

			expect(result).toEqual(paginated);
			expect(mockGetAllProjectsService.execute).toHaveBeenCalledWith(params);
		});
	});

	describe("get", () => {
		it("should delegate to GetProjectService", async () => {
			const project = createProject({});
			const params = { id: project.id };

			mockGetProjectService.execute.mockResolvedValue(project);

			const result = await projectService.get(params);

			expect(result).toEqual(project);
			expect(mockGetProjectService.execute).toHaveBeenCalledWith(params);
		});
	});

	describe("update", () => {
		it("should delegate to UpdateProjectService", async () => {
			const project = createProject({});
			const params = {
				projectId: project.id,
				title: "Updated Project",
				ownerId: "test-owner-id",
			};
			const updatedProject = { ...project, title: "Updated Project" };

			mockUpdateProjectService.execute.mockResolvedValue(updatedProject);

			const result = await projectService.update(params);

			expect(result).toEqual(updatedProject);
			expect(mockUpdateProjectService.execute).toHaveBeenCalledWith(params);
		});
	});

	describe("delete", () => {
		it("should delegate to DeleteProjectService", async () => {
			const params = { projectId: "test-project-id", ownerId: "test-owner-id" };

			mockDeleteProjectService.execute.mockResolvedValue(undefined);

			await projectService.delete(params);

			expect(mockDeleteProjectService.execute).toHaveBeenCalledWith(params);
		});
	});
});
