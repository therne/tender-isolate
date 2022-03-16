#!/usr/bin/env deno run --allow-run

const TASKS: { [taskName: string]: () => Promise<any> } = {
  async start() {
    await exec('deno', 'run', '--config', './deno.json', '--allow-all', '--unstable', './src/app.ts');
  },
  async install() {
    await exec('echo', 'Installing stuff....');
    // do other things
  },
};

// below is library code

async function exec(...args: string[]) {
  const proc = await Deno.run({ cmd: args }).status();
  if (proc.success == false) {
    Deno.exit(proc.code);
  }
  return proc;
}

const printUsageAndExit = (code = 1) => {
  console.error(`usage: ./Taskfile.ts <${Object.keys(TASKS).join('|')}>`);
  Deno.exit(code);
};

const taskName = Deno.args[0];
if (!taskName) {
  console.error(`Taskfile: you need to provide a task.`);
  printUsageAndExit();
}

const taskHandler = TASKS[taskName];
if (!taskHandler) {
  console.error(`Taskfile: unknown task: "${taskName}".`);
  printUsageAndExit();
}
