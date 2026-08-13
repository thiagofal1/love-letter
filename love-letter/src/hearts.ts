const emojis = ['💕', '❤️', '🤍', '❤️‍🩹', '💝', '💌', '✨']
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

function createFloatingEmoji() {
  if (prefersReducedMotion.matches) return

  const emoji = document.createElement('span')
  const duration = 5 + Math.random() * 4

  emoji.className = 'floating-emoji'
  emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)]
  emoji.setAttribute('aria-hidden', 'true')
  emoji.style.setProperty('--emoji-left', `${Math.random() * 100}%`)
  emoji.style.setProperty('--emoji-size', `${1 + Math.random() * 1.4}rem`)
  emoji.style.setProperty('--emoji-drift', `${-5 + Math.random() * 10}vw`)
  emoji.style.setProperty('--emoji-duration', `${duration}s`)

  document.body.append(emoji)
  window.setTimeout(() => emoji.remove(), duration * 1000)
}

for (let index = 0; index < 8; index += 1) {
  window.setTimeout(createFloatingEmoji, index * 280)
}

window.setInterval(createFloatingEmoji, 750)
