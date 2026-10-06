import { fileURLToPath } from 'node:url';
import { runCli } from './cli.js';
import { JsonTaskRepository } from './repositories/json-task-repository.js';
import { TaskService } from './services/task-service.js';

// O caminho é relativo ao programa, independentemente da pasta do terminal.
const filePath = fileURLToPath(new URL('../data/tasks.json', import.meta.url));
const service = new TaskService(new JsonTaskRepository(filePath));

try {
  await runCli(process.argv.slice(2), service);
} catch (error) {
  console.error(`Erro: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
