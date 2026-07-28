export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export const sendJson = (response, status, payload) => {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
};

export const readJson = async (request) => new Promise((resolve, reject) => {
  let body = '';
  request.on('data', (chunk) => { body += chunk; if (body.length > 1_000_000) request.destroy(); });
  request.on('end', () => {
    if (!body) return resolve({});
    try { resolve(JSON.parse(body)); } catch { reject(new HttpError(400, 'Nieprawidłowy format JSON.')); }
  });
  request.on('error', reject);
});

export const handleError = (response, error) => {
  const status = error instanceof HttpError ? error.status : 500;
  if (status === 500) console.error(error);
  sendJson(response, status, { message: status === 500 ? 'Wystąpił nieoczekiwany błąd serwera.' : error.message });
};
