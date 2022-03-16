import { respondInJson } from './utils/http-utils.ts';

export interface HttpError extends Error {
  status?: number;
}

export class ApiError implements HttpError {
  constructor(public name: string, public message: string, public status = 500) {}
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super('InvalidRequest', message, 400);
  }
}

export const mapErrorToResponse = (err: HttpError): Response => {
  const name = err.name ? err.name : err.constructor.name;
  const message = err.message;
  const stack = err.stack ? prettifyStack(err.stack) : undefined;
  const status = err.status ?? 500;

  return respondInJson(
    { error: { name, message, stack } },
    { status },
  );
};

const prettifyStack = (stack: string) =>
  stack
    .split('\n')
    .map((line) => line.replace('at', '').trim())
    .map((line) => line.replace(Deno.cwd(), '.'))
    .slice(1);
