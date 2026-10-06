import type { TaskService } from '../services/task-service.js';

export async function listCommand(service: TaskService): Promise<void> {
  const tasks = await service.list();
  if (tasks.length === 0) {
    console.log('Nenhuma tarefa cadastrada.');
    return;
  }
  for (const task of tasks) {
    console.log(`[${task.completed ? 'x' : ' '}] ${task.id} - ${task.title}`);
  }
}
