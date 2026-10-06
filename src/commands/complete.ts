import type { TaskService } from '../services/task-service.js';

export async function completeCommand(service: TaskService, id: string): Promise<void> {
  const task = await service.complete(id);
  console.log(`Tarefa concluída: ${task.id} - ${task.title}`);
}
