import { Project } from "@/project/domain";
import { NotFoundError } from "@/shared/Errors";
import {
	mockGetProjectServiceImplementation as getProjectService,
	mockProjectRepository,
} from "@/test/mocks";

describe("GetProjectService", () => {
	beforeEach(() => {
		mockProjectRepository.clear();
	});

	afterEach(() => {
		mockProjectRepository.clear();
	});

	it("should get a project by id successfully", async () => {
		const project = Project.create({
			title: "Test Project",
			description: "A test project description",
			tags: ["test", "typescript"],
			ownerId: "test-owner-id",
			githubRepositories: [],
		});
		await mockProjectRepository.save(project);

		const result = await getProjectService.execute({ id: project.id });

		expect(result).toBeDefined();
		expect(result?.id).toBe(project.id);
		expect(result?.title).toBe(project.title);
		expect(result?.description).toBe(project.description);
		expect(result?.tags).toEqual(project.tags);
	});

	it("should throw NotFoundError when project does not exist", async () => {
		const nonExistentId = "non-existent-id";

		await expect(
			getProjectService.execute({ id: nonExistentId }),
		).rejects.toThrow(NotFoundError);
	});

	it("should throw NotFoundError when id is empty", async () => {
		const emptyId = "";

		await expect(getProjectService.execute({ id: emptyId })).rejects.toThrow(
			NotFoundError,
		);
	});

	it("should handle repository errors", async () => {
		const testId = "test-id";

		const findByIdSpy = jest.spyOn(mockProjectRepository, "findById");
		findByIdSpy.mockRejectedValue(new Error("Database connection error"));

		await expect(getProjectService.execute({ id: testId })).rejects.toThrow(
			"Database connection error",
		);

		findByIdSpy.mockRestore();
	});
});
