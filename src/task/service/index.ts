import { inject, injectable } from "tsyringe";
import type {
	CreateTaskService,
	CreateTaskServiceParams,
	CreateTaskServiceResponse,
} from "@/task/service/CreateTaskService";
import type {
	DeleteByProjectIdService,
	DeleteByProjectIdServiceResponse,
} from "@/task/service/DeleteByProjectIdService";
import type {
	DeleteTaskService,
	DeleteTaskServiceParams,
	DeleteTaskServiceResponse,
} from "@/task/service/DeleteTaskService";
import type {
	GetAllTasksService,
	GetAllTasksServiceParams,
	GetAllTasksServiceResponse,
} from "@/task/service/GetAllTasksService";
import type {
	GetTaskService,
	GetTaskServiceParams,
	GetTaskServiceResponse,
} from "@/task/service/GetTaskService";
import type {
	UpdateTaskService,
	UpdateTaskServiceParams,
	UpdateTaskServiceResponse,
} from "@/task/service/UpdateTaskService";

@injectable()
export class TaskService {
	constructor(
		@inject("CreateTaskService")
		private readonly createTaskService: CreateTaskService,
		@inject("GetAllTasksService")
		private readonly getAllTasksService: GetAllTasksService,
		@inject("GetTaskService")
		private readonly getTaskService: GetTaskService,
		@inject("UpdateTaskService")
		private readonly updateTaskService: UpdateTaskService,
		@inject("DeleteTaskService")
		private readonly deleteTaskService: DeleteTaskService,
		@inject("DeleteByProjectIdService")
		private readonly deleteByProjectIdService: DeleteByProjectIdService,
	) {}

	public create(
		data: CreateTaskServiceParams,
	): Promise<CreateTaskServiceResponse> {
		return this.createTaskService.execute(data);
	}

	public getAll(
		params: GetAllTasksServiceParams,
	): Promise<GetAllTasksServiceResponse> {
		return this.getAllTasksService.execute(params);
	}

	public get(params: GetTaskServiceParams): Promise<GetTaskServiceResponse> {
		return this.getTaskService.execute(params);
	}

	public update(
		params: UpdateTaskServiceParams,
	): Promise<UpdateTaskServiceResponse> {
		return this.updateTaskService.execute(params);
	}

	public delete(
		params: DeleteTaskServiceParams,
	): Promise<DeleteTaskServiceResponse> {
		return this.deleteTaskService.execute(params);
	}

	public deleteByProjectId(
		projectId: string,
	): Promise<DeleteByProjectIdServiceResponse> {
		return this.deleteByProjectIdService.execute(projectId);
	}
}

export * from "./CreateTaskService";
export * from "./DeleteByProjectIdService";
export * from "./DeleteTaskService";
export * from "./GetAllTasksService";
export * from "./GetTaskService";
export * from "./GetTasksByProjectService";
export * from "./UpdateTaskService";
