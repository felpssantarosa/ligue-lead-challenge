import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { CreateProjectService } from "@/project/service";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";

type CreateProjectData = {
	title: string;
	description: string;
	tags: string[];
};

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
	 * POST /api/projects
	 */
	async handle(req: Request, res: Response): Promise<void> {
		try {
			const validatedData = this.validation.execute<CreateProjectData>(
				"create-project",
				req.body,
				"CreateProjectController.handle",
			);

			const project = await this.createProjectService.execute({
				title: validatedData.title,
				description: validatedData.description,
				tags: validatedData.tags,
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
