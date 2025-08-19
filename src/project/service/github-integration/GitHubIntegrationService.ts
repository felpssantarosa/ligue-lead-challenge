import { inject, injectable } from "tsyringe";
import type { GitHubRepository } from "@/project/domain/ProjectDTO";
import type { ProjectRepository } from "@/project/infra";
import type { GitHubService } from "@/project/integrations/github/GitHubService";
import type { UpdateProjectService } from "@/project/service/update/UpdateProjectService";
import type { CheckProjectOwnershipService } from "@/project/service/check-ownership/CheckProjectOwnershipService";
import { NotFoundError, UnauthorizedError } from "@/shared/Errors";

export type GitHubIntegrationServiceParams = {
	projectId: string;
	username: string;
	userId: string;
};

export type GitHubIntegrationServiceResponse = {
	projectId: string;
	githubRepositories: GitHubRepository[];
};

@injectable()
export class GitHubIntegrationService {
	constructor(
		@inject("ProjectRepository")
		private readonly projectRepository: ProjectRepository,
		@inject("UpdateProjectService")
		private readonly updateProjectService: UpdateProjectService,
		@inject("GitHubService")
		private readonly githubService: GitHubService,
		@inject("CheckProjectOwnershipService")
		private readonly checkProjectOwnershipService: CheckProjectOwnershipService,
	) {}

	async execute(
		params: GitHubIntegrationServiceParams,
	): Promise<GitHubIntegrationServiceResponse> {
		const project = await this.projectRepository.findById(params.projectId);

		if (!project) {
			throw NotFoundError.project(
				params.projectId,
				"GitHubIntegrationService.execute",
			);
		}

		// Check if the user is the owner of the project
		const hasOwnership = await this.checkProjectOwnershipService.execute({
			projectId: params.projectId,
			ownerId: params.userId,
		});

		if (!hasOwnership) {
			throw UnauthorizedError.insufficientPermissions(
				"integrate GitHub repositories with",
				"Project",
				params.userId,
				"GitHubIntegrationService.execute",
			);
		}

		const githubRepos = await this.githubService.getUserRepositories(
			params.username,
		);

		const githubRepositories: GitHubRepository[] = githubRepos.map((repo) => ({
			name: repo.name,
			url: repo.url,
			description: repo.description,
			language: repo.language,
			starCount: repo.starCount,
			forkCount: repo.forkCount,
			createdAt: new Date(),
		}));

		project.updateGitHubRepositories(githubRepositories);

		const projectData = project.toJSON();
		await this.updateProjectService.execute({
			projectId: project.id,
			ownerId: params.userId,
			title: projectData.title,
			description: projectData.description,
			tags: projectData.tags,
			githubRepositories: projectData.githubRepositories,
		});

		return {
			projectId: params.projectId,
			githubRepositories,
		};
	}
}
