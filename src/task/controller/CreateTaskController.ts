import type { Request, Response } from "express";
import { ValidationError } from "sequelize";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { TaskProps } from "@/task/domain";
import type { CreateTaskService } from "@/task/service";

export class CreateTaskController {
	constructor(
		private readonly createTaskService: CreateTaskService,
		private readonly validation: ValidationHandler,
	) {}

	async create(req: Request, res: Response): Promise<Response> {
		try {
			const { projectId } = req.params;
			const taskData = req.body;

			const validatedProjectId = this.validation.execute<string>(
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
				projectId: validatedProjectId,
			});

			return res.status(201).json({
				success: true,
				data: task,
				message: "Task created successfully",
			});
		} catch (error) {
			return this.handleError(error as Error, res);
		}
	}

	private handleError(error: Error, res: Response): Response {
		if (error instanceof ValidationError) {
			return res.status(400).json({
				success: false,
				message: error.message,
			});
		}

		return res.status(500).json({
			success: false,
			message: "Internal Server Error",
		});
	}
}
