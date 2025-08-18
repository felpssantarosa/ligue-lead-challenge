import type { Response } from "express";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { DeleteTaskService } from "@/task/service";
import type { TaskIdInput } from "@/task/validation";
import type { AuthenticatedRequest } from "@/user/infra/middleware/authMiddleware";

@injectable()
export class DeleteTaskController extends BaseController {
	constructor(
		@inject("DeleteTaskService")
		private readonly deleteTaskService: DeleteTaskService,
		@inject("Validation") private readonly validation: ValidationHandler,
	) {
		super();
	}

	async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
		try {
			const validatedParams = this.validation.execute<TaskIdInput>(
				"task-id",
				req.params,
				"DeleteTaskController.handle",
			);

			await this.deleteTaskService.execute({
				taskId: validatedParams.id,
				ownerId: req.user.id,
			});

			res.status(204).send();
		} catch (error) {
			this.handleError(error, res, "DeleteTaskController.handle");
		}
	}
}
