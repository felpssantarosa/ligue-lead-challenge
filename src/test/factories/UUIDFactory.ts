import { randomUUID } from "node:crypto";

export function generateUUID(): string {
	return randomUUID();
}

export function generateManyUuids(count: number): string[] {
	return Array.from({ length: count }, () => generateUUID());
}
