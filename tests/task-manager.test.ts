import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runCli } from '../src/cli.js';
import { TaskNotFoundError } from '../src/errors/task-not-found-error.js';
import { JsonTaskRepository } from '../src/repositories/json-task-repository.js';
import { TaskService } from '../src/services/task-service.js';

let directory: string;
let filePath: string;
let service: TaskService;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'task-manager-'));
  filePath = join(directory, 'data', 'tasks.json');
  service = new TaskService(new JsonTaskRepository(filePath));
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(directory, { recursive: true, force: true });
});

describe('Tarefas e persistência JSON', () => {
  it('lista vazia quando o arquivo ainda não existe', async () => {
    expect(await service.list()).toEqual([]);
  });

  it('adiciona com título normalizado, UUID, data e persiste entre instâncias', async () => {
    const task = await service.add('  Estudar Node.js  ');
    expect(task.title).toBe('Estudar Node.js');
    expect(task.completed).toBe(false);
    expect(task.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(new Date(task.createdAt).toISOString()).toBe(task.createdAt);
    const reloaded = new TaskService(new JsonTaskRepository(filePath));
    expect(await reloaded.list()).toEqual([task]);
  });

  it('rejeita títulos vazios sem criar uma tarefa', async () => {
    await expect(service.add('   ')).rejects.toThrow('título');
    expect(await service.list()).toEqual([]);
  });

  it('completa e remove apenas a tarefa solicitada', async () => {
    const first = await service.add('Node.js');
    const second = await service.add('TypeScript');
    await service.complete(first.id);
    expect(await service.list()).toEqual([{ ...first, completed: true }, second]);
    await service.remove(first.id);
    expect(await service.list()).toEqual([second]);
  });

  it('informa IDs inexistentes e preserva as tarefas', async () => {
    const task = await service.add('Preservar');
    await expect(service.complete('inexistente')).rejects.toBeInstanceOf(TaskNotFoundError);
    await expect(service.remove('inexistente')).rejects.toBeInstanceOf(TaskNotFoundError);
    expect(await service.list()).toEqual([task]);
  });

  it.each(['{quebrado', '{}', '[{"id": 123}]'])('rejeita arquivo inválido sem sobrescrevê-lo: %s', async (content) => {
    filePath = join(directory, 'tasks.json');
    await writeFile(filePath, content, 'utf8');
    service = new TaskService(new JsonTaskRepository(filePath));
    await expect(service.add('Nova')).rejects.toThrow('inválido');
    expect(await readFile(filePath, 'utf8')).toBe(content);
  });
});

describe('CLI', () => {
  it('executa o ciclo completo de comandos e exibe os estados', async () => {
    const output = vi.spyOn(console, 'log').mockImplementation(() => {});
    await runCli(['add', 'Estudar Node.js'], service);
    const [task] = await service.list();
    if (!task) throw new Error('A tarefa deveria ter sido criada.');
    await runCli(['list'], service);
    expect(output).toHaveBeenCalledWith(`[ ] ${task.id} - Estudar Node.js`);
    await runCli(['complete', task.id], service);
    await runCli(['list'], service);
    expect(output).toHaveBeenCalledWith(`[x] ${task.id} - Estudar Node.js`);
    await runCli(['remove', task.id], service);
    await runCli(['list'], service);
    expect(output).toHaveBeenCalledWith('Nenhuma tarefa cadastrada.');
  });

  it.each([['desconhecido'], ['add'], ['complete'], ['remove'], ['list', 'extra'], ['add', 'um', 'dois']])(
    'rejeita comando ou argumentos inválidos: %j', async (...args) => {
      await expect(runCli(args, service)).rejects.toThrow();
      expect(await service.list()).toEqual([]);
    },
  );
});
