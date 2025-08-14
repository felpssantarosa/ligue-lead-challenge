```ts
class Task {
    title: string;
    description: string;
    status: Status;
}

class Project {
    title: string;
    description: string;
    tags: string[] = [];
    tasks: Task[] = [];

    // maybe more properties, not sure yet
}
```