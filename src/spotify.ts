export function parseSpotifyUri(input?: string): string {
  if (!input) return 'spotify:playlist:2GQUVltP1fAKGYhIDdBkNf';
  if (input.startsWith('spotify:')) return input;

  const match = input.match(/(playlist|album|track)\/([a-zA-Z0-9]+)/);
  if (match) {
    return `spotify:${match[1]}:${match[2]}`;
  }

  return 'spotify:playlist:2GQUVltP1fAKGYhIDdBkNf';
}

export function initSpotifyPlayer(
  playlistInput?: string,
  root: HTMLElement | Document = document
) {
  const playerElement = root.querySelector<HTMLElement>('#spotify-player');
  if (!playerElement) return;

  const uri = parseSpotifyUri(playlistInput);

  // If iframe API is already loaded
  if ((window as any).SpotifyIframeApi) {
    (window as any).SpotifyIframeApi.createController(
      playerElement,
      { width: '100%', height: 152, uri },
      () => {}
    );
  } else {
    (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
      (window as any).SpotifyIframeApi = IFrameAPI;
      IFrameAPI.createController(
        playerElement,
        { width: '100%', height: 152, uri },
        () => {}
      );
    };
  }
}