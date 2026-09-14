export function parseSpotifyUri(input?: string): string {
  if (!input) return '';
  if (input.startsWith('spotify:')) return input;

  const match = input.match(/(playlist|album|track)\/([a-zA-Z0-9]+)/);
  if (match) return `spotify:${match[1]}:${match[2]}`;

  return '';
}