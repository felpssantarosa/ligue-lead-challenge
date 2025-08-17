import {
	Column,
	CreatedAt,
	DataType,
	HasMany,
	Model,
	PrimaryKey,
	Table,
	UpdatedAt,
} from "sequelize-typescript";
import { TaskModel } from "@/task/infra";

export interface ProjectModelAttributes {
	id: string;
	title: string;
	description: string;
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
}

@Table({
	tableName: "projects",
	timestamps: true,
})
export class ProjectModel extends Model<ProjectModelAttributes> {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		allowNull: false,
	})
	id!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	title!: string;

	@Column({
		type: DataType.TEXT,
		allowNull: true,
	})
	description!: string;

	@Column({
		type: DataType.JSON,
		allowNull: true,
		defaultValue: [],
	})
	tags!: string[];

	@CreatedAt
	@Column({
		type: DataType.DATE,
	})
	createdAt!: Date;

	@UpdatedAt
	@Column({
		type: DataType.DATE,
	})
	updatedAt!: Date;

	@HasMany(() => TaskModel, { onDelete: "CASCADE", hooks: true })
	tasks!: TaskModel[];
}

export default ProjectModel;
