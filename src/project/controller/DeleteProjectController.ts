import type { Response } from "express";
import { inject, injectable } from "tsyringe";
import type { DeleteProjectService } from "@/project/service";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { AuthenticatedRequest } from "@/user/infra/middleware/authMiddleware";

type ProjectIdInput = {
	id: string;
};

type DeleteQueryInput = {
	force: boolean;
};

@injectable()
export class DeleteProjectController extends BaseController {
	constructor(
		@inject("DeleteProjectService")
		private readonly deleteProjectService: DeleteProjectService,
		@inject("Validation")
		private readonly validation: ValidationHandler,
	) {
		super();
	}

	/**
	 * @swagger
	 * /api/projects/{id}:
	 *   delete:
	 *     summary: Delete a project
	 *     description: Delete an existing project and optionally all its associated tasks. Requires authentication and project ownership.
	 *     tags: [Projects]
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *         description: The ID of the project to delete
	 *       - in: query
	 *         name: force
	 *         schema:
	 *           type: boolean
	 *           default: false
	 *         description: Force deletion including all associated tasks
	 *     responses:
	 *       204:
	 *         description: Project deleted successfully (no content)
	 *       400:
	 *         description: Bad request - Invalid ID format or deletion constraints
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
	 *         description: Project not found
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *       409:
	 *         description: Conflict - Cannot delete project with existing tasks (use force=true)
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *       500:
	 *         description: Internal server error
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 */
	async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
		try {
			const validatedParams = this.validation.execute<ProjectIdInput>(
				"project-id",
				req.params,
				"DeleteProjectController.handle",
			);

			const validatedQuery = this.validation.execute<DeleteQueryInput>(
				"delete-query",
				req.query,
				"DeleteProjectController.handle",
			);

			const deleteRequest = {
				projectId: validatedParams.id,
				ownerId: req.user.id,
				force: validatedQuery.force,
			};

			await this.deleteProjectService.execute(deleteRequest);

			res.status(204).send();
		} catch (error) {
			this.handleError(error, res, "DeleteProjectController.handle");
		}
	}
}
