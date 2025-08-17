import type { Project } from "@/project/domain";
import { TaskStatus } from "@/shared/domain/TaskStatus";
import type { CreateTaskServiceParams } from "@/task/service";
import {
	createProject,
	mockCreateTaskServiceImplementation as createTaskService,
	mockProjectRepositoryForTasks as projectRepository,
	mockTaskRepository as taskRepository,
} from "@/test/mocks";

describe("CreateTaskService", () => {
	let existingProject: Project;
	const findByIdSpy = jest.spyOn(projectRepository, "findById");

	beforeEach(async () => {
		jest.clearAllMocks();

		existingProject = createProject({
			title: "Test Project",
			description: "A test project",
			tags: ["test"],
		});

		await projectRepository.save(existingProject);
		findByIdSpy.mockResolvedValue(existingProject);
	});

	afterEach(() => {
		taskRepository.clear();
		projectRepository.clear();
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

		findByIdSpy.mockResolvedValueOnce(null);

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

		const savedTask = await taskRepository.findById(result.id);
		expect(savedTask).toBeDefined();
		expect(savedTask?.title).toBe(request.title);
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
