import app from '../server/index.js';

export default function handler(req, res) {
  // Normalize incoming serverless request path if stripped by Vercel
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/assets')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
