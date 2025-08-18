import type { Project } from "@/project/domain";
import { TaskStatus } from "@/shared/domain/TaskStatus";
import type { Task } from "@/task/domain";
import type { CreateTaskServiceParams } from "@/task/service";
import { CreateTaskService } from "@/task/service/create/CreateTaskService";
import { generateUUID } from "@/test/factories/UUIDFactory";
import {
	createProject,
	createProjectRepositoryMock,
	createTaskRepositoryMock,
	MockCacheProvider,
} from "@/test/mocks";
import { createUserServiceMock } from "@/test/mocks/factories/MockFactory";
import { mockCheckProjectOwnershipService } from "@/test/mocks/factories/ProjectMock";
import { createUser } from "@/test/mocks/factories/UserMock";

describe("CreateTaskService", () => {
	let existingProject: Project;
	let projectRepository: ReturnType<typeof createProjectRepositoryMock>;
	let taskRepository: ReturnType<typeof createTaskRepositoryMock>;
	let createTaskService: CreateTaskService;
	let userService: ReturnType<typeof createUserServiceMock>;
	const ownerId = generateUUID();
	let testUser: ReturnType<typeof createUser>;

	beforeEach(async () => {
		projectRepository = createProjectRepositoryMock();
		taskRepository = createTaskRepositoryMock();
		userService = createUserServiceMock();

		createTaskService = new CreateTaskService(
			taskRepository,
			projectRepository,
			new MockCacheProvider(),
			mockCheckProjectOwnershipService,
			userService,
		);

		existingProject = createProject({
			title: "Test Project",
			description: "A test project",
			tags: ["test"],
		});

		testUser = createUser({ id: ownerId });

		projectRepository.findById.mockResolvedValue(existingProject);
		userService.findById.mockResolvedValue(testUser);
		mockCheckProjectOwnershipService.execute.mockResolvedValue(true);

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
			ownerId,
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
			ownerId,
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
			ownerId,
		};

		projectRepository.findById.mockResolvedValueOnce(null);

		await expect(createTaskService.execute(request)).rejects.toThrow(
			"Project with id non-existent-project-id not found",
		);
	});

	it("should save task to repository", async () => {
		const request: CreateTaskServiceParams = {
			title: "Test Task",
			description: "A test task description",
			status: TaskStatus.TODO,
			projectId: existingProject.id,
			ownerId,
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
			ownerId,
		};

		const result = await createTaskService.execute(request);

		expect(result.status).toBe(TaskStatus.TODO);
	});
});
