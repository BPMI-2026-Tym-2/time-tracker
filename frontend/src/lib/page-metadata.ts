import type { Metadata } from 'next';

const metadataByRoute = {
  '/': {
    title: 'Time Tracker',
    description: 'Track your time and tasks efficiently with Time Tracker.',
  },
  '/users': {
    title: 'Seznam uživatelů | Time Tracker',
  },
} satisfies Record<string, Metadata>;

type MetadataRoute = keyof typeof metadataByRoute;

export function getPageMetadata(route: MetadataRoute): Metadata {
  return metadataByRoute[route];
}
