# API Examples - Ligue Lead Challenge

## Health Check

```http
GET http://localhost:3000/health
```

## Projects

### Create Project

```http
POST http://localhost:3000/api/projects
Content-Type: application/json

{
  "title": "E-commerce Platform",
  "description": "A modern e-commerce platform built with Node.js and React",
  "tags": ["nodejs", "react", "typescript", "mongodb"]
}
```

### Get All Projects

```http
GET http://localhost:3000/api/projects
```

### Get Project by ID

```http
GET http://localhost:3000/api/projects/{{projectId}}
```

## Tasks

### Create Task for Project

```http
POST http://localhost:3000/api/projects/{{projectId}}/tasks
Content-Type: application/json

{
  "title": "Setup project structure",
  "description": "Create the initial project structure with proper folders and configuration",
  "status": "todo"
}
```

### Create Another Task

```http
POST http://localhost:3000/api/projects/{{projectId}}/tasks
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication system",
  "status": "in_progress"
}
```

### Create Completed Task

```http
POST http://localhost:3000/api/projects/{{projectId}}/tasks
Content-Type: application/json

{
  "title": "Setup database",
  "description": "Configure MySQL database and create initial schema",
  "status": "done"
}
```

## Example Response Formats

### Project Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "E-commerce Platform",
  "description": "A modern e-commerce platform built with Node.js and React",
  "tags": ["nodejs", "react", "typescript", "mongodb"],
  "githubRepositories": [],
  "createdAt": "2025-01-13T15:30:00.000Z",
  "updatedAt": "2025-01-13T15:30:00.000Z"
}
```

### Task Response

```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "title": "Setup project structure",
  "description": "Create the initial project structure with proper folders and configuration",
  "status": "todo",
  "projectId": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2025-01-13T15:35:00.000Z",
  "updatedAt": "2025-01-13T15:35:00.000Z"
}
```

### Error Response

```json
{
  "error": "Project title cannot be empty"
}
```

## Using with curl

### Create Project

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Project",
    "description": "A test project",
    "tags": ["test", "api"]
  }'
```

### Get Project

```bash
curl http://localhost:3000/api/projects/PROJECT_ID_HERE
```

### Create Task

```bash
curl -X POST http://localhost:3000/api/projects/PROJECT_ID_HERE/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "A test task",
    "status": "todo"
  }'
```

## Notes

- Replace `{{projectId}}` with actual project ID from previous responses
- All timestamps are in ISO 8601 format
- IDs are UUIDs (v4)
- Available task statuses: "todo", "in_progress", "done"
- The API accepts both empty arrays and missing fields for optional properties
