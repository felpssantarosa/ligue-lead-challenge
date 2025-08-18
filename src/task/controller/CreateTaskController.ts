import type { Response } from "express";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { TaskProps } from "@/task/domain";
import type { CreateTaskService } from "@/task/service";
import type { AuthenticatedRequest } from "@/user/infra/middleware/authMiddleware";

@injectable()
export class CreateTaskController extends BaseController {
	constructor(
		@inject("CreateTaskService")
		private readonly createTaskService: CreateTaskService,
		@inject("Validation") private readonly validation: ValidationHandler,
	) {
		super();
	}

	async create(req: AuthenticatedRequest, res: Response): Promise<Response> {
		try {
			const { projectId } = req.params;
			const taskData = req.body;

			const validatedProjectData = this.validation.execute<{ id: string }>(
				"project-id",
				{ id: projectId },
				"CreateTaskByProjectIdController.create",
			);

			const validatedTaskParams = this.validation.execute<TaskProps>(
				"create-task",
				taskData,
				"CreateTaskByProjectIdController.create",
			);

			const task = await this.createTaskService.execute({
				...validatedTaskParams,
				projectId: validatedProjectData.id,
				ownerId: req.user.id,
			});

			return res.status(201).json({
				success: true,
				data: task,
				message: "Task created successfully",
			});
		} catch (error) {
			this.handleError(error, res, "CreateTaskController.create");

			return res;
		}
	}
}
