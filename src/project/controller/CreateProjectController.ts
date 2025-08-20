import type { Response } from "express";
import { inject, injectable } from "tsyringe";
import type { CreateProjectService } from "@/project/service";
import type { CreateProjectInput } from "@/project/validation/schemas/ZodSchema";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { AuthenticatedRequest } from "@/user/infra/middleware/authMiddleware";

@injectable()
export class CreateProjectController extends BaseController {
	constructor(
		@inject("CreateProjectService")
		private readonly createProjectService: CreateProjectService,
		@inject("Validation")
		private readonly validation: ValidationHandler,
	) {
		super();
	}

	/**
	 * @swagger
	 * /api/projects:
	 *   post:
	 *     summary: Create a new project
	 *     description: Create a new project with the provided data. Requires authentication.
	 *     tags: [Projects]
	 *     security:
	 *       - bearerAuth: []
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - title
	 *             properties:
	 *               title:
	 *                 type: string
	 *                 description: Project title
	 *                 example: "E-commerce Platform"
	 *               description:
	 *                 type: string
	 *                 description: Project description
	 *                 example: "A modern e-commerce platform built with React and Node.js"
	 *               tags:
	 *                 type: array
	 *                 items:
	 *                   type: string
	 *                 description: Project tags (optional, defaults to empty array)
	 *                 example: ["react", "nodejs", "ecommerce"]
	 *     responses:
	 *       201:
	 *         description: Project created successfully
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
	 *       500:
	 *         description: Internal server error
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 */
	async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
		try {
			const validatedData = this.validation.execute<CreateProjectInput>(
				"create-project",
				req.body,
				"CreateProjectController.handle",
			);

			const project = await this.createProjectService.execute({
				title: validatedData.title,
				description: validatedData.description,
				tags: validatedData.tags,
				ownerId: req.user.id,
			});

			res.status(201).json({
				success: true,
				data: project,
				message: "Project created successfully",
			});
		} catch (error) {
			this.handleError(error, res, "CreateProjectController.handle");
		}
	}
}
