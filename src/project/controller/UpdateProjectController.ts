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
	 * PUT /api/projects/:id
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
