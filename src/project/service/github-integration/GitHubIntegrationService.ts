import { inject, injectable } from "tsyringe";
import type { GitHubRepository } from "@/project/domain/ProjectDTO";
import type { ProjectRepository } from "@/project/infra";
import type { GitHubService } from "@/project/integrations/github/GitHubService";
import type { UpdateProjectService } from "@/project/service/update/UpdateProjectService";
import { NotFoundError } from "@/shared/Errors";

export type GitHubIntegrationServiceParams = {
	projectId: string;
	username: string;
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

		await this.updateProjectService.execute({
			projectId: project.id,
			...project.toJSON(),
		});

		return {
			projectId: params.projectId,
			githubRepositories,
		};
	}
}
