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
import { ProjectModel } from "@/project/infra";

export interface UserModelAttributes {
	id: string;
	email: string;
	name: string;
	passwordHash: string;
	createdAt: Date;
	updatedAt: Date;
}

@Table({
	tableName: "users",
	timestamps: true,
})
export class UserModel extends Model<UserModelAttributes> {
	@PrimaryKey
	@Column({
		type: DataType.UUID,
		allowNull: false,
	})
	id!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
		unique: true,
	})
	email!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	name!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	passwordHash!: string;

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

	@HasMany(() => ProjectModel, { onDelete: "CASCADE", hooks: true })
	projects!: ProjectModel[];
}

export default UserModel;
