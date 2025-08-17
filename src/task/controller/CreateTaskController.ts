import type { Request, Response } from "express";
import { ValidationError } from "sequelize";
import { inject, injectable } from "tsyringe";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { TaskProps } from "@/task/domain";
import type { CreateTaskService } from "@/task/service";

@injectable()
export class CreateTaskController {
	constructor(
		@inject("CreateTaskService")
		private readonly createTaskService: CreateTaskService,
		@inject("Validation") private readonly validation: ValidationHandler,
	) {}

	async create(req: Request, res: Response): Promise<Response> {
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
