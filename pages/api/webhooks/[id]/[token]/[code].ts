import { NextApiRequest, NextApiResponse } from 'next';
import { EventFlags, determineExactEvent } from '../../../../../lib/events';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, token, code } = req.query;

  if (!id || !token || !code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const rawBody = req.body;
  const header = req.headers['x-gitea-event'] as string;
  const decodedFlags = parseInt(code, 36);

  const event = determineExactEvent(header, rawBody);
  if (!event || (EventFlags[event] & decodedFlags) !== EventFlags[event]) {
    return res.status(204).end();
  }

  const discordUrl = `https://discord.com/api/webhooks/${id}/${token}`;
  const payload = payloadCreator(event, rawBody);

  await fetch(discordUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(response => {
    if (!response.ok) {
      res.status(response.status).json({ error: `Failed POST request towards Discord. Received ${response.status}.` });
    } else {
      console.log(JSON.stringify(payload))
      res.status(204).end();
    }
  });
};

const payloadCreator = (event: string, body: any) => {
  switch (event) {
    case 'PUSH':
      const ref = body.ref.substring(11);
      const commitText = body.total_commits > 1 ? `${body.total_commits} new commits` : '1 new commit';
      let commitList: string = "";
      for(var commit of body.commits) {
        var temp = commitTextCreator(commit);
        if (commitList.length + temp.length + 2 > 4000)
          break;

        commitList = commitList + '\n' + temp;
      }
      return {
        embeds: [
          {
            title: `[${body.repository?.full_name}:${ref}] ${commitText}`,
            description: `${commitList}`,
            color: 1754624,
            url: `${body.compare_url}`
          }
        ]
      };
    case 'RELEASE_PUBLISH':
      return {
        embeds: [
          {
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
        ]
      };
    case 'RELEASE_EDIT':
      return {
        embeds: [
          {
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
        ]
      };
    case 'RELEASE_DELETE':
      return {
        embeds: [
          {
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
        ]
      };
    case 'ISSUE_CREATE':
      return {
        embeds: [
          {
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
        ]
      };
    case 'ISSUE_EDIT':
      return {
        embeds: [
          {
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
        ]
      };
    case 'ISSUE_CLOSE':
      return {
        embeds: [
          {
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
        ]
      };
    case 'PR_CREATE':
      return {
        embeds: [
          {
            title: `[${body.repository?.full_name}] Pull request opened: #${body.number} ${body.pull_request?.title}`,
            description: '',
            url: `${body.pull_request?.url}`,
            color: 1754624,
            author: {
              name: `${body.pull_request?.user?.login}`,
              url: `${body.pull_request?.user?.html_url}`,
              icon_url: `${body.pull_request?.user?.avatar_url}`
            }
          }
        ]
      }
    case 'PR_CLOSED':
      return {
        embeds: [
          {
            title: `[${body.repository?.full_name}] Pull request closed: #${body.number} ${body.pull_request?.title}`,
            description: '',
            url: `${body.pull_request?.url}`,
            color: 16724530,
            author: {
              name: `${body.pull_request?.user?.login}`,
              url: `${body.pull_request?.user?.html_url}`,
              icon_url: `${body.pull_request?.user?.avatar_url}`
            }
          }
        ]
      }
    case 'PR_MERGED':
      return {
        embeds: [
          {
            title: `[${body.repository?.full_name}] Pull request merged: #${body.number} ${body.pull_request?.title}`,
            description: '',
            url: `${body.pull_request?.url}`,
            color: 7506394,
            author: {
              name: `${body.pull_request?.user?.login}`,
              url: `${body.pull_request?.user?.html_url}`,
              icon_url: `${body.pull_request?.user?.avatar_url}`
            }
          }
        ]
      }
  }
};

const commitTextCreator = (commit: any): string => {
  const hash = commit.id.substring(0, 7);
  const message = commit.message.length > 44 ? commit.message.substring(0, 44) + '...' : commit.message;

  return `[${hash}](${commit.url}) ${message} - ${commit.author?.name}`
}

export const config = {
  api: {
    bodyParser: true,
  },
};
