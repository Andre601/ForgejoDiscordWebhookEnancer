import { NextApiRequest, NextApiResponse } from 'next';
import { EventFlags, determineExactEvent } from '../../../lib/events';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, token, code } = req.query;

  if (!id || !token || !code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const rawBody = req.body;
  const header = req.headers['x-gitea-event'] as string;
  const decodedFlags = parseInt(code, 36); // decode base36

  const event = determineExactEvent(header, rawBody);
  if (!event || (EventFlags[event] & decodedFlags) !== EventFlags[event]) {
    return res.status(403).json({ error: 'Event not allowed or unknown' });
  }

  const discordUrl = `https://discord.com/api/webhooks/${id}/${token}`;
  const payload = createDiscordMessage(event, rawBody);

  await fetch(discordUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  res.status(200).json({ success: true });
}

const createDiscordMessage = (event: string, body: any) => {
  switch (event) {
    case 'PUSH':
      return {
        content: `📤 Push to \`${body.repository?.full_name}\` by ${body.pusher?.username}`,
      };
    case 'RELEASE_PUBLISH':
      return {
        content: `📦 New release published: **${body.release?.name || body.release?.tag_name}**`,
      };
    case 'RELEASE_EDIT':
      return {
        content: `✏️ Release edited: **${body.release?.tag_name}**`,
      };
    case 'ISSUE_CREATED':
      return {
        content: `🐞 New issue opened: **${body.issue?.title}** by ${body.sender?.username}`,
      };
    case 'PR_OPENED':
      return {
        content: `📬 Pull request opened: **${body.pull_request?.title}** by ${body.sender?.username}`,
      };
    default:
      return { content: '🛎️ Unrecognized event' };
  }
};

export const config = {
  api: {
    bodyParser: true,
  },
};
