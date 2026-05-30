import { buffer } from 'node:stream/consumers';
import server from '../src/server';

export default async function handler(req: any, res: any) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const url = new URL(req.url ?? '', `${protocol}://${host}`);

  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await buffer(req);
  const request = new Request(url.toString(), {
    method: req.method,
    headers: req.headers as HeadersInit,
    body: body && body.length ? body : undefined,
  });

  const response = await server.fetch(request, process.env, {});

  res.status(response.status);
  response.headers.forEach((value, name) => {
    res.setHeader(name, value);
  });

  if (response.body) {
    const arrayBuffer = await response.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } else {
    res.end();
  }
}
