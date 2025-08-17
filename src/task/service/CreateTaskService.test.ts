import type { Project } from "@/project/domain";
import { TaskStatus } from "@/shared/domain/TaskStatus";
import type { Task } from "@/task/domain";
import type { CreateTaskServiceParams } from "@/task/service";
import { CreateTaskService } from "@/task/service/CreateTaskService";
import {
	createProject,
	createProjectRepositoryMock,
	createTaskRepositoryMock,
} from "@/test/mocks";

describe("CreateTaskService", () => {
	let existingProject: Project;
	let projectRepository: ReturnType<typeof createProjectRepositoryMock>;
	let taskRepository: ReturnType<typeof createTaskRepositoryMock>;
	let createTaskService: CreateTaskService;

	beforeEach(async () => {
		projectRepository = createProjectRepositoryMock();
		taskRepository = createTaskRepositoryMock();

		createTaskService = new CreateTaskService(
			taskRepository,
			projectRepository,
		);

		existingProject = createProject({
			title: "Test Project",
			description: "A test project",
			tags: ["test"],
		});

		projectRepository.findById.mockResolvedValue(existingProject);

		taskRepository.save.mockImplementation(async (task: Task) => {
			return task;
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("should create a task successfully", async () => {
		const request: CreateTaskServiceParams = {
			title: "Test Task",
			description: "A test task description",
			status: TaskStatus.TODO,
			projectId: existingProject.id,
		};

		const result = await createTaskService.execute(request);

		expect(result).toBeDefined();
		expect(result.title).toBe(request.title);
		expect(result.description).toBe(request.description);
		expect(result.status).toBe(request.status);
		expect(result.projectId).toBe(request.projectId);
		expect(result.id).toBeDefined();
		expect(result.createdAt).toBeInstanceOf(Date);
		expect(result.updatedAt).toBeInstanceOf(Date);
	});

	it("should throw error when title is empty", async () => {
		const request: CreateTaskServiceParams = {
			title: "",
			description: "A test task description",
			status: TaskStatus.TODO,
			projectId: existingProject.id,
		};

		await expect(createTaskService.execute(request)).rejects.toThrow(
			"Task title cannot be empty",
		);
	});

	it("should throw error when project does not exist", async () => {
		const request: CreateTaskServiceParams = {
			title: "Test Task",
			description: "A test task description",
			status: TaskStatus.TODO,
			projectId: "non-existent-project-id",
		};

		projectRepository.findById.mockResolvedValueOnce(null);

		await expect(createTaskService.execute(request)).rejects.toThrow(
			"Project not found",
		);
	});

	it("should save task to repository", async () => {
		const request: CreateTaskServiceParams = {
			title: "Test Task",
			description: "A test task description",
			status: TaskStatus.TODO,
			projectId: existingProject.id,
		};

		const result = await createTaskService.execute(request);

		expect(taskRepository.save).toHaveBeenCalledWith(
			expect.objectContaining({
				title: request.title,
				description: request.description,
				status: request.status,
				projectId: request.projectId,
			}),
		);
		expect(result).toBeDefined();
		expect(result.title).toBe(request.title);
	});

	it("should create task with default status TODO if not provided", async () => {
		const request: CreateTaskServiceParams = {
			title: "Test Task",
			description: "A test task description",
			status: TaskStatus.TODO,
			projectId: existingProject.id,
		};

		const result = await createTaskService.execute(request);

		expect(result.status).toBe(TaskStatus.TODO);
	});
});
