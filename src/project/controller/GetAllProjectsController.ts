import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type {
	GetAllProjectsService,
	GetAllProjectsServiceParams,
} from "@/project/service";
import { BaseController } from "@/shared/BaseController";
import type { ValidationHandler } from "@/shared/validation/ValidationHandler";

type PaginationInput = {
	page: number;
	limit: number;
	tags: string[];
	search?: string | undefined;
};

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
	 * @swagger
	 * /api/projects:
	 *   get:
	 *     summary: Get all projects with optional filtering and pagination
	 *     description: Retrieve a paginated list of projects with optional search and tag filtering
	 *     tags: [Projects]
	 *     parameters:
	 *       - in: query
	 *         name: page
	 *         schema:
	 *           type: integer
	 *           minimum: 1
	 *           default: 1
	 *         description: Page number for pagination
	 *       - in: query
	 *         name: limit
	 *         schema:
	 *           type: integer
	 *           minimum: 1
	 *           maximum: 100
	 *           default: 10
	 *         description: Number of items per page
	 *       - in: query
	 *         name: search
	 *         schema:
	 *           type: string
	 *         description: Search term to filter projects by title or description
	 *       - in: query
	 *         name: tags
	 *         schema:
	 *           type: string
	 *         description: Comma-separated list of tags to filter projects
	 *         example: "react,nodejs,typescript"
	 *     responses:
	 *       200:
	 *         description: Successfully retrieved projects
	 *         content:
	 *           application/json:
	 *             schema:
	 *               allOf:
	 *                 - $ref: '#/components/schemas/ApiResponse'
	 *                 - type: object
	 *                   properties:
	 *                     data:
	 *                       type: array
	 *                       items:
	 *                         $ref: '#/components/schemas/Project'
	 *       400:
	 *         description: Bad request - Invalid parameters
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *       500:
	 *         description: Internal server error
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 */
	async handle(req: Request, res: Response): Promise<void> {
		try {
			const validatedQuery = this.validation.execute<PaginationInput>(
				"pagination",
				req.query,
				"GetAllProjectsController.handle",
			);

			if (validatedQuery.page < 1) validatedQuery.page = 1;
			if (validatedQuery.limit < 1) validatedQuery.limit = 10;

			const params: GetAllProjectsServiceParams = {
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
