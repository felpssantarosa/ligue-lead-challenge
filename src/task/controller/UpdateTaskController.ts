import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { UpdateTaskService } from "@/task/service/UpdateTaskService";
import type {
	TaskIdInput,
	UpdateTaskInput,
} from "@/task/validation/schemas/zod";

@injectable()
export class UpdateTaskController extends BaseController {
	constructor(
		@inject("UpdateTaskService")
		private readonly updateTaskService: UpdateTaskService,
		@inject("Validation") private readonly validation: ValidationHandler,
	) {
		super();
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const validatedParams = this.validation.execute<TaskIdInput>(
				"task-id",
				req.params,
				"UpdateTaskController.handle",
			);

			const validatedBody = this.validation.execute<UpdateTaskInput>(
				"update-task",
				req.body,
				"UpdateTaskController.handle",
			);

			const task = await this.updateTaskService.execute({
				id: validatedParams.id,
				...validatedBody,
			});

			res.status(200).json({
				success: true,
				data: task,
				message: "Task updated successfully",
			});
		} catch (error) {
			this.handleError(error, res, "UpdateTaskController.handle");
		}
	}
}
