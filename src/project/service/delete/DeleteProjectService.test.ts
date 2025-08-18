import { Project } from "@/project/domain";
import type { DeleteProjectServiceParams } from "@/project/service";
import { ApplicationError } from "@/shared/Errors";
import {
	mockDeleteProjectServiceImplementation as deleteProjectService,
	mockProjectRepository,
} from "@/test/mocks";

describe("DeleteProjectService", () => {
	beforeEach(() => {
		mockProjectRepository.clear();
	});

	afterEach(() => {
		mockProjectRepository.clear();
	});

	it("should delete a project successfully", async () => {
		const project = Project.create({
			title: "Test Project",
			description: "A test project to be deleted",
			tags: ["test"],
		});
		await mockProjectRepository.save(project);

		const deleteRequest: DeleteProjectServiceParams = {
			id: project.id,
		};

		const result = await deleteProjectService.execute(deleteRequest);

		expect(result).toBeDefined();
		expect(result.id).toBe(project.id);
		expect(result.message).toContain("deleted successfully");
		expect(result.deletedAt).toBeInstanceOf(Date);

		const deletedProject = await mockProjectRepository.findById(project.id);
		expect(deletedProject).toBeNull();
	});

	it("should throw ApplicationError when project does not exist", async () => {
		const deleteRequest: DeleteProjectServiceParams = {
			id: "non-existent-id",
		};

		await expect(deleteProjectService.execute(deleteRequest)).rejects.toThrow(
			ApplicationError,
		);
	});

	it("should throw ApplicationError when id is empty", async () => {
		const deleteRequest: DeleteProjectServiceParams = {
			id: "",
		};

		await expect(deleteProjectService.execute(deleteRequest)).rejects.toThrow(
			ApplicationError,
		);
	});

	it("should handle forced deletion", async () => {
		const project = Project.create({
			title: "Test Project",
			description: "A test project to be force deleted",
			tags: ["test"],
		});
		await mockProjectRepository.save(project);

		const deleteRequest: DeleteProjectServiceParams = {
			id: project.id,
			force: true,
		};

		const result = await deleteProjectService.execute(deleteRequest);

		expect(result).toBeDefined();
		expect(result.id).toBe(project.id);
		expect(result.message).toContain("deleted successfully");
		expect(result.deletedAt).toBeInstanceOf(Date);
	});

	it("should handle repository errors and wrap in ApplicationError", async () => {
		const deleteRequest: DeleteProjectServiceParams = {
			id: "test-id",
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
		});

		await mockProjectRepository.save(project);

		const deleteRequest: DeleteProjectServiceParams = {
			id: project.id,
		};

		const result = await deleteProjectService.execute(deleteRequest);

		expect(result).toBeDefined();
		expect(result.id).toBe(project.id);
		expect(result.message).toContain("deleted successfully");
	});
});
