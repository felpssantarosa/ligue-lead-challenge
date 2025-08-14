export type EntityId = string;

export type EntityProps = {
	id: EntityId;
	createdAt: Date;
	updatedAt: Date;
};

export abstract class Entity {
	public readonly id: EntityId;
	public readonly createdAt: Date;
	public readonly updatedAt: Date;

	protected constructor({ id, createdAt, updatedAt }: EntityProps) {
		this.id = id;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}
}
