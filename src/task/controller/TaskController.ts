import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import type { CreateTaskService } from "@/task/service/CreateTaskService";
import {
	createTaskSchema,
	createTaskWithProjectSchema,
	type CreateTaskInput,
	type CreateTaskWithProjectInput,
} from "@/task/validation/schemas";

@injectable()
export class TaskController extends BaseController {
	constructor(
		@inject("CreateTaskService")
		private readonly createTaskService: CreateTaskService,
		@inject("Validation")
		private readonly validation: ValidationHandler,
	) {
		super();
	}

	async create(req: Request, res: Response): Promise<void> {
		try {
			const validatedParams =
				this.validation.execute<CreateTaskWithProjectInput>(
					createTaskWithProjectSchema,
					req.params,
					"TaskController.create",
				);

			const validatedBody = this.validation.execute<CreateTaskInput>(
				createTaskSchema,
				req.body,
				"TaskController.create",
			);

			const task = await this.createTaskService.execute({
				title: validatedBody.title,
				description: validatedBody.description,
				status: validatedBody.status,
				projectId: validatedParams.projectId,
			});

			res.status(201).json({
				success: true,
				data: task,
				message: "Task created successfully",
			});
		} catch (error) {
			this.handleError(error, res, "TaskController.create");
		}
	}

	async update(_req: Request, res: Response): Promise<void> {
		try {
			// TODO: Implement UpdateTaskService
			res.json({ message: "Update not implemented yet" });
		} catch (error) {
			this.handleError(error, res, "TaskController.update");
		}
	}

	async delete(_req: Request, res: Response): Promise<void> {
		try {
			// TODO: Implement DeleteTaskService
			res.json({ message: "Delete not implemented yet" });
		} catch (error) {
			this.handleError(error, res, "TaskController.delete");
		}
	}
}
