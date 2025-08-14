import { Project } from "@/project/domain/Project";
import { TaskStatus } from "@/shared/domain/TaskStatus";
import type { CreateTaskRequest } from "@/task/service/CreateTaskService";
import { CreateTaskService } from "@/task/service/CreateTaskService";
import { MockProjectRepository } from "@/test/mocks/repositories/MockProjectRepository";
import { MockTaskRepository } from "@/test/mocks/repositories/MockTaskRepository";

describe("CreateTaskService", () => {
	let createTaskService: CreateTaskService;
	let taskRepository: MockTaskRepository;
	let projectRepository: MockProjectRepository;
	let existingProject: Project;

	beforeEach(async () => {
		taskRepository = new MockTaskRepository();
		projectRepository = new MockProjectRepository();
		createTaskService = new CreateTaskService(
			taskRepository,
			projectRepository,
		);

		existingProject = Project.create({
			title: "Test Project",
			description: "A test project",
			tags: ["test"],
		});
		await projectRepository.save(existingProject);
	});

	afterEach(() => {
		taskRepository.clear();
		projectRepository.clear();
	});

	it("should create a task successfully", async () => {
		const request: CreateTaskRequest = {
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
		const request: CreateTaskRequest = {
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
		const request: CreateTaskRequest = {
			title: "Test Task",
			description: "A test task description",
			status: TaskStatus.TODO,
			projectId: "non-existent-project-id",
		};

		await expect(createTaskService.execute(request)).rejects.toThrow(
			"Project not found",
		);
	});

	it("should save task to repository", async () => {
		const request: CreateTaskRequest = {
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
		const request: CreateTaskRequest = {
			title: "Test Task",
			description: "A test task description",
			status: TaskStatus.TODO,
			projectId: existingProject.id,
		};

		const result = await createTaskService.execute(request);

		expect(result.status).toBe(TaskStatus.TODO);
	});
});
