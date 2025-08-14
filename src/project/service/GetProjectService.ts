import { inject, injectable } from "tsyringe";
import type { ProjectRepository } from "@/project/infra/repository/ProjectRepository";
import type { EntityId } from "@/shared/domain/Entity";
import { NotFoundError } from "@/shared/Errors";

export interface GetProjectResponse {
	id: string;
	title: string;
	description: string;
	tags: string[];
	githubRepositories?: Array<{
		name: string;
		url: string;
		description: string | null;
		language: string | null;
		starCount: number;
		forkCount: number;
	}>;
	createdAt: Date;
	updatedAt: Date;
}

@injectable()
export class GetProjectService {
	constructor(
		@inject("ProjectRepository")
		private readonly projectRepository: ProjectRepository,
	) {}

	async execute(id: EntityId): Promise<GetProjectResponse | null> {
		const project = await this.projectRepository.findById(id);

		if (!project) {
			throw NotFoundError.project(id, "GetProjectService.execute");
		}

		return {
			id: project.id,
			title: project.title,
			description: project.description,
			tags: project.tags,
			createdAt: project.createdAt,
			updatedAt: project.updatedAt,
		};
	}
}
