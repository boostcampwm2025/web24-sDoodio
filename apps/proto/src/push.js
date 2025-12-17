import path from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';
import webpush from 'web-push';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const VAPID_SUBJECT = 'mailto:proto@example.com';
const VAPID_PUBLIC_KEY = 'BFHI8GxumF8CO4lNqlwKoGM5hLGsTeQLRw9NbutUsT6NQ55SNkWLUVp-s18doL2Gk7VNJnrbdsgr15a57mMMN2w';
const VAPID_PRIVATE_KEY = 'M8MsN069sNygzZk0u2E2vfVp-1TlhppwRv0tcCd7PX4';

const app = express();
app.use(express.json());

const subscriptionByEndpoint = new Map();

app.get('/vapid/public-key', async (_req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

app.post('/subscriptions', async (req, res) => {
  subscriptionByEndpoint.set(req.body.endpoint, req.body);
  res.json({ ok: true, count: subscriptionByEndpoint.size });
});

app.post('/push/test', async (req, res) => {
  const payload = JSON.stringify({
    title: 'Web Push Prototype',
    body: 'Test push from proto server.',
    url: '/',
  });

  const subscriptions = [...subscriptionByEndpoint.values()];
  if (subscriptions.length === 0) {
    res.status(400).json({ ok: false, error: 'No subscriptions stored' });
    return;
  }

  let sent = 0;
  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, payload);
        sent += 1;
      } catch {}
    }),
  );

  res.json({
    sent,
    total: subscriptions.length,
  });
});

const frontendDistDir = path.join(__dirname, '..', '..', 'frontend', 'dist');
const frontendIndexHtml = path.join(frontendDistDir, 'index.html');
app.use(express.static(frontendDistDir));
app.get('*', (_req, res) => {
  res.sendFile(frontendIndexHtml);
});

async function main() {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  app.listen(PORT, () => {
    console.log(`[proto-push] listening on http://localhost:${PORT}`);
  });
}

main()
