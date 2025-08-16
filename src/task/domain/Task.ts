import { Entity } from "@/shared/domain/Entity";
import type { TaskStatus } from "@/shared/domain/TaskStatus";
import { ValidationError } from "@/shared/Errors";
import type {
	CreateTaskParams,
	TaskProps,
	UpdateTaskParams,
} from "@/task/domain/TaskDTO";

export class Task extends Entity {
	public readonly id: string;
	public readonly createdAt: Date;
	public updatedAt: Date;

	private _projectId: string;
	private _title: string;
	private _description: string;
	private _status: TaskStatus;

	private constructor({
		id,
		projectId,
		title,
		description,
		status,
		createdAt,
		updatedAt,
	}: TaskProps) {
		super({
			id,
			createdAt,
			updatedAt,
		});

		this._title = title;
		this._description = description;
		this._status = status;
		this._projectId = projectId;
	}

	public static create(params: CreateTaskParams): Task {
		const id = crypto.randomUUID();
		const createdAt = new Date();
		const updatedAt = new Date();

		return new Task({ id, createdAt, updatedAt, ...params });
	}

	public static fromJSON(params: TaskProps): Task {
		const { id, createdAt, updatedAt, description, projectId, status, title } =
			params;

		return new Task({
			createdAt,
			updatedAt,
			description,
			title,
			status,
			id,
			projectId,
		});
	}

	public get title(): string {
		return this._title;
	}

	public get description(): string {
		return this._description;
	}

	public get status(): TaskStatus {
		return this._status;
	}

	public get projectId(): string {
		return this._projectId;
	}

	public update(params: UpdateTaskParams): Task {
		if (params.description !== undefined && params.description !== null) {
			this.updateDescription(params.description);
		}
		if (params.title !== undefined && params.title !== null) {
			this.updateTitle(params.title);
		}
		if (params.status !== undefined && params.status !== null) {
			this.updateStatus(params.status);
		}

		this.updatedAt = new Date();

		return this;
	}

	private updateTitle(title: string): void {
		if (!title.trim()) {
			throw ValidationError.requiredField("title");
		}

		this._title = title;
	}

	private updateDescription(description: string): void {
		if (!description.trim()) {
			throw ValidationError.requiredField("description");
		}

		this._description = description;
	}

	private updateStatus(status: TaskStatus): void {
		this._status = status;
	}

	public toJSON(): TaskProps {
		return {
			id: this.id,
			title: this.title,
			description: this.description,
			status: this.status,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
			projectId: this.projectId,
		};
	}
}
