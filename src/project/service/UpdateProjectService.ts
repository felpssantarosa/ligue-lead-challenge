import { inject, injectable } from "tsyringe";
import type { UpdateProjectParams } from "@/project/domain";
import type { ProjectRepository } from "@/project/infra";
import type { CacheProvider } from "@/shared/cache";
import { CacheKeys } from "@/shared/cache";
import type { EntityId } from "@/shared/domain/Entity";
import { ApplicationError, NotFoundError } from "@/shared/Errors";

export interface UpdateProjectServiceParams extends UpdateProjectParams {
	id: EntityId;
}

export interface UpdateProjectServiceResponse {
	id: string;
	title: string;
	description: string;
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
}

@injectable()
export class UpdateProjectService {
	constructor(
		@inject("ProjectRepository")
		private readonly projectRepository: ProjectRepository,
		@inject("CacheProvider")
		private readonly cacheProvider: CacheProvider,
	) {}

	async execute(
		request: UpdateProjectServiceParams,
	): Promise<UpdateProjectServiceResponse> {
		try {
			const existingProject = await this.projectRepository.findById(request.id);

			if (!existingProject) {
				throw NotFoundError.project(request.id, "UpdateProjectService.execute");
			}

			existingProject.update(request);

			const updatedProject =
				await this.projectRepository.update(existingProject);

			const projectCacheKey = CacheKeys.project(request.id);
			await this.cacheProvider.delete(projectCacheKey);
			await this.cacheProvider.deleteByPattern(CacheKeys.allProjectsLists());
			await this.cacheProvider.deleteByPattern(CacheKeys.allTasksByProject());

			return {
				id: updatedProject.id,
				title: updatedProject.title,
				description: updatedProject.description,
				tags: updatedProject.tags,
				createdAt: updatedProject.createdAt,
				updatedAt: updatedProject.updatedAt,
			};
		} catch (error) {
			throw new ApplicationError({
				message: `Failed to update project with id ${request.id}: ${error}`,
				trace: "UpdateProjectService.execute",
			});
		}
	}
}
