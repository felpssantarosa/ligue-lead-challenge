import { injectable } from "tsyringe";
import { User } from "@/user/domain";
import type { UserModel } from "@/user/infra/database/models/SequelizeUserModel";
import type { UserRepository } from "@/user/infra/repository/UserRepository";

@injectable()
export class SequelizeUserRepository implements UserRepository {
	private sequelizeModel: typeof UserModel;

	constructor(sequelizeModel: typeof UserModel) {
		this.sequelizeModel = sequelizeModel;
	}

	async save(user: User): Promise<User> {
		const userData = user.toJSON();

		await this.sequelizeModel.create({
			id: userData.id,
			email: userData.email,
			name: userData.name,
			passwordHash: userData.passwordHash,
			createdAt: userData.createdAt,
			updatedAt: userData.updatedAt,
		});

		return user;
	}

	async findById(id: string): Promise<User | null> {
		const userModel = await this.sequelizeModel.findByPk(id);

		if (!userModel) return null;

		return this.mapToDomain(userModel);
	}

	async findByEmail(email: string): Promise<User | null> {
		const userModel = await this.sequelizeModel.findOne({
			where: { email: email.toLowerCase() },
		});

		if (!userModel) return null;

		return this.mapToDomain(userModel);
	}

	private mapToDomain(userModel: UserModel): User {
		return User.fromJSON({
			id: userModel.id,
			email: userModel.email,
			name: userModel.name,
			passwordHash: userModel.passwordHash,
			createdAt: userModel.createdAt,
			updatedAt: userModel.updatedAt,
		});
	}
}
