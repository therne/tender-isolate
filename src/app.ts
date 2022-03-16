import { ConnInfo, Handler, serve } from 'https://deno.land/std@0.129.0/http/server.ts';
import { loadAndValidateConfig } from './config.ts';
import * as Constants from './constants.ts';
import { mapErrorToResponse } from './errors.ts';
import { Isolate } from './isolate/Isolate.ts';
import { removeTrailingSlash, respondInJson } from './utils/http-utils.ts';

const config = loadAndValidateConfig();
const isolate = new Isolate(config.isolate);

const apiRoutes: { [path: string]: Handler } = {
  '/'() {
    return respondInJson({
      version: Constants.VERSION,
      msg: 'all systems go',
    });
  },

  async '/isolate'(req: Request) {
    const { searchParams } = new URL(req.url);

    const url = searchParams.get('url');
    if (!url) {
      return respondInJson({ error: { type: 'ValidationFailed', message: 'param \'url\' is missing' } }, {
        status: 400,
      });
    }
    const inputJson = searchParams.get('input');
    if (!inputJson) {
      return respondInJson({ error: { type: 'ValidationFailed', message: 'param \'input\' is missing' } }, {
        status: 400,
      });
    }
    const input = JSON.parse(inputJson);

    const output = await isolate.run(url, input);
    return new Response(output as BodyInit, { status: 200 });
  },
};

const apiRequestRouter: Handler = async (req: Request, connInfo: ConnInfo) => {
  const { pathname } = new URL(req.url);
  const normalizedPath = removeTrailingSlash(pathname);

  try {
    const handler = apiRoutes[normalizedPath];
    if (!handler) {
      return respondInJson({ error: { type: 'NotFound', message: 'not found' } }, { status: 404 });
    }
    return await handler(req, connInfo);
  } catch (err) {
    console.log(err);
    return mapErrorToResponse(err as Error);
  }
};

console.log(`tender-isolate listening on localhost:${config.port}`);
await serve(apiRequestRouter, { port: config.port });
