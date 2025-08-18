import type { Response } from "express";
import { inject, injectable } from "tsyringe";
import type { DeleteProjectService } from "@/project/service";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { AuthenticatedRequest } from "@/user/infra/middleware/authMiddleware";

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
	async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
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
				projectId: validatedParams.id,
				ownerId: req.user.id,
				force: validatedQuery.force,
			};

			await this.deleteProjectService.execute(deleteRequest);

			res.status(204).send();
		} catch (error) {
			this.handleError(error, res, "DeleteProjectController.handle");
		}
	}
}
