import type { Response } from "express";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { DeleteTaskService } from "@/task/service";
import type { TaskIdInput } from "@/task/validation";
import type { AuthenticatedRequest } from "@/user/infra/middleware/authMiddleware";

@injectable()
export class DeleteTaskController extends BaseController {
	constructor(
		@inject("DeleteTaskService")
		private readonly deleteTaskService: DeleteTaskService,
		@inject("Validation") private readonly validation: ValidationHandler,
	) {
		super();
	}

	/**
	 * @swagger
	 * /api/tasks/{id}:
	 *   delete:
	 *     summary: Delete a task
	 *     description: Delete an existing task. Requires authentication and task ownership.
	 *     tags: [Tasks]
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *         description: The ID of the task to delete
	 *     responses:
	 *       204:
	 *         description: Task deleted successfully (no content)
	 *       400:
	 *         description: Bad request - Invalid ID format
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
	 *         description: Forbidden - Task ownership required
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *       404:
	 *         description: Task not found
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
			const validatedParams = this.validation.execute<TaskIdInput>(
				"task-id",
				req.params,
				"DeleteTaskController.handle",
			);

			await this.deleteTaskService.execute({
				taskId: validatedParams.id,
				ownerId: req.user.id,
			});

			res.status(204).send();
		} catch (error) {
			this.handleError(error, res, "DeleteTaskController.handle");
		}
	}
}
