import type { Response } from "express";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { TaskProps } from "@/task/domain";
import type { CreateTaskService } from "@/task/service";
import type { AuthenticatedRequest } from "@/user/infra/middleware/authMiddleware";

@injectable()
export class CreateTaskController extends BaseController {
	constructor(
		@inject("CreateTaskService")
		private readonly createTaskService: CreateTaskService,
		@inject("Validation") private readonly validation: ValidationHandler,
	) {
		super();
	}

	/**
	 * @swagger
	 * /api/projects/{projectId}/tasks:
	 *   post:
	 *     summary: Create a new task for a project
	 *     description: Create a new task within a specific project. Requires authentication.
	 *     tags: [Tasks]
	 *     security:
	 *       - bearerAuth: []
	 *     parameters:
	 *       - in: path
	 *         name: projectId
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *         description: The ID of the project to create the task in
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - title
	 *               - description
	 *               - status
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
	 *                 example: "todo"
	 *     responses:
	 *       201:
	 *         description: Task created successfully
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
	 *       404:
	 *         description: Project not found
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
	async create(req: AuthenticatedRequest, res: Response): Promise<Response> {
		try {
			const { projectId } = req.params;
			const taskData = req.body;

			const validatedProjectData = this.validation.execute<{ id: string }>(
				"project-id",
				{ id: projectId },
				"CreateTaskByProjectIdController.create",
			);

			const validatedTaskParams = this.validation.execute<TaskProps>(
				"create-task",
				taskData,
				"CreateTaskByProjectIdController.create",
			);

			const task = await this.createTaskService.execute({
				...validatedTaskParams,
				projectId: validatedProjectData.id,
				ownerId: req.user.id,
			});

			return res.status(201).json({
				success: true,
				data: task,
				message: "Task created successfully",
			});
		} catch (error) {
			this.handleError(error, res, "CreateTaskController.create");

			return res;
		}
	}
}
