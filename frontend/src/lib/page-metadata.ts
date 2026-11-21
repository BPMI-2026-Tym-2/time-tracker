import type { Metadata } from 'next';

const metadataByRoute = {
  '/': {
    title: 'Time Tracker',
    description: 'Track your time and tasks efficiently with Time Tracker.',
  },
  '/profile': {
    title: 'My account | Time Tracker',
    description: 'View your Time Tracker profile.',
  },
} satisfies Record<string, Metadata>;

type MetadataRoute = keyof typeof metadataByRoute;

export function getPageMetadata(route: MetadataRoute): Metadata {
  return metadataByRoute[route];
}
