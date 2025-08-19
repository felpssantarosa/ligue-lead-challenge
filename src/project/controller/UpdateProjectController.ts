import type { Response } from "express";
import { inject, injectable } from "tsyringe";
import type { UpdateProjectService } from "@/project/service";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { AuthenticatedRequest } from "@/user/infra/middleware/authMiddleware";

type ProjectIdInput = {
	id: string;
};

type UpdateProjectInput = {
	title?: string | undefined;
	description?: string | undefined;
	tags?: string[] | undefined;
};

@injectable()
export class UpdateProjectController extends BaseController {
	constructor(
		@inject("UpdateProjectService")
		private readonly updateProjectService: UpdateProjectService,
		@inject("Validation")
		private readonly validation: ValidationHandler,
	) {
		super();
	}

	/**
	 * @swagger
	 * /api/projects/{id}:
	 *   put:
	 *     summary: Update an existing project
	 *     description: Update project details. Requires authentication and ownership.
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
	 *         description: Project ID
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               title:
	 *                 type: string
	 *                 description: Project title
	 *                 example: "Updated E-commerce Platform"
	 *               description:
	 *                 type: string
	 *                 description: Project description
	 *                 example: "An improved e-commerce platform with new features"
	 *               tags:
	 *                 type: array
	 *                 items:
	 *                   type: string
	 *                 description: Project tags
	 *                 example: ["react", "nodejs", "ecommerce", "typescript"]
	 *     responses:
	 *       200:
	 *         description: Project updated successfully
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
	async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
		try {
			const validatedParams = this.validation.execute<ProjectIdInput>(
				"project-id",
				req.params,
				"UpdateProjectController.handle",
			);

			const validatedBody = this.validation.execute<UpdateProjectInput>(
				"update-project",
				req.body,
				"UpdateProjectController.handle",
			);

			const updateRequest = {
				projectId: validatedParams.id,
				ownerId: req.user.id,
				...(validatedBody.title !== undefined && {
					title: validatedBody.title,
				}),
				...(validatedBody.description !== undefined && {
					description: validatedBody.description,
				}),
				...(validatedBody.tags !== undefined && { tags: validatedBody.tags }),
			};

			const updatedProject =
				await this.updateProjectService.execute(updateRequest);

			res.status(200).json({
				success: true,
				data: updatedProject,
				message: "Project updated successfully",
			});
		} catch (error) {
			this.handleError(error, res, "UpdateProjectController.handle");
		}
	}
}
