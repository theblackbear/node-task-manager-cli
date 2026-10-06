import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Task } from '../models/task.js';
import type { TaskRepository } from './task-repository.js';

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const task = value as Record<string, unknown>;
  return typeof task.id === 'string'
    && typeof task.title === 'string'
    && typeof task.completed === 'boolean'
    && typeof task.createdAt === 'string';
}

export class JsonTaskRepository implements TaskRepository {
  constructor(private readonly filePath: string) {}

  async findAll(): Promise<Task[]> {
    let content: string;
    try {
      content = await readFile(this.filePath, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }

    let data: unknown;
    try {
      data = JSON.parse(content);
    } catch {
      throw new Error('O arquivo de tarefas contém JSON inválido. Verifique o arquivo antes de continuar.');
    }
    if (!Array.isArray(data) || !data.every(isTask)) {
      throw new Error('O arquivo de tarefas possui um formato inválido.');
    }
    return data;
  }

  async saveAll(tasks: Task[]): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(tasks, null, 2)}\n`, 'utf8');
  }
}
