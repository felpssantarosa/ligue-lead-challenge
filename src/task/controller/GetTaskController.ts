import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { GetTaskService } from "@/task/service/GetTaskService";
import type { GetTaskInput } from "@/task/validation";

@injectable()
export class GetTaskController extends BaseController {
	constructor(
		@inject("GetTaskService") private readonly getTaskService: GetTaskService,
		@inject("Validation") private readonly validation: ValidationHandler,
	) {
		super();
	}

	public async handle(req: Request, res: Response): Promise<void> {
		try {
			const validatedParams = this.validation.execute<GetTaskInput>(
				"get-task",
				req.params,
				"GetTaskController.handle",
			);

			const task = await this.getTaskService.execute({
				id: validatedParams.id,
			});

			res.status(200).json({
				success: true,
				data: task,
			});
		} catch (error) {
			this.handleError(error, res, "GetTaskController.handle");
		}
	}
}
