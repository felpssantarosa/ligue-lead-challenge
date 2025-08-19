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
	 * @swagger
	 * /api/projects/{id}/github/{username}:
	 *   get:
	 *     summary: Integrate GitHub repositories with a project
	 *     description: Link GitHub repositories from a specific user to an existing project. Requires authentication and project ownership.
	 *     tags: [Projects, GitHub Integration]
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *         description: The ID of the project to integrate with GitHub
	 *       - in: path
	 *         name: username
	 *         required: true
	 *         schema:
	 *           type: string
	 *         description: GitHub username to fetch repositories from
	 *         example: "octocat"
	 *     responses:
	 *       200:
	 *         description: GitHub integration completed successfully
	 *         content:
	 *           application/json:
	 *             schema:
	 *               allOf:
	 *                 - $ref: '#/components/schemas/ApiResponse'
	 *                 - type: object
	 *                   properties:
	 *                     data:
	 *                       type: object
	 *                       properties:
	 *                         message:
	 *                           type: string
	 *                           description: Success message
	 *                           example: "Successfully linked 5 GitHub repositories to project"
	 *                         project:
	 *                           $ref: '#/components/schemas/Project'
	 *                         githubRepositories:
	 *                           type: array
	 *                           items:
	 *                             type: object
	 *                             properties:
	 *                               name:
	 *                                 type: string
	 *                                 description: Repository name
	 *                               url:
	 *                                 type: string
	 *                                 format: uri
	 *                                 description: Repository URL
	 *                               description:
	 *                                 type: string
	 *                                 description: Repository description
	 *       400:
	 *         description: Bad request - Invalid parameters
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *       401:
	 *         description: Unauthorized - Authentication required
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *       403:
	 *         description: Forbidden - Project ownership required
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *       404:
	 *         description: Project or GitHub user not found
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *       500:
	 *         description: Internal server error or GitHub API error
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
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
