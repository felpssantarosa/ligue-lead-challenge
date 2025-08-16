import { Project } from "@/project/domain/Project";
import type { GetAllProjectsServiceParams } from "@/project/service/GetAllProjectsService";
import { ApplicationError } from "@/shared/Errors";
import {
	mockGetAllProjectsServiceImplementation as getAllProjectsService,
	mockProjectRepository,
} from "@/test/mocks";

describe("GetAllProjectsService", () => {
	beforeEach(() => {
		mockProjectRepository.clear();
	});

	afterEach(() => {
		mockProjectRepository.clear();
	});

	it("should get all projects successfully", async () => {
		const project1 = Project.create({
			title: "Project 1",
			description: "First project",
			tags: ["tag1"],
		});
		const project2 = Project.create({
			title: "Project 2",
			description: "Second project",
			tags: ["tag2"],
		});

		await mockProjectRepository.save(project1);
		await mockProjectRepository.save(project2);

		const result = await getAllProjectsService.execute({});

		expect(result).toBeDefined();
		expect(result.projects).toHaveLength(2);
		expect(result.total).toBe(2);
		expect(result.projects[0].title).toBe("Project 1");
		expect(result.projects[1].title).toBe("Project 2");
	});

	it("should return empty array when no projects exist", async () => {
		const result = await getAllProjectsService.execute({});

		expect(result).toBeDefined();
		expect(result.projects).toHaveLength(0);
		expect(result.total).toBe(0);
	});

	it("should handle pagination parameters", async () => {
		const projects = [];
		const limitExpected = 3;

		for (let i = 1; i <= 5; i++) {
			const project = Project.create({
				title: `Project ${i}`,
				description: `Description ${i}`,
				tags: [`tag${i}`],
			});
			projects.push(project);
			await mockProjectRepository.save(project);
		}

		const params: GetAllProjectsServiceParams = {
			page: 1,
			limit: limitExpected,
		};

		const result = await getAllProjectsService.execute(params);

		expect(result).toBeDefined();
		expect(result.total).toBe(limitExpected);
	});

	it("should handle search parameters", async () => {
		const project1 = Project.create({
			title: "TypeScript Project",
			description: "A project using TypeScript",
			tags: ["typescript", "web"],
		});
		const project2 = Project.create({
			title: "Python Project",
			description: "A project using Python",
			tags: ["python", "data"],
		});

		await mockProjectRepository.save(project1);
		await mockProjectRepository.save(project2);

		const params: GetAllProjectsServiceParams = {
			search: "TypeScript",
		};

		const result = await getAllProjectsService.execute(params);

		expect(result).toBeDefined();
		expect(result.projects).toHaveLength(1);
		expect(result.projects[0].title).toBe("TypeScript Project");
	});

	it("should filter by tags", async () => {
		const project1 = Project.create({
			title: "Web Project",
			description: "A web development project",
			tags: ["web", "frontend"],
		});

		const project2 = Project.create({
			title: "Backend Project",
			description: "A backend development project",
			tags: ["backend", "api"],
		});

		const project3 = Project.create({
			title: "Full Stack Project",
			description: "A full stack project",
			tags: ["web", "backend"],
		});

		await mockProjectRepository.save(project1);
		await mockProjectRepository.save(project2);
		await mockProjectRepository.save(project3);

		const params: GetAllProjectsServiceParams = {
			tags: ["web"],
		};

		const result = await getAllProjectsService.execute(params);

		expect(result).toBeDefined();
		expect(result.projects).toHaveLength(2);
		expect(result.total).toBe(2);
		expect(result.projects[0].title).toBe("Web Project");
		expect(result.projects[1].title).toBe("Full Stack Project");
	});

	it("should handle invalid pagination parameters", async () => {
		const project = Project.create({
			title: "Test Project",
			description: "A test project",
			tags: ["test"],
		});

		await mockProjectRepository.save(project);

		const params: GetAllProjectsServiceParams = {
			page: -1,
			limit: 0,
		};

		await expect(getAllProjectsService.execute(params)).rejects.toThrow(
			ApplicationError,
		);
	});

	it("should handle repository errors and throw ApplicationError", async () => {
		const findAllSpy = jest.spyOn(mockProjectRepository, "findAll");
		findAllSpy.mockRejectedValue(new Error("Database connection failed"));

		const params: GetAllProjectsServiceParams = {
			page: 1,
			limit: 10,
		};

		await expect(getAllProjectsService.execute(params)).rejects.toThrow(
			ApplicationError,
		);

		findAllSpy.mockRestore();
	});

	it("should handle default parameters when not provided", async () => {
		const project = Project.create({
			title: "Test Project",
			description: "A test project",
			tags: ["test"],
		});
		await mockProjectRepository.save(project);

		const result = await getAllProjectsService.execute({});

		expect(result).toBeDefined();
		expect(result.projects).toHaveLength(1);
		expect(result.total).toBe(1);
	});
});
