import { assertEquals } from 'https://deno.land/std@0.129.0/testing/asserts.ts';
import { Isolate } from './Isolate.ts';
import { IsolateConfig } from './IsolateConfig.ts';

Deno.test('Isolate', async (t) => {
  const isolate = new Isolate(new IsolateConfig());

  await t.step('run()', async () => {
    const output = await isolate.run('../../test.ts', {});
    assertEquals(output, JSON.stringify({ output: 'hello from isolate' }));
  });
});
