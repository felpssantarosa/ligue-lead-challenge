import { inject, injectable } from "tsyringe";
import { UnauthorizedError } from "@/shared/Errors";
import type { User } from "@/user/domain";
import type { JwtService } from "@/user/infra/jwt";
import type { UserRepository } from "@/user/infra/repository";

@injectable()
export class AuthService {
	constructor(
		@inject("UserRepository")
		private readonly userRepository: UserRepository,
		@inject("JwtService")
		private readonly jwtService: JwtService,
	) {}

	async validateToken(token: string): Promise<User> {
		const payload = this.jwtService.verifyToken(token);

		if (!payload || typeof payload !== "object" || !("userId" in payload)) {
			throw new UnauthorizedError({
				message: "Invalid or expired token",
				action: "authenticate",
				resource: "User",
			});
		}

		const user = await this.userRepository.findById(payload.userId as string);

		if (!user) {
			throw new UnauthorizedError({
				message: "User not found",
				action: "authenticate",
				resource: "User",
			});
		}

		return user;
	}
}
