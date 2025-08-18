import type { Response } from "express";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { UpdateTaskService } from "@/task/service";
import type { TaskIdInput, UpdateTaskInput } from "@/task/validation";
import type { AuthenticatedRequest } from "@/user/infra/middleware/authMiddleware";

@injectable()
export class UpdateTaskController extends BaseController {
	constructor(
		@inject("UpdateTaskService")
		private readonly updateTaskService: UpdateTaskService,
		@inject("Validation") private readonly validation: ValidationHandler,
	) {
		super();
	}

	async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
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
				taskId: validatedParams.id,
				ownerId: req.user.id,
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
