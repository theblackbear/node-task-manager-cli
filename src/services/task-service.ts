import { randomUUID } from 'node:crypto';
import { TaskNotFoundError } from '../errors/task-not-found-error.js';
import type { Task } from '../models/task.js';
import type { TaskRepository } from '../repositories/task-repository.js';

export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  async add(title: string): Promise<Task> {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) throw new Error('O título da tarefa não pode estar vazio.');
    const tasks = await this.repository.findAll();
    const task: Task = {
      id: randomUUID(),
      title: normalizedTitle,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    tasks.push(task);
    await this.repository.saveAll(tasks);
    return task;
  }

  list(): Promise<Task[]> {
    return this.repository.findAll();
  }

  async complete(id: string): Promise<Task> {
    const tasks = await this.repository.findAll();
    const task = tasks.find((item) => item.id === id);
    if (!task) throw new TaskNotFoundError(id);
    task.completed = true;
    await this.repository.saveAll(tasks);
    return task;
  }

  async remove(id: string): Promise<void> {
    const tasks = await this.repository.findAll();
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) throw new TaskNotFoundError(id);
    tasks.splice(index, 1);
    await this.repository.saveAll(tasks);
  }
}
