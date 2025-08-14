import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { DeleteProjectService } from "@/project/service/DeleteProjectService";
import {
	type DeleteQueryInput,
	deleteQuerySchema,
	type ProjectIdInput,
	projectIdSchema,
} from "@/project/validation/ZodSchemas";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import { BaseController } from "../../shared/BaseController";

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
	 * Delete a project
	 *
	 * DELETE /api/projects/:id?force=true
	 */
	async handle(req: Request, res: Response): Promise<void> {
		try {
			const validatedParams = this.validation.execute<ProjectIdInput>(
				projectIdSchema,
				req.params,
				"DeleteProjectController.handle",
			);

			const validatedQuery = this.validation.execute<DeleteQueryInput>(
				deleteQuerySchema,
				req.query,
				"DeleteProjectController.handle",
			);

			const deleteRequest = {
				id: validatedParams.id,
				force: validatedQuery.force,
			};

			const result = await this.deleteProjectService.execute(deleteRequest);

			res.status(200).json({
				success: true,
				data: result,
				message: result.message,
			});
		} catch (error) {
			this.handleError(error, res, "DeleteProjectController.handle");
		}
	}
}
