import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { GetTaskService } from "@/task/service/get/GetTaskService";
import type { GetTaskInput } from "@/task/validation";

@injectable()
export class GetTaskController extends BaseController {
	constructor(
		@inject("GetTaskService") private readonly getTaskService: GetTaskService,
		@inject("Validation") private readonly validation: ValidationHandler,
	) {
		super();
	}

	/**
	 * @swagger
	 * /api/tasks/{id}:
	 *   get:
	 *     summary: Get a task by ID
	 *     description: Retrieve a specific task by its ID
	 *     tags: [Tasks]
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *         description: The ID of the task to retrieve
	 *     responses:
	 *       200:
	 *         description: Task retrieved successfully
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
	 *         description: Bad request - Invalid ID format
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
	public async handle(req: Request, res: Response): Promise<void> {
		try {
			const validatedParams = this.validation.execute<GetTaskInput>(
				"get-task",
				req.params,
				"GetTaskController.handle",
			);

			const task = await this.getTaskService.execute({
				id: validatedParams.id,
			});

			res.status(200).json({
				success: true,
				data: task,
			});
		} catch (error) {
			this.handleError(error, res, "GetTaskController.handle");
		}
	}
}
