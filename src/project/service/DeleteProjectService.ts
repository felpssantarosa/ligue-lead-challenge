import { inject, injectable } from "tsyringe";
import type { ProjectRepository } from "@/project/infra/repository/ProjectRepository";
import type { EntityId } from "@/shared/domain/Entity";
import { ApplicationError, NotFoundError } from "@/shared/Errors";

export interface DeleteProjectServiceParams {
	id: EntityId;
	force?: boolean;
}

export interface DeleteProjectServiceResponse {
	id: string;
	message: string;
	deletedAt: Date;
}

@injectable()
export class DeleteProjectService {
	constructor(
		@inject("ProjectRepository")
		private readonly projectRepository: ProjectRepository,
		// TODO: Inject TaskRepository when available to check for dependencies
	) {}

	async execute(
		request: DeleteProjectServiceParams,
	): Promise<DeleteProjectServiceResponse> {
		try {
			const existingProject = await this.projectRepository.findById(request.id);

			if (!existingProject) {
				throw NotFoundError.project(request.id, "DeleteProjectService.execute");
			}

			await this.projectRepository.delete(request.id);

			return {
				id: request.id,
				message: "Project deleted successfully",
				deletedAt: new Date(),
			};
		} catch (error) {
			throw new ApplicationError({
				message: `Failed to delete project with id ${request.id}: ${error}`,
				trace: "DeleteProjectService.execute",
			});
		}
	}
}
