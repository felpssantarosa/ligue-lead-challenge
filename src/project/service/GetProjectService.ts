import { inject, injectable } from "tsyringe";
import type { ProjectRepository } from "@/project/infra";
import type { EntityId } from "@/shared/domain/Entity";
import { NotFoundError } from "@/shared/Errors";

export type GetProjectServiceParams = {
	id: EntityId;
};

export type GetProjectServiceResponse = {
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
} | null;

@injectable()
export class GetProjectService {
	constructor(
		@inject("ProjectRepository")
		private readonly projectRepository: ProjectRepository,
	) {}

	async execute(
		params: GetProjectServiceParams,
	): Promise<GetProjectServiceResponse> {
		const project = await this.projectRepository.findById(params.id);

		if (!project) {
			throw NotFoundError.project(params.id, "GetProjectService.execute");
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
