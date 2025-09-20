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
  PR_CLOSE: 1 << 8,
  PR_MERGE: 1 << 9,
};

export const EventLabels: Record<keyof typeof EventFlags, string> = {
  // Pushes
  PUSH: 'Commit Push',
  // Releases
  RELEASE_PUBLISH: 'Release Published',
  RELEASE_EDIT:    'Release Edited',
  RELEASE_DELETE:  'Release Deleted',
  // Issues
  ISSUE_CREATE: 'Issue Opened',
  ISSUE_EDIT:   'Issue Edited',
  ISSUE_CLOSE:  'Issue Closed',
  // Pull requests
  PR_CREATE: 'Pull Request Opened',
  PR_CLOSE:  'Pull Request Closed',
  PR_MERGE:  'Pull Request Merged'
};

export type EventKey = keyof typeof EventFlags;

export const determineExactEvent = (header: string, body: any): EventKey | null => {
  switch (header) {
    case 'push':
      return 'PUSH';
    case 'release':
      switch (body?.action) {
        case 'published':
          return 'RELEASE_PUBLISH';
        case 'updated':
          return 'RELEASE_EDIT';
        case 'deleted':
          return 'RELEASE_DELETE';
      }
    case 'issues':
      switch (body?.action) {
        case 'opened':
          return 'ISSUE_CREATE';
        case 'edited':
          return 'ISSUE_EDIT';
        case 'closed':
          return 'ISSUE_CLOSE';
      }
    case 'pull_request':
      if (body?.action === 'opened')
        return 'PR_CREATE';
      if (body?.action === 'closed') {
        if (body?.pull_request?.merged) {
          return 'PR_MERGE';
        } else {
          return 'PR_CLOSE';
        }
      }
  }
  return null;
};
