import { Entity, type EntityId } from "@/shared/domain/Entity";
import type { TaskStatus } from "@/shared/domain/TaskStatus";

export interface TaskProps {
	title: string;
	description: string;
	status: TaskStatus;
	projectId: EntityId;
}

export class Task extends Entity {
	private constructor(
		id: EntityId,
		private props: TaskProps,
		createdAt?: Date,
		updatedAt?: Date,
	) {
		super({
			id,
			createdAt: createdAt || new Date(),
			updatedAt: updatedAt || new Date(),
		});
	}

	public static create(props: TaskProps, id?: EntityId): Task {
		const taskId = id || crypto.randomUUID();
		return new Task(taskId, props);
	}

	public static restore(
		id: EntityId,
		props: TaskProps,
		createdAt: Date,
		updatedAt: Date,
	): Task {
		return new Task(id, props, createdAt, updatedAt);
	}

	public get title(): string {
		return this.props.title;
	}

	public get description(): string {
		return this.props.description;
	}

	public get status(): TaskStatus {
		return this.props.status;
	}

	public get projectId(): EntityId {
		return this.props.projectId;
	}

	public updateTitle(title: string): void {
		if (!title.trim()) {
			throw new Error("Task title cannot be empty");
		}
		this.props.title = title;
	}

	public updateDescription(description: string): void {
		this.props.description = description;
	}

	public updateStatus(status: TaskStatus): void {
		this.props.status = status;
	}

	public toJSON(): object {
		return {
			id: this.id,
			title: this.title,
			description: this.description,
			status: this.status,
			projectId: this.projectId,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
