import { IsolateConfig } from './IsolateConfig.ts';

export class Isolate {
  constructor(private config: IsolateConfig) {}

  /**
   * Runs a remote script in a isolated sandbox environment.
   *
   * @param url remote code URL.
   * @param input a data injected into the script.
   * @returns output returned from the script.
   */
  run(url: string, input: unknown): Promise<unknown> {
    const realURL = url.match(/^https?:\/\//) ? url : new URL(url, import.meta.url).href;
    console.log(realURL);
    const worker = new Worker(realURL, {
      type: 'module',
      deno: {
        permissions: 'none',
      },
    });

    return new Promise<any>((resolve) => {
      worker.onmessage = ({ data }: MessageEvent) => {
        worker.terminate();
        resolve(data);
      };
      worker.postMessage(input);
    });
  }
}
