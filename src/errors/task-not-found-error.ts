export class TaskNotFoundError extends Error {
  constructor(id: string) {
    super(`Tarefa com ID "${id}" não encontrada.`);
    this.name = 'TaskNotFoundError';
  }
}
