import {
	BelongsTo,
	Column,
	CreatedAt,
	DataType,
	ForeignKey,
	Model,
	PrimaryKey,
	Table,
	UpdatedAt,
} from "sequelize-typescript";
import { ProjectModel } from "@/project/infra";
import { TaskStatus } from "@/shared/domain/TaskStatus";

@Table({
	tableName: "tasks",
	timestamps: true,
})
export class TaskModel extends Model {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
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
		type: DataType.ENUM(...Object.values(TaskStatus)),
		allowNull: false,
		defaultValue: TaskStatus.TODO,
	})
	status!: TaskStatus;

	@ForeignKey(() => ProjectModel)
	@Column({
		type: DataType.UUID,
		allowNull: false,
	})
	projectId!: string;

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

	@BelongsTo(() => ProjectModel)
	project!: ProjectModel;
}

export default TaskModel;
