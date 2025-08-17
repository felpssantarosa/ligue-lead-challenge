import { Project } from "@/project/domain/Project";
import type {
	CreateProjectParams,
	ProjectProps,
} from "@/project/domain/ProjectDTO";
import {
	BusinessRuleError,
	NotFoundError,
	ValidationError,
} from "@/shared/Errors";

const validParams = (): CreateProjectParams => ({
	title: "Test Project",
	description: "A test project description",
	tags: ["test", "typescript"],
});

const validProps = (): ProjectProps => ({
	id: "test-id-123",
	title: "Test Project",
	description: "A test project description",
	tags: ["test", "typescript"],
	taskIds: [],
	createdAt: new Date("2023-01-01T00:00:00.000Z"),
	updatedAt: new Date("2023-01-01T00:00:00.000Z"),
});

const expectValidProject = (project: Project, params: CreateProjectParams) => {
	expect(project).toBeInstanceOf(Project);
	expect(project.id).toBeDefined();
	expect(project.title).toBe(params.title);
	expect(project.description).toBe(params.description);
	expect(project.tags).toEqual(params.tags);
	expect(project.createdAt).toBeInstanceOf(Date);
	expect(project.updatedAt).toBeInstanceOf(Date);
};

const expectValidationError = (fn: () => void, field: string) => {
	expect(fn).toThrow(ValidationError);
	expect(fn).toThrow(`${field} is required`);
};

