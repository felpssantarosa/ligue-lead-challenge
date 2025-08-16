import { container } from "tsyringe";
import type { GetProjectService } from "@/project/service/GetProjectService";
import { ApplicationError, NotFoundError } from "@/shared/Errors";
import type { TaskRepository } from "@/task/infra/repository/TaskRepository";
import { createProject } from "@/test/mocks";
import { createTask } from "@/test/mocks/factories/TaskMock";
import { GetTasksByProjectService } from "./GetTasksByProjectService";

describe("GetTasksByProjectService", () => {
	let getTasksByProjectService: GetTasksByProjectService;
	let mockTaskRepository: jest.Mocked<TaskRepository>;
	let mockProjectService: jest.Mocked<GetProjectService>;

	beforeEach(() => {
		mockTaskRepository = {
			findById: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
			findAll: jest.fn(),
			findByProjectId: jest.fn(),
			update: jest.fn(),
		};

		mockProjectService = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<GetProjectService>;

		container.clearInstances();
		container.registerInstance("TaskRepository", mockTaskRepository);
		container.registerInstance("GetProjectService", mockProjectService);
		getTasksByProjectService = container.resolve(GetTasksByProjectService);
	});

	describe("execute", () => {
		it("should get tasks by project successfully", async () => {
			const projectId = "project-id-123";
			const project = createProject({ id: projectId });
			const task1 = createTask({ projectId, title: "Task 1" });
			const task2 = createTask({ projectId, title: "Task 2" });
			const tasks = [task1, task2];

			mockProjectService.execute.mockResolvedValue(project);
			mockTaskRepository.findByProjectId.mockResolvedValue(tasks);

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

			expect(mockProjectService.execute).toHaveBeenCalledWith({
				id: projectId,
			});
			expect(mockTaskRepository.findByProjectId).toHaveBeenCalledWith(
				projectId,
			);
		});

		it("should return empty array when project has no tasks", async () => {
			const projectId = "project-id-123";
			const project = createProject({ id: projectId });

			mockProjectService.execute.mockResolvedValue(project);
			mockTaskRepository.findByProjectId.mockResolvedValue([]);

			const result = await getTasksByProjectService.execute({ projectId });

			expect(result).toEqual({
				tasks: [],
				projectId,
			});
		});

		it("should throw NotFoundError when project does not exist", async () => {
			const projectId = "non-existent-project-id";

			mockProjectService.execute.mockResolvedValue(null);

			await expect(
				getTasksByProjectService.execute({ projectId }),
			).rejects.toThrow(NotFoundError);

			expect(mockProjectService.execute).toHaveBeenCalledWith({
				id: projectId,
			});
			expect(mockTaskRepository.findByProjectId).not.toHaveBeenCalled();
		});

		it("should throw ApplicationError when project ID mismatch occurs", async () => {
			const requestedProjectId = "project-id-123";
			const returnedProjectId = "different-project-id";
			const project = createProject({ id: returnedProjectId });

			mockProjectService.execute.mockResolvedValue(project);

			await expect(
				getTasksByProjectService.execute({ projectId: requestedProjectId }),
			).rejects.toThrow(ApplicationError);

			expect(mockProjectService.execute).toHaveBeenCalledWith({
				id: requestedProjectId,
			});
			expect(mockTaskRepository.findByProjectId).not.toHaveBeenCalled();
		});

		it("should handle repository errors", async () => {
			const projectId = "project-id-123";
			const project = createProject({ id: projectId });

			mockProjectService.execute.mockResolvedValue(project);
			mockTaskRepository.findByProjectId.mockRejectedValue(
				new Error("Database connection failed"),
			);

			await expect(
				getTasksByProjectService.execute({ projectId }),
			).rejects.toThrow("Database connection failed");

			expect(mockProjectService.execute).toHaveBeenCalledWith({
				id: projectId,
			});
			expect(mockTaskRepository.findByProjectId).toHaveBeenCalledWith(
				projectId,
			);
		});

		it("should handle project service errors", async () => {
			const projectId = "project-id-123";

			mockProjectService.execute.mockRejectedValue(
				new Error("Project service error"),
			);

			await expect(
				getTasksByProjectService.execute({ projectId }),
			).rejects.toThrow("Project service error");

			expect(mockProjectService.execute).toHaveBeenCalledWith({
				id: projectId,
			});
			expect(mockTaskRepository.findByProjectId).not.toHaveBeenCalled();
		});
	});
});
