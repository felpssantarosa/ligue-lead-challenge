import { randomUUID } from "node:crypto";

export function generateUuid(): string {
	return randomUUID();
}

export function generateManyUuids(count: number): string[] {
	return Array.from({ length: count }, () => generateUuid());
}
