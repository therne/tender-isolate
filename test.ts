const worker = (self as unknown) as Worker;

const input = await new Promise((resolve) => {
  worker.onmessage = (e: MessageEvent) => {
    console.log(`Received ${JSON.stringify(e.data)}`);
    resolve(e.data);
  };
});

console.log(`Also Received ${input}`);
worker.postMessage(JSON.stringify({ output: 'hello from isolate' }));
