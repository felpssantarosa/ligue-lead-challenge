export interface JwtService {
	generateToken(payload: object): string;
	verifyToken(token: string): object | null;
}
