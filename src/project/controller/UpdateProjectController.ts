import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { UpdateProjectService } from "@/project/service/UpdateProjectService";
import {
	type ProjectIdInput,
	projectIdSchema,
	type UpdateProjectInput,
	updateProjectSchema,
} from "@/project/validation/ZodSchemas";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import { BaseController } from "../../shared/BaseController";

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
	 * Update a project
	 * PUT /api/projects/:id
	 */
	async handle(req: Request, res: Response): Promise<void> {
		try {
			const validatedParams = this.validation.execute<ProjectIdInput>(
				projectIdSchema,
				req.params,
				"UpdateProjectController.handle",
			);

			const validatedBody = this.validation.execute<UpdateProjectInput>(
				updateProjectSchema,
				req.body,
				"UpdateProjectController.handle",
			);

			const updateRequest = {
				id: validatedParams.id,
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
