import { inject, injectable } from "tsyringe";
import type { ProjectRepository } from "@/project/infra";
import type { CacheProvider } from "@/shared/cache";
import { CacheKeys } from "@/shared/cache";
import { ApplicationError } from "@/shared/Errors";

export interface GetAllProjectsServiceParams {
	page?: number;
	limit?: number;
	search?: string;
	tags?: string[];
}

export interface GetAllProjectsServiceResponse {
	projects: Array<{
		id: string;
		title: string;
		description: string;
		tags: string[];
		createdAt: Date;
		updatedAt: Date;
	}>;
	total: number;
}

@injectable()
export class GetAllProjectsService {
	constructor(
		@inject("ProjectRepository")
		private readonly projectRepository: ProjectRepository,
		@inject("CacheProvider")
		private readonly cacheProvider: CacheProvider,
	) {}

	async execute(
		params: GetAllProjectsServiceParams,
	): Promise<GetAllProjectsServiceResponse> {
		try {
			const { page = 1, limit = 10, tags, search } = params;

			if (page < 1 || limit < 1) {
				throw new ApplicationError({
					message: "Invalid pagination parameters",
					trace: "GetAllProjectsService.execute",
				});
			}

			const filters = { tags, search };

			const cacheKey = CacheKeys.projectsList({ page, limit, filters });

			const cachedResult =
				await this.cacheProvider.get<GetAllProjectsServiceResponse>(cacheKey);

			if (cachedResult) return cachedResult;

			const projects = await this.projectRepository.findAll({
				limit,
				page,
				tags,
				search,
			});

			const result = {
				projects: projects.map((project) => ({
					id: project.id,
					title: project.title,
					description: project.description,
					tags: project.tags,
					createdAt: project.createdAt,
					updatedAt: project.updatedAt,
				})),
				total: projects.length,
			};

			const TenMinutesInSeconds = 600;

			await this.cacheProvider.set(cacheKey, result, TenMinutesInSeconds);

			return result;
		} catch (error) {
			throw new ApplicationError({
				message: `Failed to retrieve projects: ${error}`,
				trace: "GetAllProjectsService.execute",
			});
		}
	}
}
