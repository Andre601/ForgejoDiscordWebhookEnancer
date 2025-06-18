import { NextApiRequest, NextApiResponse } from 'next';
import { EventFlags, determineExactEvent } from '../../../../../lib/events';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, token, code } = req.query;

  if (!id || !token || !code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed!' });
  }

  const rawBody = req.body;
  const header = req.headers['x-gitea-event'] as string;
  const decodedFlags = parseInt(code, 36); // decode base36

  const event = determineExactEvent(header, rawBody);
  if (!event || (EventFlags[event] & decodedFlags) !== EventFlags[event]) {
    return res.status(204).end();
  }

  const discordUrl = `https://discord.com/api/webhooks/${id}/${token}`;
  const payload = rawBody;

  await fetch(discordUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  res.status(204).end();
};

export const config = {
  api: {
    bodyParser: true,
  },
};
