import type { JwtService } from "@/user/infra/jwt";

export class MockJwtService implements JwtService {
	generateToken(payload: { userId: string; email: string }): string {
		return `mock-token-${payload.userId}`;
	}

	verifyToken(token: string): { userId: string; email: string } | null {
		if (token.startsWith("mock-token-")) {
			const userId = token.replace("mock-token-", "");
			return {
				userId,
				email: "test@example.com",
			};
		}
		return null;
	}
}

export const mockJwtService = new MockJwtService();
