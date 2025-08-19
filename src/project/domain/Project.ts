import type {
	CreateProjectParams,
	GitHubRepository,
	ProjectProps,
	UpdateProjectParams,
} from "@/project/domain/ProjectDTO";
import { Entity } from "@/shared/domain/Entity";
import {
	BusinessRuleError,
	NotFoundError,
	ValidationError,
} from "@/shared/Errors";

export class Project extends Entity {
	public id: string;
	public createdAt: Date;
	public updatedAt: Date;

	private _title: string;
	private _description: string;
	private _tags: string[];
	private _taskIds: string[];
	private _ownerId: string;
	private _githubRepositories: GitHubRepository[];

	private constructor({
		description,
		tags,
		title,
		createdAt,
		updatedAt,
		id,
		taskIds,
		ownerId,
		githubRepositories,
	}: ProjectProps) {
		super({ id, createdAt, updatedAt });

		this._title = title;
		this._description = description;
		this._tags = tags;
		this._taskIds = taskIds;
		this._ownerId = ownerId;
		this._githubRepositories = githubRepositories || [];
	}

	public static create(params: CreateProjectParams): Project {
		const id = crypto.randomUUID();
		const createdAt = new Date();
		const updatedAt = new Date();
		const taskIds: string[] = [];

		return new Project({ id, createdAt, updatedAt, taskIds, ...params });
	}

	public static fromJSON(params: ProjectProps): Project {
		return new Project({
			createdAt: params.createdAt,
			updatedAt: params.updatedAt,
			description: params.description,
			title: params.title,
			tags: params.tags,
			id: params.id,
			githubRepositories: params.githubRepositories,
			taskIds: params.taskIds,
			ownerId: params.ownerId,
		});
	}

	public get title(): string {
		return this._title;
	}

	public get description(): string {
		return this._description;
	}

	public get tags(): string[] {
		return [...this._tags];
	}

	public get taskIds(): string[] {
		return [...this._taskIds];
	}

	public get ownerId(): string {
		return this._ownerId;
	}

	public get githubRepositories(): GitHubRepository[] {
		return [...this._githubRepositories];
	}

	public updateGitHubRepositories(repositories: GitHubRepository[]): void {
		this._githubRepositories = [...repositories];
	}

	public update(params: UpdateProjectParams): void {
		if (params.description !== undefined && params.description !== null) {
			this.updateDescription(params.description);
		}
		if (params.title !== undefined && params.title !== null) {
			this.updateTitle(params.title);
		}
		if (params.tags !== undefined && params.tags !== null) {
			this.updateTags(params.tags);
		}
		if (params.taskIds !== undefined && params.taskIds !== null) {
			this.updateTaskIds(params.taskIds);
		}
		if (params.githubRepositories !== undefined && params.githubRepositories !== null) {
			this.updateGitHubRepositories(params.githubRepositories);
		}

		this.updatedAt = new Date();
	}

	public updateTitle(title: string): void {
		if (!title.trim()) {
			throw ValidationError.requiredField("title");
		}

		this._title = title;
	}

	public updateDescription(description: string): void {
		if (!description.trim()) {
			throw ValidationError.requiredField("description");
		}

		this._description = description;
	}

	public updateTags(tags: string[]): void {
		this._tags = [...tags];
	}

	public updateTaskIds(taskIds: string[]): void {
		this._taskIds = [...taskIds];
	}

	public addTag(tag: string): void {
		if (this._tags.includes(tag)) {
			throw new BusinessRuleError({
				rule: "TAG_EXISTS",
				message: "Tag already exists",
			});
		}

		this._tags.push(tag);
	}

	public removeTag(tagToRemove: string): void {
		if (!this._tags.includes(tagToRemove)) {
			throw new NotFoundError({
				message: "Tag not found",
			});
		}

		this._tags = this._tags.filter((tag) => tag !== tagToRemove);
	}

	public toJSON(): ProjectProps {
		return {
			id: this.id,
			title: this._title,
			description: this._description,
			tags: this._tags,
			taskIds: this._taskIds,
			ownerId: this._ownerId,
			githubRepositories: this._githubRepositories,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
