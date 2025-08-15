import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { DeleteProjectService } from "@/project/service/DeleteProjectService";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import { BaseController } from "../../shared/BaseController";

type ProjectIdInput = {
	id: string;
};

type DeleteQueryInput = {
	force: boolean;
};

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
	 * DELETE /api/projects/:id?force=true
	 */
	async handle(req: Request, res: Response): Promise<void> {
		try {
			const validatedParams = this.validation.execute<ProjectIdInput>(
				"project-id",
				req.params,
				"DeleteProjectController.handle",
			);

			const validatedQuery = this.validation.execute<DeleteQueryInput>(
				"delete-query",
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
