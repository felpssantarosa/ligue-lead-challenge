import type { Response } from "express";
import { inject, injectable } from "tsyringe";
import type { GitHubIntegrationService } from "@/project/service/github-integration/GitHubIntegrationService";
import type { GitHubIntegrationInput } from "@/project/validation/schemas/ZodSchema";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { AuthenticatedRequest } from "@/user/infra/middleware/authMiddleware";

@injectable()
export class GitHubIntegrationController extends BaseController {
	constructor(
		@inject("GitHubIntegrationService")
		private readonly githubIntegrationService: GitHubIntegrationService,
		@inject("Validation")
		private readonly validation: ValidationHandler,
	) {
		super();
	}

	/**
	 * GET /api/projects/:id/github/:username
	 */
	async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
		try {
			const validatedParams = this.validation.execute<GitHubIntegrationInput>(
				"github-integration",
				req.params,
				"GitHubIntegrationController.handle",
			);

			const result = await this.githubIntegrationService.execute({
				projectId: validatedParams.id,
				username: validatedParams.username,
				userId: req.user.id,
			});

			res.status(200).json({
				success: true,
				data: {
					message: `Successfully linked ${result.githubRepositories.length} GitHub repositories to project`,
					projectId: result.projectId,
					githubRepositories: result.githubRepositories,
				},
			});
		} catch (error) {
			this.handleError(error, res, "GitHubIntegrationController.handle");
		}
	}
}
