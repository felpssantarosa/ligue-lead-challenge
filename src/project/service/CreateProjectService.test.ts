import type { CreateProjectRequest } from "@/project/service/CreateProjectService";
import {
	createProjectService,
	mockCreateProjectService,
	mockProjectRepository,
	mockRepository,
} from "@/test/mocks/factories/ServiceMock";

describe("CreateProjectService", () => {
	beforeEach(() => {
		mockProjectRepository.clear();
	});

	afterEach(() => {
		mockProjectRepository.clear();
	});

	it("should create a project successfully", async () => {
		const request: CreateProjectRequest = {
			title: "Test Project",
			description: "A test project description",
			tags: ["test", "typescript"],
		};

		const result = await createProjectService.execute(request);

		expect(result).toBeDefined();
		expect(result.title).toBe(request.title);
		expect(result.description).toBe(request.description);
		expect(result.tags).toEqual(request.tags);
		expect(result.id).toBeDefined();
		expect(result.createdAt).toBeInstanceOf(Date);
		expect(result.updatedAt).toBeInstanceOf(Date);
	});

	it("should throw error when title is empty", async () => {
		const request: CreateProjectRequest = {
			title: "",
			description: "A test project description",
			tags: ["test"],
		};

		await expect(createProjectService.execute(request)).rejects.toThrow(
			"Project title cannot be empty",
		);
	});

	it("should create project with empty tags if not provided", async () => {
		const request: CreateProjectRequest = {
			title: "Test Project",
			description: "A test project description",
			tags: [],
		};

		const result = await createProjectService.execute(request);

		expect(result.tags).toEqual([]);
	});

	it("should save project to repository", async () => {
		const request: CreateProjectRequest = {
			title: "Test Project",
			description: "A test project description",
			tags: ["test"],
		};

		const result = await createProjectService.execute(request);

		const savedProject = await mockProjectRepository.findById(result.id);
		expect(savedProject).toBeDefined();
		expect(savedProject?.title).toBe(request.title);
	});

	it("should throw error when title is only whitespace", async () => {
		const request: CreateProjectRequest = {
			title: "   ",
			description: "A test project description",
			tags: ["test"],
		};

		await expect(createProjectService.execute(request)).rejects.toThrow(
			"Project title cannot be empty",
		);
	});

	it("should handle undefined tags", async () => {
		const request = {
			title: "Test Project",
			description: "A test project description",
		} as CreateProjectRequest;

		const result = await createProjectService.execute(request);

		expect(result.tags).toEqual([]);
	});

	it("should handle repository save errors", async () => {
		const request: CreateProjectRequest = {
			title: "Test Project",
			description: "A test project description",
			tags: ["test"],
		};

		mockRepository.save.mockRejectedValue(new Error("Database error"));

		await expect(mockCreateProjectService.execute(request)).rejects.toThrow(
			"Database error",
		);
	});
});
