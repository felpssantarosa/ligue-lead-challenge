import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { GetProjectService } from "@/project/service/GetProjectService";
import { NotFoundError } from "@/shared/Errors";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import { BaseController } from "../../shared/BaseController";

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
	 * GET /api/projects/:id
	 */
	async handle(req: Request, res: Response): Promise<void> {
		try {
			const validatedParams = this.validation.execute<ProjectIdInput>(
				"project-id",
				req.params,
				"GetProjectController.handle",
			);

			const project = await this.getProjectService.execute(validatedParams.id);

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
