// Veřejné proměnné se čtou přímo přes process.env.NAME, aby je Next.js nahradil při buildu.
// Chybějící hodnota shodí build/start explicitní chybou místo tichého výchozího stavu.
function requiredPublicEnv(name: string, value: string | undefined): string {
  const trimmed = value?.trim();

  if (!trimmed) {
    throw new Error(`${name} environment variable is required`);
  }

  return trimmed;
}

export const publicEnv = {
  apiUrl: requiredPublicEnv('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL),
  googleClientId: requiredPublicEnv(
    'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  ),
} as const;
