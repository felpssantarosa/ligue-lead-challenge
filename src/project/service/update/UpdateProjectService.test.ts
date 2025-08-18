import { Project } from "@/project/domain";
import type { UpdateProjectServiceParams } from "@/project/service";
import { ApplicationError } from "@/shared/Errors";
import {
	mockProjectRepository,
	mockUpdateProjectServiceImplementation as updateProjectService,
	mockUserService,
	mockCheckProjectOwnershipService,
} from "@/test/mocks";
import { createUser } from "@/test/mocks/factories/UserMock";

describe("UpdateProjectService", () => {
	beforeEach(() => {
		mockProjectRepository.clear();
		jest.useFakeTimers();

		const testUser = createUser({ id: "test-owner-id" });
		(mockUserService.findById as jest.Mock).mockResolvedValue(testUser);

		(mockCheckProjectOwnershipService.execute as jest.Mock).mockResolvedValue(
			true,
		);
	});

	afterEach(() => {
		mockProjectRepository.clear();
		jest.useRealTimers();
		jest.clearAllMocks();
	});

	it("should update a project successfully", async () => {
		const project = Project.create({
			title: "Original Project",
			description: "Original description",
			tags: ["original"],
			ownerId: "test-owner-id",
		});
		await mockProjectRepository.save(project);

		const updateRequest: UpdateProjectServiceParams = {
			projectId: project.id,
			ownerId: project.ownerId,
			title: "Updated Project",
			description: "Updated description",
			tags: ["updated", "test"],
		};

		const result = await updateProjectService.execute(updateRequest);

		expect(result).toBeDefined();
		expect(result.id).toBe(project.id);
		expect(result.title).toBe(updateRequest.title);
		expect(result.description).toBe(updateRequest.description);
		expect(result.tags).toEqual(updateRequest.tags);
		expect(result.updatedAt).toBeInstanceOf(Date);
	});

	it("should throw ApplicationError when project does not exist", async () => {
		const updateRequest: UpdateProjectServiceParams = {
			projectId: "non-existent-id",
			ownerId: "test-owner-id",
			title: "Updated Project",
			description: "Updated description",
			tags: ["test"],
		};

		await expect(updateProjectService.execute(updateRequest)).rejects.toThrow(
			ApplicationError,
		);
	});

	it("should throw ApplicationError when title is empty", async () => {
		const project = Project.create({
			title: "Original Project",
			description: "Original description",
			tags: ["original"],
			ownerId: "test-owner-id",
		});
		await mockProjectRepository.save(project);

		const updateRequest: UpdateProjectServiceParams = {
			projectId: project.id,
			ownerId: project.ownerId,
			title: "",
			description: "Updated description",
			tags: ["test"],
		};

		await expect(updateProjectService.execute(updateRequest)).rejects.toThrow(
			ApplicationError,
		);
	});

	it("should update only provided fields", async () => {
		const project = Project.create({
			title: "Original Project",
			description: "Original description",
			tags: ["original"],
			ownerId: "test-owner-id",
		});
		await mockProjectRepository.save(project);

		const updateRequest: UpdateProjectServiceParams = {
			projectId: project.id,
			ownerId: project.ownerId,
			title: "Updated Title Only",
		};

		const result = await updateProjectService.execute(updateRequest);

		expect(result.title).toBe(updateRequest.title);
		expect(result.description).toBe(project.description);
		expect(result.tags).toEqual(project.tags);
	});

	it("should throw ApplicationError when id is empty", async () => {
		const updateRequest: UpdateProjectServiceParams = {
			projectId: "",
			ownerId: "test-owner-id",
			title: "Updated Project",
		};

		await expect(updateProjectService.execute(updateRequest)).rejects.toThrow(
			ApplicationError,
		);
	});

	it("should handle partial updates with undefined values", async () => {
		const project = Project.create({
			title: "Original Project",
			description: "Original description",
			tags: ["original"],
			ownerId: "test-owner-id",
		});
		await mockProjectRepository.save(project);

		const updateRequest: UpdateProjectServiceParams = {
			projectId: project.id,
			ownerId: project.ownerId,
			description: undefined,
		};

		const result = await updateProjectService.execute(updateRequest);

		expect(result.title).toBe(project.title);
		expect(result.description).toBe(project.description);
		expect(result.tags).toEqual(project.tags);
	});

	it("should update all fields when provided", async () => {
		const project = Project.create({
			title: "Original Project",
			description: "Original Description",
			tags: ["original"],
			ownerId: "test-owner-id",
		});
		await mockProjectRepository.save(project);

		jest.advanceTimersByTime(1);

		const updateRequest: UpdateProjectServiceParams = {
			projectId: project.id,
			ownerId: project.ownerId,
			title: "New Title",
			description: "New Description",
			tags: ["new", "tags"],
		};

		const result = await updateProjectService.execute(updateRequest);

		expect(result.title).toBe(updateRequest.title);
		expect(result.description).toBe(updateRequest.description);
		expect(result.tags).toEqual(updateRequest.tags);
		expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
			result.createdAt.getTime(),
		);
	});

	it("should handle repository errors and wrap in ApplicationError", async () => {
		const updateRequest: UpdateProjectServiceParams = {
			projectId: "test-id",
			ownerId: "test-owner-id",
			title: "Updated Project",
		};

		const findByIdSpy = jest.spyOn(mockProjectRepository, "findById");
		findByIdSpy.mockRejectedValue(new Error("Database connection failed"));

		await expect(updateProjectService.execute(updateRequest)).rejects.toThrow(
			ApplicationError,
		);

		findByIdSpy.mockRestore();
	});
});
