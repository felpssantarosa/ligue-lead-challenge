import { inject, injectable } from "tsyringe";
import type { GitHubRepository, UpdateProjectParams } from "@/project/domain";
import type { ProjectRepository } from "@/project/infra";
import type { CheckProjectOwnershipService } from "@/project/service/check-ownership/CheckProjectOwnershipService";
import type { CacheProvider } from "@/shared/cache";
import { CacheKeys } from "@/shared/cache";
import type { EntityId } from "@/shared/domain/Entity";
import {
	ApplicationError,
	NotFoundError,
	UnauthorizedError,
} from "@/shared/Errors";
import type { UserService } from "@/user/service/UserService";

export interface UpdateProjectServiceParams extends UpdateProjectParams {
	projectId: EntityId;
	ownerId: EntityId;
}

export interface UpdateProjectServiceResponse {
	id: string;
	title: string;
	description: string;
	tags: string[];
	githubRepositories: GitHubRepository[];
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
		@inject("CheckProjectOwnershipService")
		private readonly checkProjectOwnershipService: CheckProjectOwnershipService,
		@inject("UserService")
		private readonly userService: UserService,
	) {}

	async execute(
		params: UpdateProjectServiceParams,
	): Promise<UpdateProjectServiceResponse> {
		try {
			const existingProject = await this.projectRepository.findById(
				params.projectId,
			);

			if (!existingProject) {
				throw NotFoundError.project(
					params.projectId,
					"UpdateProjectService.execute",
				);
			}

			const existingUser = await this.userService.findById({
				userId: params.ownerId,
			});

			if (!existingUser) {
				throw NotFoundError.user(
					params.ownerId,
					"UpdateProjectService.execute",
				);
			}

			const hasOwnership = await this.checkProjectOwnershipService.execute({
				projectId: existingProject.id,
				ownerId: existingUser.id,
			});

			if (!hasOwnership) {
				throw UnauthorizedError.insufficientPermissions(
					"update",
					"Project",
					existingUser.id,
					"UpdateProjectService.execute",
				);
			}

			existingProject.update(params);

			const updatedProject =
				await this.projectRepository.update(existingProject);
			const projectCacheKey = CacheKeys.project(params.projectId);
			await this.cacheProvider.delete(projectCacheKey);
			await this.cacheProvider.deleteByPattern(CacheKeys.allProjectsLists());
			await this.cacheProvider.deleteByPattern(CacheKeys.allTasksByProject());

			return {
				id: updatedProject.id,
				title: updatedProject.title,
				description: updatedProject.description,
				tags: updatedProject.tags,
				githubRepositories: updatedProject.githubRepositories,
				createdAt: updatedProject.createdAt,
				updatedAt: updatedProject.updatedAt,
			};
		} catch (error) {
			if (error instanceof UnauthorizedError || error instanceof NotFoundError)
				throw error;

			throw new ApplicationError({
				message: `Failed to update project with id ${params.projectId}: ${error}`,
				trace: "UpdateProjectService.execute",
			});
		}
	}
}
