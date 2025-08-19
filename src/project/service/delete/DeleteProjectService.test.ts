import { Project } from "@/project/domain";
import type { DeleteProjectServiceParams } from "@/project/service";
import { ApplicationError, NotFoundError } from "@/shared/Errors";
import {
	mockDeleteProjectServiceImplementation as deleteProjectService,
	mockCheckProjectOwnershipService,
	mockProjectRepository,
	mockUserService,
} from "@/test/mocks";
import { createUser } from "@/test/mocks/factories/UserMock";

describe("DeleteProjectService", () => {
	beforeEach(() => {
		mockProjectRepository.clear();

		const testUser = createUser({ id: "test-owner-id" });
		(mockUserService.findById as jest.Mock).mockResolvedValue(testUser);

		(mockCheckProjectOwnershipService.execute as jest.Mock).mockResolvedValue(
			true,
		);
	});

	afterEach(() => {
		mockProjectRepository.clear();
		jest.clearAllMocks();
	});

	it("should delete a project successfully", async () => {
		const project = Project.create({
			title: "Test Project",
			description: "A test project to be deleted",
			tags: ["test"],
			githubRepositories: [],
			ownerId: "test-owner-id",
		});
		await mockProjectRepository.save(project);

		const deleteRequest: DeleteProjectServiceParams = {
			projectId: project.id,
			ownerId: "test-owner-id",
		};

		const result = await deleteProjectService.execute(deleteRequest);

		expect(result).toBeDefined();
		expect(result.projectId).toBe(project.id);
		expect(result.message).toContain("deleted successfully");
		expect(result.deletedAt).toBeInstanceOf(Date);

		const deletedProject = await mockProjectRepository.findById(project.id);
		expect(deletedProject).toBeNull();
	});

	it("should throw NotFoundError when project does not exist", async () => {
		const deleteRequest: DeleteProjectServiceParams = {
			projectId: "non-existent-id",
			ownerId: "test-owner-id",
		};

		await expect(deleteProjectService.execute(deleteRequest)).rejects.toThrow(
			NotFoundError,
		);
	});

	it("should throw NotFoundError when id is empty", async () => {
		const deleteRequest: DeleteProjectServiceParams = {
			projectId: "",
			ownerId: "test-owner-id",
		};

		await expect(deleteProjectService.execute(deleteRequest)).rejects.toThrow(
			NotFoundError,
		);
	});

	it("should handle forced deletion", async () => {
		const project = Project.create({
			title: "Test Project",
			description: "A test project to be force deleted",
			tags: ["test"],
			githubRepositories: [],
			ownerId: "test-owner-id",
		});
		await mockProjectRepository.save(project);

		const deleteRequest: DeleteProjectServiceParams = {
			projectId: project.id,
			ownerId: "test-owner-id",
			force: true,
		};

		const result = await deleteProjectService.execute(deleteRequest);

		expect(result).toBeDefined();
		expect(result.projectId).toBe(project.id);
		expect(result.message).toContain("deleted successfully");
		expect(result.deletedAt).toBeInstanceOf(Date);
	});

	it("should handle repository errors and wrap in ApplicationError", async () => {
		const deleteRequest: DeleteProjectServiceParams = {
			projectId: "test-id",
			ownerId: "test-owner-id",
		};

		const findByIdSpy = jest.spyOn(mockProjectRepository, "findById");
		findByIdSpy.mockRejectedValue(new Error("Database connection failed"));

		await expect(deleteProjectService.execute(deleteRequest)).rejects.toThrow(
			ApplicationError,
		);

		findByIdSpy.mockRestore();
	});

	it("should handle default force parameter", async () => {
		const project = Project.create({
			title: "Test Project",
			description: "A test project to be deleted",
			tags: ["test"],
			githubRepositories: [],
			ownerId: "test-owner-id",
		});

		await mockProjectRepository.save(project);

		const deleteRequest: DeleteProjectServiceParams = {
			projectId: project.id,
			ownerId: "test-owner-id",
		};

		const result = await deleteProjectService.execute(deleteRequest);

		expect(result).toBeDefined();
		expect(result.projectId).toBe(project.id);
		expect(result.message).toContain("deleted successfully");
	});
});
