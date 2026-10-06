# Task Manager CLI

Gerenciador de tarefas em Node.js e TypeScript com persistência local em JSON. A aplicação usa somente APIs nativas em execução; TypeScript e Vitest são ferramentas de desenvolvimento.

## Começar

Instale Node.js 22 ou superior, que inclui o npm. No terminal, dentro desta pasta:

```bash
npm install
npm run task -- add "Estudar Node.js"
npm run task -- list
npm run task -- complete <id>
npm run task -- remove <id>
```

Substitua `<id>` pelo UUID completo exibido ao adicionar ou listar. As aspas mantêm o título com espaços em um único argumento.

```text
[ ] 5bc77b12-bdd2-439b-98c0-5dbf861b08e4 - Estudar Node.js
[x] 92ae60ab-8433-4574-a9b4-50f284ade9bf - Estudar TypeScript
```

`npm run task -- --help` mostra a ajuda. O script compila o TypeScript antes de executar o JavaScript. O primeiro `--` é do npm: ele encaminha os argumentos seguintes ao programa.

## Etapa 1: modelo e persistência

`src/models/task.ts` descreve a entidade. Uma interface TypeScript verifica tipos durante o desenvolvimento, mas não valida dados lidos em execução. Por isso, `JsonTaskRepository` também verifica o formato do JSON.

`TaskRepository` define duas operações: ler todas as tarefas e salvar a lista. `JsonTaskRepository` implementa esse contrato com `readFile`, `mkdir` e `writeFile` de `node:fs/promises`. `JSON.parse` converte texto em dados e `JSON.stringify` faz o caminho inverso.

As tarefas ficam em `data/tasks.json`. Se o arquivo não existir, a leitura retorna uma lista vazia; a primeira gravação cria a pasta e o arquivo. Erros de permissão e arquivos inválidos são reportados. O caminho é calculado a partir do programa, independentemente da pasta atual do terminal.

## Etapa 2: regras de negócio

`TaskService` recebe um repositório pelo construtor. Ele normaliza e valida o título, gera o ID com `randomUUID()` de `node:crypto`, define `completed: false` e registra a data em ISO 8601 com `new Date().toISOString()`.

Para completar ou remover, busca o UUID exato. Se não encontrar, lança `TaskNotFoundError`. Completar uma tarefa já concluída mantém seu estado concluído.

Todas as operações de arquivo são assíncronas: `await` aguarda a operação terminar antes de continuar. O serviço aguarda a gravação antes de informar sucesso.

## Etapa 3: comandos e entrada

```text
index.ts → CLI → Command → TaskService → TaskRepository → JSON
```

`index.ts` conecta o repositório ao serviço e captura erros. `cli.ts` interpreta `process.argv.slice(2)`: os dois primeiros argumentos são o executável Node e o arquivo executado. Cada arquivo em `commands/` chama o serviço e apresenta o resultado.

Erros são enviados a `console.error`, e `process.exitCode = 1` sinaliza falha ao terminal sem interromper abruptamente o processo. Comandos desconhecidos, argumentos faltantes e argumentos extras retornam mensagens de uso.

Os imports TypeScript usam a extensão `.js` porque esse será o nome dos arquivos compilados no modo ESM (`"type": "module"`).

## Verificar

```bash
npm run typecheck
npm test
npm run build
```

Os testes cobrem criação, persistência entre instâncias, conclusão, remoção, títulos vazios, IDs ausentes, JSON inválido e comandos da CLI. Cada teste usa uma pasta temporária, removida ao terminar.

## Limites desta primeira versão

A cada alteração, a aplicação lê e regrava a lista inteira. Use um comando por vez: processos simultâneos podem sobrescrever alterações uns dos outros. A gravação direta também pode ser interrompida; uma próxima etapa pode introduzir gravação atômica e controle de concorrência após compreender este fluxo básico.

O comando global `task` ainda não está registrado. Nesta etapa, a interface é `npm run task -- ...`; um próximo passo é estudar o campo `bin` do npm para disponibilizar o executável.
