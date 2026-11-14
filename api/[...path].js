export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } },
};

export default async function handler(request, response) {
  const backend = process.env.RAILWAY_API_URL;
  if (!backend) return response.status(503).json({ error: 'The API service is not configured.' });

  try {
    const base = new URL(backend);
    const target = new URL(request.url, base);
    if (target.origin !== base.origin || !target.pathname.startsWith('/api/')) {
      return response.status(400).json({ error: 'Invalid API path.' });
    }

    const headers = new Headers();
    for (const name of ['accept', 'content-type', 'cookie', 'origin', 'user-agent']) {
      const value = request.headers[name];
      if (typeof value === 'string') headers.set(name, value);
    }

    const method = request.method || 'GET';
    let body;
    if (!['GET', 'HEAD'].includes(method)) {
      if (Buffer.isBuffer(request.body) || typeof request.body === 'string') body = request.body;
      else if (request.body !== undefined) body = JSON.stringify(request.body);
      else body = request;
    }
    const upstream = await fetch(target, {
      method,
      headers,
      body,
      ...(body === request ? { duplex: 'half' } : {}),
      redirect: 'manual',
    });

    response.statusCode = upstream.status;
    response.setHeader('cache-control', 'no-store');
    for (const name of ['content-type', 'vary', 'access-control-allow-origin', 'access-control-allow-credentials']) {
      const value = upstream.headers.get(name);
      if (value) response.setHeader(name, value);
    }
    const cookies = upstream.headers.getSetCookie?.() || [];
    if (cookies.length) response.setHeader('set-cookie', cookies);
    if (method === 'HEAD' || upstream.status === 204) return response.end();
    return response.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    console.error('API proxy request failed:', error);
    return response.status(502).json({ error: 'The API service could not be reached.' });
  }
}
