import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { GetProjectService } from "@/project/service";
import { BaseController } from "@/shared/BaseController";
import { NotFoundError } from "@/shared/Errors";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";

type ProjectIdInput = {
	id: string;
};

@injectable()
export class GetProjectController extends BaseController {
	constructor(
		@inject("GetProjectService")
		private readonly getProjectService: GetProjectService,
		@inject("Validation")
		private readonly validation: ValidationHandler,
	) {
		super();
	}

	/**
	 * @swagger
	 * /api/projects/{id}:
	 *   get:
	 *     summary: Get a specific project by ID
	 *     description: Retrieve detailed information about a specific project
	 *     tags: [Projects]
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *         description: Project ID
	 *     responses:
	 *       200:
	 *         description: Successfully retrieved project
	 *         content:
	 *           application/json:
	 *             schema:
	 *               allOf:
	 *                 - $ref: '#/components/schemas/ApiResponse'
	 *                 - type: object
	 *                   properties:
	 *                     data:
	 *                       $ref: '#/components/schemas/Project'
	 *       400:
	 *         description: Bad request - Invalid project ID
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
	async handle(req: Request, res: Response): Promise<void> {
		try {
			const validatedParams = this.validation.execute<ProjectIdInput>(
				"project-id",
				req.params,
				"GetProjectController.handle",
			);

			const project = await this.getProjectService.execute({
				id: validatedParams.id,
			});

			if (!project) {
				throw NotFoundError.project(
					validatedParams.id,
					"GetProjectController.handle",
				);
			}

			res.status(200).json({
				success: true,
				data: project,
			});
		} catch (error) {
			this.handleError(error, res, "GetProjectController.handle");
		}
	}
}
