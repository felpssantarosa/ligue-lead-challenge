import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type {
	GetAllProjectsParams,
	GetAllProjectsService,
} from "@/project/service/GetAllProjectsService";
import {
	type PaginationInput,
	paginationSchema,
} from "@/project/validation/ZodSchemas";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";
import { BaseController } from "../../shared/BaseController";

@injectable()
export class GetAllProjectsController extends BaseController {
	constructor(
		@inject("GetAllProjectsService")
		private readonly getAllProjectsService: GetAllProjectsService,
		@inject("Validation")
		private readonly validation: ValidationHandler,
	) {
		super();
	}

	/**
	 * Get all projects with optional pagination and filtering
	 *
	 * GET /api/projects?page=1&limit=10&search=term&tags=tag1,tag2
	 */
	async handle(req: Request, res: Response): Promise<void> {
		try {
			const validatedQuery = this.validation.execute<PaginationInput>(
				paginationSchema,
				req.query,
				"GetAllProjectsController.handle",
			);

			if (validatedQuery.page < 1) validatedQuery.page = 1;
			if (validatedQuery.limit < 1) validatedQuery.limit = 10;

			const params: GetAllProjectsParams = {
				page: validatedQuery.page,
				limit: validatedQuery.limit,
				search: validatedQuery.search,
			};

			if (validatedQuery.tags.length > 0) params.tags = validatedQuery.tags;

			const result = await this.getAllProjectsService.execute(params);

			res.status(200).json({
				success: true,
				data: result.projects,
				meta: {
					total: result.total,
					page: params.page || 1,
					limit: params.limit || 10,
					hasNextPage: result.total > (params.page || 1) * (params.limit || 10),
				},
			});
		} catch (error) {
			this.handleError(error, res, "GetAllProjectsController.handle");
		}
	}
}
