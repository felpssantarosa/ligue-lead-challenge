import { inject, injectable } from "tsyringe";
import type { UpdateProjectParams } from "@/project/domain/ProjectDTO";
import type { ProjectRepository } from "@/project/infra/repository/ProjectRepository";
import type { EntityId } from "@/shared/domain/Entity";
import { ApplicationError, NotFoundError } from "@/shared/Errors";

export interface UpdateProjectRequest extends UpdateProjectParams {
	id: EntityId;
}

export interface UpdateProjectResponse {
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
	) {}

	async execute(request: UpdateProjectRequest): Promise<UpdateProjectResponse> {
		try {
			const existingProject = await this.projectRepository.findById(request.id);

			if (!existingProject) {
				throw NotFoundError.project(request.id, "UpdateProjectService.execute");
			}

			existingProject.update(request);

			const updatedProject =
				await this.projectRepository.update(existingProject);

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
