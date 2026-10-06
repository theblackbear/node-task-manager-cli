import type { TaskService } from '../services/task-service.js';

export async function addCommand(service: TaskService, title: string): Promise<void> {
  const task = await service.add(title);
  console.log(`Tarefa adicionada: ${task.id} - ${task.title}`);
}
