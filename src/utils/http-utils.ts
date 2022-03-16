export const removeTrailingSlash = (s: string): string => s !== '/' ? s.replace(/\/+$/, '') : '/';

export const respondInJson = (json: object, responseInit?: ResponseInit) =>
  new Response(
    JSON.stringify(json),
    {
      headers: Object.assign({ 'Content-Type': 'application/json' }, responseInit?.headers ?? {}),
      status: 200 ?? responseInit?.status,
      statusText: responseInit?.statusText,
    },
  );
