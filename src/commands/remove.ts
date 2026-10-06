import type { TaskService } from '../services/task-service.js';

export async function removeCommand(service: TaskService, id: string): Promise<void> {
  await service.remove(id);
  console.log(`Tarefa removida: ${id}`);
}
