import { addCommand } from './commands/add.js';
import { listCommand } from './commands/list.js';
import { completeCommand } from './commands/complete.js';
import { removeCommand } from './commands/remove.js';
import type { TaskService } from './services/task-service.js';

const usage = `Uso:
  npm run task -- add "Título da tarefa"
  npm run task -- list
  npm run task -- complete <id>
  npm run task -- remove <id>`;

export async function runCli(args: string[], service: TaskService): Promise<void> {
  const [command, argument, ...extra] = args;
  if (command === undefined || command === '--help' || command === '-h') {
    console.log(usage);
    return;
  }
  if (command === 'list') {
    if (argument !== undefined) throw new Error(`O comando list não recebe argumentos.\n${usage}`);
    await listCommand(service);
    return;
  }
  if (command === 'add' || command === 'complete' || command === 'remove') {
    if (argument === undefined || extra.length > 0) {
      throw new Error(`Argumentos inválidos para ${command}.\n${usage}`);
    }
    if (command === 'add') await addCommand(service, argument);
    else if (command === 'complete') await completeCommand(service, argument);
    else await removeCommand(service, argument);
    return;
  }
  throw new Error(`Comando desconhecido: ${command}.\n${usage}`);
}
