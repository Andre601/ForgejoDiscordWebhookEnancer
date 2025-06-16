export const EventFlags = {
  PUSH: 1 << 0,              // 1
  RELEASE_PUBLISH: 1 << 1,   // 2
  RELEASE_EDIT: 1 << 2,      // 4
  ISSUE_CREATED: 1 << 3,     // 8
  PR_OPENED: 1 << 4,         // 16
};

export const EventLabels: Record<keyof typeof EventFlags, string> = {
  PUSH: 'Push Events',
  RELEASE_PUBLISH: 'Release Published',
  RELEASE_EDIT: 'Release Edited',
  ISSUE_CREATED: 'Issue Created',
  PR_OPENED: 'Pull Request Opened',
};

export type EventKey = keyof typeof EventFlags;

export const determineExactEvent = (header: string, body: any): EventKey | null => {
  if (header === 'push') return 'PUSH';
  if (header === 'release') {
    if (body?.action === 'publish') return 'RELEASE_PUBLISH';
    if (body?.action === 'edit') return 'RELEASE_EDIT';
  }
  if (header === 'issues' && body?.action === 'opened') return 'ISSUE_CREATED';
  if (header === 'pull_request' && body?.action === 'opened') return 'PR_OPENED';
  return null;
};