describe("Project", () => {
	const mockDate = new Date("2023-01-01T10:00:00.000Z");

	beforeAll(() => {
		jest.useFakeTimers();
		jest.setSystemTime(mockDate);
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	describe("Static Factory Methods", () => {
		describe("create", () => {
			it("should create valid project and generate unique IDs", () => {
				const params = validParams();
				const project1 = Project.create(params);
				const project2 = Project.create(params);

				expectValidProject(project1, params);
				expect(project1.createdAt).toEqual(project1.updatedAt);
				expect(project1.id).not.toBe(project2.id);
			});

			it("should handle empty tags", () => {
				const project = Project.create({ ...validParams(), tags: [] });
				expect(project.tags).toEqual([]);
			});
		});

		describe("fromJSON", () => {
			it("should create project from JSON and preserve dates", () => {
				const props = validProps();
				const project = Project.fromJSON(props);

				expect(project.id).toBe(props.id);
				expect(project.title).toBe(props.title);
				expect(project.description).toBe(props.description);
				expect(project.tags).toEqual(props.tags);
				expect(project.createdAt).toEqual(props.createdAt);
				expect(project.updatedAt).toEqual(props.updatedAt);
			});
		});
	});

	describe("Property Getters", () => {
		const project = Project.create(validParams());

		it("should return correct property values", () => {
			expect(project.title).toBe("Test Project");
			expect(project.description).toBe("A test project description");
		});

		it("should return immutable tags copy", () => {
			const tags = project.tags;
			tags.push("modified");
			expect(project.tags).toEqual(["test", "typescript"]);
			expect(project.tags).not.toBe(tags);
		});

		it("should handle empty tags", () => {
			const emptyProject = Project.create({ ...validParams(), tags: [] });
			expect(emptyProject.tags).toEqual([]);
		});
	});

	describe("Update Operations", () => {
		let project: Project;

		beforeEach(() => {
			project = Project.create(validParams());
		});

		it("should update provided properties and timestamp", () => {
			const originalUpdatedAt = project.updatedAt;

			jest.advanceTimersByTime(1000);

			project.update({ title: "New Title" });

			expect(project.title).toBe("New Title");
			expect(project.description).toBe("A test project description");
			expect(project.tags).toEqual(["test", "typescript"]);
			expect(project.updatedAt.getTime()).toBeGreaterThan(
				originalUpdatedAt.getTime(),
			);
		});

		it("should update multiple properties", () => {
			project.update({
				title: "Updated Title",
				description: "Updated Description",
				tags: ["new", "tags"],
			});

			expect(project.title).toBe("Updated Title");
			expect(project.description).toBe("Updated Description");
			expect(project.tags).toEqual(["new", "tags"]);
		});

		it("should ignore null and undefined values", () => {
			const originalTitle = project.title;
			const originalDescription = project.description;

			project.update({
				title: undefined,
				description: null as unknown as string,
				tags: ["updated"],
			});

			expect(project.title).toBe(originalTitle);
			expect(project.description).toBe(originalDescription);
			expect(project.tags).toEqual(["updated"]);
		});

		describe("validation", () => {
			it("should throw validation errors for empty values", () => {
				expectValidationError(() => project.update({ title: "" }), "title");
				expectValidationError(
					() => project.update({ description: "" }),
					"description",
				);
			});
		});
	});

	describe("Individual Property Updates", () => {
		let project: Project;

		beforeEach(() => {
			project = Project.create(validParams());
		});

		describe("updateTitle", () => {
			it("should update title with valid value and handle edge cases", () => {
				project.updateTitle("New Title");
				expect(project.title).toBe("New Title");

				project.updateTitle("  Valid Title  ");
				expect(project.title).toBe("  Valid Title  ");
			});

			it.each(["", "   "])(
				"should reject invalid value: '%s'",
				(invalidValue) => {
					expectValidationError(
						() => project.updateTitle(invalidValue),
						"title",
					);
				},
			);
		});

		describe("updateDescription", () => {
			it("should update description with valid value and handle edge cases", () => {
				project.updateDescription("New Description");
				expect(project.description).toBe("New Description");

				project.updateDescription("  Valid Description  ");
				expect(project.description).toBe("  Valid Description  ");
			});

			it.each(["", "   "])(
				"should reject invalid value: '%s'",
				(invalidValue) => {
					expectValidationError(
						() => project.updateDescription(invalidValue),
						"description",
					);
				},
			);
		});

		describe("updateTags", () => {
			it("should update and create copy", () => {
				const newTags = ["new", "tags"];
				project.updateTags(newTags);
				newTags.push("modified");

				expect(project.tags).toEqual(["new", "tags"]);
			});

			it("should handle empty array", () => {
				project.updateTags([]);
				expect(project.tags).toEqual([]);
			});
		});
	});

	describe("Tag Management", () => {
		let project: Project;

		beforeEach(() => {
			project = Project.create({ ...validParams(), tags: ["existing"] });
		});

		describe("addTag", () => {
			it("should add new tags successfully", () => {
				project.addTag("new");
				project.addTag("another");
				expect(project.tags).toEqual(["existing", "new", "another"]);
			});

			it("should reject duplicate tags", () => {
				expect(() => project.addTag("existing")).toThrow(BusinessRuleError);
			});

			it("should handle case sensitivity", () => {
				project.addTag("Existing");
				expect(project.tags).toEqual(["existing", "Existing"]);
			});
		});

		describe("removeTag", () => {
			beforeEach(() => {
				project.updateTags(["tag1", "tag2", "tag3"]);
			});

			it("should remove existing tags", () => {
				project.removeTag("tag2");
				expect(project.tags).toEqual(["tag1", "tag3"]);
			});

			it("should handle duplicates and case sensitivity", () => {
				project.updateTags(["tag1", "tag2", "tag2", "tag3"]);
				project.removeTag("tag2");
				expect(project.tags).toEqual(["tag1", "tag3"]);

				expect(() => project.removeTag("TAG1")).toThrow(NotFoundError);
			});

			it("should reject non-existent tags", () => {
				expect(() => project.removeTag("nonexistent")).toThrow(NotFoundError);
			});
		});
	});

	describe("Serialization", () => {
		it("should serialize to JSON and handle roundtrip", () => {
			const project = Project.create(validParams());
			const json = project.toJSON();

			expect(json).toEqual({
				id: project.id,
				title: project.title,
				description: project.description,
				tags: project.tags,
				createdAt: project.createdAt,
				updatedAt: project.updatedAt,
			});

			const serialized = JSON.stringify(json);
			const parsed = JSON.parse(serialized);
			expect(new Date(parsed.createdAt)).toEqual(project.createdAt);
		});

		it("should return reference to internal tags", () => {
			const project = Project.create(validParams());
			const json = project.toJSON();
			json.tags.push("modified");
			expect(project.toJSON().tags).toContain("modified");
		});
	});

	describe("Entity Inheritance", () => {
		it("should inherit Entity properties", () => {
			const project = Project.create(validParams());
			expect(typeof project.id).toBe("string");
			expect(project.createdAt).toBeInstanceOf(Date);
			expect(project.updatedAt).toBeInstanceOf(Date);
		});
	});
});
