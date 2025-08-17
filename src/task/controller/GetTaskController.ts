import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { BaseController } from "@/shared/BaseController";
import type { GetTaskService } from "@/task/service/GetTaskService";

@injectable()
export class GetTaskController extends BaseController {
	constructor(
		@inject("GetTaskService") private readonly getTaskService: GetTaskService,
	) {
		super();
	}

	public async handle(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;

			const task = await this.getTaskService.execute({ id });

			res.status(200).json({
				success: true,
				data: task,
			});
		} catch (error) {
			this.handleError(error, res, "GetTaskController.handle");
		}
	}
}
