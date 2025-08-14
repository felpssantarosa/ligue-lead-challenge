import { inject, injectable } from "tsyringe";
import type { ProjectRepository } from "@/project/infra/repository/ProjectRepository";
import { ApplicationError } from "@/shared/Errors";

export interface GetAllProjectsResponse {
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

export interface GetAllProjectsParams {
	page?: number;
	limit?: number;
	search?: string;
	tags?: string[];
}

@injectable()
export class GetAllProjectsService {
	constructor(
		@inject("ProjectRepository")
		private readonly projectRepository: ProjectRepository,
	) {}

	async execute(
		params: GetAllProjectsParams = {},
	): Promise<GetAllProjectsResponse> {
		try {
			const { page = 1, limit = 10, tags, search } = params;

			if (page < 1 || limit < 1) {
				throw new ApplicationError({
					message: "Invalid pagination parameters",
					trace: "GetAllProjectsService.execute",
				});
			}

			const projects = await this.projectRepository.findAll({
				limit,
				page,
				tags,
				search,
			});

			return {
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
		} catch (error) {
			throw new ApplicationError({
				message: `Failed to retrieve projects: ${error}`,
				trace: "GetAllProjectsService.execute",
			});
		}
	}
}
