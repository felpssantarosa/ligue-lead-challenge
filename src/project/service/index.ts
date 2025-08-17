import { inject } from "tsyringe";
import type {
	CreateProjectService,
	CreateProjectServiceParams,
	CreateProjectServiceResponse,
} from "@/project/service/CreateProjectService";
import type {
	DeleteProjectService,
	DeleteProjectServiceParams,
	DeleteProjectServiceResponse,
} from "@/project/service/DeleteProjectService";
import type {
	GetAllProjectsService,
	GetAllProjectsServiceParams,
	GetAllProjectsServiceResponse,
} from "@/project/service/GetAllProjectsService";
import type {
	GetProjectService,
	GetProjectServiceParams,
	GetProjectServiceResponse,
} from "@/project/service/GetProjectService";
import type {
	UpdateProjectService,
	UpdateProjectServiceParams,
	UpdateProjectServiceResponse,
} from "@/project/service/UpdateProjectService";

export class ProjectService {
	constructor(
		@inject("CreateProjectService")
		private readonly createProjectService: CreateProjectService,
		@inject("GetAllProjectsService")
		private readonly getAllProjectsService: GetAllProjectsService,
		@inject("GetProjectService")
		private readonly getProjectService: GetProjectService,
		@inject("UpdateProjectService")
		private readonly updateProjectService: UpdateProjectService,
		@inject("DeleteProjectService")
		private readonly deleteProjectService: DeleteProjectService,
	) {}

	public create(
		data: CreateProjectServiceParams,
	): Promise<CreateProjectServiceResponse> {
		return this.createProjectService.execute(data);
	}

	public getAll(
		params: GetAllProjectsServiceParams,
	): Promise<GetAllProjectsServiceResponse> {
		return this.getAllProjectsService.execute(params);
	}

	public get(
		params: GetProjectServiceParams,
	): Promise<GetProjectServiceResponse> {
		return this.getProjectService.execute(params);
	}

	public update(
		params: UpdateProjectServiceParams,
	): Promise<UpdateProjectServiceResponse> {
		return this.updateProjectService.execute(params);
	}

	public delete(
		params: DeleteProjectServiceParams,
	): Promise<DeleteProjectServiceResponse> {
		return this.deleteProjectService.execute(params);
	}
}

export * from "./CreateProjectService";
export * from "./GetAllProjectsService";
export * from "./GetProjectService";
export * from "./UpdateProjectService";
export * from "./DeleteProjectService";
