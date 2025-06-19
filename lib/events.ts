export const EventFlags = {
  // Pushes
  PUSH: 1 << 0,
  // Releases
  RELEASE_PUBLISH: 1 << 1,
  RELEASE_EDIT: 1 << 2,
  RELEASE_DELETE: 1 << 3,
  // Issues
  ISSUE_CREATE: 1 << 4,
  ISSUE_EDIT: 1 << 5,
  ISSUE_CLOSE: 1 << 6,
  // Pull requests
  PR_CREATE: 1 << 7,
};

export type EventKey = keyof typeof EventFlags;

export const determineExactEvent = (header: string, body: any): EventKey | null => {
  if (header === 'push') return 'PUSH';
  if (header === 'release') {
    if (body?.action === 'published') return 'RELEASE_PUBLISH';
    if (body?.action === 'updated') return 'RELEASE_EDIT';
    if (body?.action === 'deleted') return 'RELEASE_DELETE';
  };
  if (header === 'issues') {
    if (body?.action === 'opened') return 'ISSUE_CREATE';
    if (body?.action === 'edited') return 'ISSUE_EDIT';
    if (body?.action === 'closed') return 'ISSUE_CLOSE';
  };
  if (header === 'pull_request' && body?.action === 'opened') return 'PR_CREATE';
  return null;
};
