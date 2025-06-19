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
  const decodedFlags = parseInt(code, 36);

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

const payloadCreator = (event: string, body: any) => {
  switch (event) {
    case 'PUSH':
      return {
        embeds: {
          title: `[${body.repository?.full_name}:${body.ref}] ${body.commits?.size()} new commits`,
          color: 1754624,
        }
      }
    case 'RELEASE_PUBLISH':
      return {
        embeds: {
          title: `[${body.repository?.full_name}] Release created: ${body.release?.name}`,
          description: `${body.release?.body}`,
          url: `${body.release?.html_url}`,
          color: 1754624,
          author: {
            name: `${body.release?.author?.login}`,
            url: `${body.release?.author?.html_url}`,
            icon_url: `${body.release?.author?.avatar_url}`
          }
        }
      }
    case 'RELEASE_EDIT':
      return {
        embeds: {
          title: `[${body.repository?.full_name}] Release updated: ${body.release?.name}`,
          description: `${body.release?.body}`,
          url: `${body.release?.html_url}`,
          color: 16767280,
          author: {
            name: `${body.release?.author?.login}`,
            url: `${body.release?.author?.html_url}`,
            icon_url: `${body.release?.author?.avatar_url}`
          }
        }
      }
    case 'RELEASE_DELETE':
      return {
        embeds: {
          title: `[${body.repository?.full_name}] Release deleted: ${body.release?.name}`,
          description: `${body.release?.body}`,
          url: `${body.release?.html_url}`,
          color: '16724530',
          author: {
            name: `${body.release?.author?.login}`,
            url: `${body.release?.author?.html_url}`,
            icon_url: `${body.release?.author?.avatar_url}`
          }
        }
      }
    case 'ISSUE_CREATE':
      return {
        embeds: {
          title: `[${body.repository?.full_name}] Issue opened: #${body.number} ${body.issue?.title}`,
          description: `${body.issue?.body}`,
          url: `${body.issue?.html_url}`,
          color: 15426592,
          author: {
            name: `${body.issue?.user?.login}`,
            url: `${body.issue?.user?.html_url}`,
            icon_url: `${body.issue?.user?.avatar_url}`
          }
        }
      }
    case 'ISSUE_EDIT':
      return {
        embeds: {
          title: `[${body.repository?.full_name}] Issue edited: #${body.number} ${body.issue?.title}`,
          description: `${body.issue?.body}`,
          url: `${body.issue?.html_url}`,
          color: 16767280,
          author: {
            name: `${body.issue?.user?.login}`,
            url: `${body.issue?.user?.html_url}`,
            icon_url: `${body.issue?.user?.avatar_url}`
          }
        }
      }
    case 'ISSUE_EDIT':
      return {
        embeds: {
          title: `[${body.repository?.full_name}] Issue closed: #${body.number} ${body.issue?.title}`,
          description: `${body.issue?.body}`,
          url: `${body.issue?.html_url}`,
          color: 16724530,
          author: {
            name: `${body.issue?.user?.login}`,
            url: `${body.issue?.user?.html_url}`,
            icon_url: `${body.issue?.user?.avatar_url}`
          }
        }
      }
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
