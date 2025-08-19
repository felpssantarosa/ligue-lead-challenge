import type { Response } from "express";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { UpdateTaskService } from "@/task/service";
import type { TaskIdInput, UpdateTaskInput } from "@/task/validation";
import type { AuthenticatedRequest } from "@/user/infra/middleware/authMiddleware";

@injectable()
export class UpdateTaskController extends BaseController {
	constructor(
		@inject("UpdateTaskService")
		private readonly updateTaskService: UpdateTaskService,
		@inject("Validation") private readonly validation: ValidationHandler,
	) {
		super();
	}

	/**
	 * @swagger
	 * /api/tasks/{id}:
	 *   put:
	 *     summary: Update a task
	 *     description: Update an existing task. Requires authentication and task ownership.
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
	 *         description: The ID of the task to update
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               title:
	 *                 type: string
	 *                 description: Task title
	 *                 example: "Implement user authentication"
	 *               description:
	 *                 type: string
	 *                 description: Task description
	 *                 example: "Create JWT-based authentication system"
	 *               status:
	 *                 type: string
	 *                 enum: ["todo", "in_progress", "done"]
	 *                 description: Task status
	 *                 example: "in_progress"
	 *     responses:
	 *       200:
	 *         description: Task updated successfully
	 *         content:
	 *           application/json:
	 *             schema:
	 *               allOf:
	 *                 - $ref: '#/components/schemas/ApiResponse'
	 *                 - type: object
	 *                   properties:
	 *                     data:
	 *                       $ref: '#/components/schemas/Task'
	 *       400:
	 *         description: Bad request - Invalid data
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
				"UpdateTaskController.handle",
			);

			const validatedBody = this.validation.execute<UpdateTaskInput>(
				"update-task",
				req.body,
				"UpdateTaskController.handle",
			);

			const task = await this.updateTaskService.execute({
				taskId: validatedParams.id,
				ownerId: req.user.id,
				...validatedBody,
			});

			res.status(200).json({
				success: true,
				data: task,
				message: "Task updated successfully",
			});
		} catch (error) {
			this.handleError(error, res, "UpdateTaskController.handle");
		}
	}
}
