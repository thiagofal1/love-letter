const playerElement =
  document.querySelector<HTMLElement>('#spotify-player')

if (playerElement) {
  (window as any).onSpotifyIframeApiReady = (IFrameAPI: { createController: (arg0: HTMLElement, arg1: { width: string; height: number; uri: string }, arg2: () => void) => void }) => {
    IFrameAPI.createController(
      playerElement,
      {
        width: '100%',
        height: 152,
        uri: 'spotify:playlist:2GQUVltP1fAKGYhIDdBkNf',
      },
      () => {},
    )
  }
}