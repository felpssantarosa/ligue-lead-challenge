import { Project } from "@/project/domain/Project";
import type { UpdateProjectServiceParams } from "@/project/service/UpdateProjectService";
import { ApplicationError } from "@/shared/Errors";
import {
	mockProjectRepository,
	mockRepository,
	mockUpdateProjectService,
	updateProjectService,
} from "@/test/mocks/factories/ServiceMock";

describe("UpdateProjectService", () => {
	beforeEach(() => {
		mockProjectRepository.clear();
		jest.useFakeTimers();
	});

	afterEach(() => {
		mockProjectRepository.clear();
		jest.useRealTimers();
	});

	it("should update a project successfully", async () => {
		const project = Project.create({
			title: "Original Project",
			description: "Original description",
			tags: ["original"],
		});
		await mockProjectRepository.save(project);

		const updateRequest: UpdateProjectServiceParams = {
			id: project.id,
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
			id: "non-existent-id",
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
		});
		await mockProjectRepository.save(project);

		const updateRequest: UpdateProjectServiceParams = {
			id: project.id,
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
		});
		await mockProjectRepository.save(project);

		const updateRequest: UpdateProjectServiceParams = {
			id: project.id,
			title: "Updated Title Only",
		};

		const result = await updateProjectService.execute(updateRequest);

		expect(result.title).toBe(updateRequest.title);
		expect(result.description).toBe(project.description);
		expect(result.tags).toEqual(project.tags);
	});

	it("should throw ApplicationError when id is empty", async () => {
		const updateRequest: UpdateProjectServiceParams = {
			id: "",
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
		});
		await mockProjectRepository.save(project);

		const updateRequest: UpdateProjectServiceParams = {
			id: project.id,
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
			description: "Original description",
			tags: ["original"],
		});

		await mockProjectRepository.save(project);

		jest.advanceTimersByTime(1);

		const updateRequest: UpdateProjectServiceParams = {
			id: project.id,
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
			id: "test-id",
			title: "Updated Project",
		};

		mockRepository.findById.mockRejectedValue(
			new Error("Database connection failed"),
		);

		await expect(
			mockUpdateProjectService.execute(updateRequest),
		).rejects.toThrow(ApplicationError);
	});
});
