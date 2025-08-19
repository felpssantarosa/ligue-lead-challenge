import "reflect-metadata";
import { container } from "tsyringe";
import { CreateProjectService } from "@/project/service/create/CreateProjectService";
import { DeleteProjectService } from "@/project/service/delete/DeleteProjectService";
import { GetProjectService } from "@/project/service/get/GetProjectService";
import { UpdateProjectService } from "@/project/service/update/UpdateProjectService";
import type { CacheProvider } from "@/shared/cache";
import { CacheKeys } from "@/shared/cache";
import {
	cleanupIntegrationContainer,
	setupIntegrationContainer,
} from "@/test/integration/setup/container";
import { RegisterUserService } from "@/user/service/register/RegisterUserService";

describe("Project Service Cache Integration", () => {
	let getProjectService: GetProjectService;
	let createProjectService: CreateProjectService;
	let updateProjectService: UpdateProjectService;
	let deleteProjectService: DeleteProjectService;
	let registerUserService: RegisterUserService;
	let cacheProvider: CacheProvider;
	let testUserId: string;

	beforeEach(async () => {
		await setupIntegrationContainer();

		getProjectService = container.resolve(GetProjectService);
		createProjectService = container.resolve(CreateProjectService);
		updateProjectService = container.resolve(UpdateProjectService);
		deleteProjectService = container.resolve(DeleteProjectService);
		registerUserService = container.resolve(RegisterUserService);
		cacheProvider = container.resolve<CacheProvider>("CacheProvider");

		// Create a test user for all tests
		const testUser = await registerUserService.execute({
			email: "test@cache.com",
			password: "password123",
			name: "Cache Test User",
		});
		testUserId = testUser.id;
	});

	afterEach(() => {
		cleanupIntegrationContainer();
	});

	describe("GetProjectService caching", () => {
		it("should cache project data and serve from cache on subsequent requests", async () => {
			const createParams = {
				title: "Cache Test Project",
				description: "Testing cache functionality",
				tags: ["test", "cache"],
				ownerId: testUserId,
			};

			const createdProject = await createProjectService.execute(createParams);
			const projectId = createdProject.id;

			await cacheProvider.clear();

			const firstResult = await getProjectService.execute({ id: projectId });

			const cacheKey = CacheKeys.project(projectId);
			const cachedData = await cacheProvider.get(cacheKey);
			expect(cachedData).toBeDefined();

			const secondResult = await getProjectService.execute({ id: projectId });

			expect(firstResult).toEqual(secondResult);
			expect(firstResult).toBeDefined();
			if (firstResult) {
				expect(firstResult.id).toBe(projectId);
			}
		});

		it("should invalidate cache when project is updated", async () => {
			const createParams = {
				title: "Update Cache Test",
				description: "Testing cache invalidation on update",
				tags: ["test"],
				ownerId: testUserId,
			};

			const createdProject = await createProjectService.execute(createParams);
			const projectId = createdProject.id;

			await getProjectService.execute({ id: projectId });

			const cacheKey = CacheKeys.project(projectId);
			let cachedData = await cacheProvider.get(cacheKey);
			expect(cachedData).toBeDefined();

			// Update the project
			await updateProjectService.execute({
				projectId,
				ownerId: testUserId,
				title: "Updated Title",
			});
			cachedData = await cacheProvider.get(cacheKey);
			expect(cachedData).toBeNull();
		});

		it("should invalidate cache when project is deleted", async () => {
			const createParams = {
				title: "Delete Cache Test",
				description: "Testing cache invalidation on delete",
				tags: ["test"],
				ownerId: testUserId,
			};

			const createdProject = await createProjectService.execute(createParams);
			const projectId = createdProject.id;

			await getProjectService.execute({ id: projectId });

			const cacheKey = CacheKeys.project(projectId);
			let cachedData = await cacheProvider.get(cacheKey);
			expect(cachedData).toBeDefined();

			await deleteProjectService.execute({ projectId, ownerId: testUserId });

			cachedData = await cacheProvider.get(cacheKey);
			expect(cachedData).toBeNull();
		});
	});

	describe("Cache TTL", () => {
		it("should respect cache TTL of 10 minutes", async () => {
			const createParams = {
				title: "TTL Test Project",
				description: "Testing TTL functionality",
				tags: ["ttl"],
				ownerId: testUserId,
			};

			const createdProject = await createProjectService.execute(createParams);
			const projectId = createdProject.id;

			await getProjectService.execute({ id: projectId });

			const cacheKey = CacheKeys.project(projectId);
			const ttl = await cacheProvider.getTtl(cacheKey);

			expect(ttl).toBeGreaterThan(590);
			expect(ttl).toBeLessThanOrEqual(600);
		});
	});
});
