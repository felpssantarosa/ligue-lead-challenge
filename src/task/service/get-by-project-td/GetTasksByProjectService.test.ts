import type { Project } from "@/project/domain";
import { ApplicationError, NotFoundError } from "@/shared/Errors";
import { GetTasksByProjectService } from "@/task/service/get-by-project-td/GetTasksByProjectService";
import {
	createProject,
	createProjectServiceMock,
	createTask,
	createTaskRepositoryMock,
	MockCacheProvider,
} from "@/test/mocks";

describe("GetTasksByProjectService", () => {
	let existingProject: Project;
	let projectService: ReturnType<typeof createProjectServiceMock>;
	let taskRepository: ReturnType<typeof createTaskRepositoryMock>;
	let getTasksByProjectService: GetTasksByProjectService;

	beforeEach(async () => {
		projectService = createProjectServiceMock();
		taskRepository = createTaskRepositoryMock();

		getTasksByProjectService = new GetTasksByProjectService(
			taskRepository,
			projectService,
			new MockCacheProvider(),
		);

		existingProject = createProject({
			title: "Test Project",
			description: "A test project",
			tags: ["test"],
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("execute", () => {
		it("should get tasks by project successfully", async () => {
			const projectId = existingProject.id;

			const project = createProject({ id: projectId });
			const task1 = createTask({ projectId, title: "Task 1" });
			const task2 = createTask({ projectId, title: "Task 2" });
			const tasks = [task1, task2];

			projectService.get.mockResolvedValue(project);
			taskRepository.findByProjectId.mockResolvedValue(tasks);

			const result = await getTasksByProjectService.execute({ projectId });

			expect(result).toEqual({
				tasks: [
					{
						id: task1.id,
						title: task1.title,
						description: task1.description,
						status: task1.status,
						projectId: task1.projectId,
						createdAt: task1.createdAt,
						updatedAt: task1.updatedAt,
					},
					{
						id: task2.id,
						title: task2.title,
						description: task2.description,
						status: task2.status,
						projectId: task2.projectId,
						createdAt: task2.createdAt,
						updatedAt: task2.updatedAt,
					},
				],
				projectId,
			});

			expect(projectService.get).toHaveBeenCalledWith({
				id: projectId,
			});
			expect(taskRepository.findByProjectId).toHaveBeenCalledWith(projectId);
		});

		it("should return empty array when project has no tasks", async () => {
			const projectId = "project-id-123";
			const project = createProject({ id: projectId });

			projectService.get.mockResolvedValue(project);

			taskRepository.findByProjectId.mockResolvedValue([]);

			const result = await getTasksByProjectService.execute({ projectId });

			expect(result).toEqual({
				projectId,
				tasks: [],
			});
		});

		it("should throw NotFoundError when project does not exist", async () => {
			const projectId = "non-existent-project-id";

			projectService.get.mockResolvedValue(null);

			await expect(
				getTasksByProjectService.execute({ projectId }),
			).rejects.toThrow(NotFoundError);

			expect(projectService.get).toHaveBeenCalledWith({
				id: projectId,
			});
			expect(taskRepository.findByProjectId).not.toHaveBeenCalled();
		});

		it("should throw ApplicationError when project ID mismatch occurs", async () => {
			const requestedProjectId = "project-id-123";
			const returnedProjectId = "different-project-id";
			const project = createProject({ id: returnedProjectId });

			projectService.get.mockResolvedValue(project);

			await expect(
				getTasksByProjectService.execute({ projectId: requestedProjectId }),
			).rejects.toThrow(ApplicationError);

			expect(projectService.get).toHaveBeenCalledWith({
				id: requestedProjectId,
			});
			expect(taskRepository.findByProjectId).not.toHaveBeenCalled();
		});

		it("should handle repository errors", async () => {
			const projectId = "project-id-123";
			const project = createProject({ id: projectId });

			projectService.get.mockResolvedValue(project);
			taskRepository.findByProjectId.mockRejectedValue(
				new Error("Database connection failed"),
			);

			await expect(
				getTasksByProjectService.execute({ projectId }),
			).rejects.toThrow("Database connection failed");

			expect(projectService.get).toHaveBeenCalledWith({
				id: projectId,
			});
			expect(taskRepository.findByProjectId).toHaveBeenCalledWith(projectId);
		});

		it("should handle project service errors", async () => {
			const projectId = "project-id-123";

			projectService.get.mockRejectedValue(new Error("Project service error"));

			await expect(
				getTasksByProjectService.execute({ projectId }),
			).rejects.toThrow("Project service error");

			expect(projectService.get).toHaveBeenCalledWith({
				id: projectId,
			});
			expect(taskRepository.findByProjectId).not.toHaveBeenCalled();
		});
	});
});
