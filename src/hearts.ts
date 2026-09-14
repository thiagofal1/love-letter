const emojis = ['💕', '❤️', '🤍', '❤️‍🩹', '💝', '💌', '✨'];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export function startHeartsAnimation(): () => void {
  if (prefersReducedMotion.matches) return () => {};

  let intervalId: number | undefined;
  const timeouts: number[] = [];

  function createFloatingEmoji() {
    const emoji = document.createElement('span');
    const duration = 5 + Math.random() * 4;

    emoji.className = 'floating-emoji';
    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    emoji.setAttribute('aria-hidden', 'true');
    emoji.style.setProperty('--emoji-left', `${Math.random() * 100}%`);
    emoji.style.setProperty('--emoji-size', `${1 + Math.random() * 1.4}rem`);
    emoji.style.setProperty('--emoji-drift', `${-5 + Math.random() * 10}vw`);
    emoji.style.setProperty('--emoji-duration', `${duration}s`);

    document.body.append(emoji);
    const t = window.setTimeout(() => emoji.remove(), duration * 1000);
    timeouts.push(t);
  }

  for (let index = 0; index < 8; index += 1) {
    const t = window.setTimeout(createFloatingEmoji, index * 280);
    timeouts.push(t);
  }

  intervalId = window.setInterval(createFloatingEmoji, 750);

  return () => {
    if (intervalId) clearInterval(intervalId);
    timeouts.forEach(clearTimeout);
    document.querySelectorAll('.floating-emoji').forEach((el) => el.remove());
  };
}
