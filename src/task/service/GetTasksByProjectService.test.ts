import type { Project } from "@/project/domain";
import { ApplicationError, NotFoundError } from "@/shared/Errors";
import {
	createProject,
	createTask,
	mockGetTasksByProjectServiceImplementation as getTasksByProjectService,
	mockProjectService,
	mockTaskRepository,
	mockProjectRepository as projectRepository,
} from "@/test/mocks";

describe("GetTasksByProjectService", () => {
	let existingProject: Project;
	const getProjectServiceSpy = jest.spyOn(mockProjectService, "get");
	const findByProjectSpy = jest.spyOn(mockTaskRepository, "findByProjectId");

	beforeEach(async () => {
		mockTaskRepository.clear();
		jest.clearAllMocks();

		existingProject = createProject({
			title: "Test Project",
			description: "A test project",
			tags: ["test"],
		});

		await projectRepository.save(existingProject);
	});

	describe("execute", () => {
		it("should get tasks by project successfully", async () => {
			const projectId = existingProject.id;

			const project = createProject({ id: projectId });
			const task1 = createTask({ projectId, title: "Task 1" });
			const task2 = createTask({ projectId, title: "Task 2" });
			const tasks = [task1, task2];

			getProjectServiceSpy.mockResolvedValue({ ...project.toJSON(), tasks });
			findByProjectSpy.mockResolvedValue(tasks);

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

			expect(getProjectServiceSpy).toHaveBeenCalledWith({
				id: projectId,
			});
			expect(findByProjectSpy).toHaveBeenCalledWith(projectId);
		});

		it("should return empty array when project has no tasks", async () => {
			const projectId = "project-id-123";
			const project = createProject({ id: projectId });

			getProjectServiceSpy.mockResolvedValue({
				...project.toJSON(),
				tasks: [],
			});

			findByProjectSpy.mockResolvedValue([]);

			const result = await getTasksByProjectService.execute({ projectId });

			expect(result).toEqual({
				tasks: [],
				projectId,
			});
		});

		it("should throw NotFoundError when project does not exist", async () => {
			const projectId = "non-existent-project-id";

			getProjectServiceSpy.mockResolvedValue(null);

			await expect(
				getTasksByProjectService.execute({ projectId }),
			).rejects.toThrow(NotFoundError);

			expect(getProjectServiceSpy).toHaveBeenCalledWith({
				id: projectId,
			});
			expect(findByProjectSpy).not.toHaveBeenCalled();
		});

		it("should throw ApplicationError when project ID mismatch occurs", async () => {
			const requestedProjectId = "project-id-123";
			const returnedProjectId = "different-project-id";
			const project = createProject({ id: returnedProjectId });

			getProjectServiceSpy.mockResolvedValue({
				...project.toJSON(),
				tasks: [],
			});

			await expect(
				getTasksByProjectService.execute({ projectId: requestedProjectId }),
			).rejects.toThrow(ApplicationError);

			expect(getProjectServiceSpy).toHaveBeenCalledWith({
				id: requestedProjectId,
			});
			expect(findByProjectSpy).not.toHaveBeenCalled();
		});

		it("should handle repository errors", async () => {
			const projectId = "project-id-123";
			const project = createProject({ id: projectId });

			getProjectServiceSpy.mockResolvedValue({
				...project.toJSON(),
				tasks: [],
			});
			findByProjectSpy.mockRejectedValue(
				new Error("Database connection failed"),
			);

			await expect(
				getTasksByProjectService.execute({ projectId }),
			).rejects.toThrow("Database connection failed");

			expect(getProjectServiceSpy).toHaveBeenCalledWith({
				id: projectId,
			});
			expect(findByProjectSpy).toHaveBeenCalledWith(projectId);
		});

		it("should handle project service errors", async () => {
			const projectId = "project-id-123";

			getProjectServiceSpy.mockRejectedValue(
				new Error("Project service error"),
			);

			await expect(
				getTasksByProjectService.execute({ projectId }),
			).rejects.toThrow("Project service error");

			expect(getProjectServiceSpy).toHaveBeenCalledWith({
				id: projectId,
			});
			expect(findByProjectSpy).not.toHaveBeenCalled();
		});
	});
});
