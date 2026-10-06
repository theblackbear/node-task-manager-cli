import type { Task } from '../models/task.js';

export interface TaskRepository {
  findAll(): Promise<Task[]>;
  saveAll(tasks: Task[]): Promise<void>;
}
