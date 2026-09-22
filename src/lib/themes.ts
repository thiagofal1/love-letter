export interface Theme {
  id: string;
  name: string;
  description: string;
  premium: boolean;
  promotional?: boolean;
  colors: Record<string, string>;
}

export const THEMES: Theme[] = [
  {
    id: 'warm-gold',
    name: 'Warm Gold',
    description: 'O clássico tema elegante, quente e dourado',
    premium: false,
    colors: {
      'background': '#0d0a08',
      'foreground': '#f0ebe3',
      'card': '#16120e',
      'card-foreground': '#e8e0d4',
      'primary': '#c9a07a',
      'primary-foreground': '#0d0a08',
      'secondary': '#211c16',
      'secondary-foreground': '#b8aa98',
      'muted': '#1e1812',
      'muted-foreground': '#7a6e62',
      'accent': '#e8b89a',
      'accent-foreground': '#0d0a08',
      'border': '#2a2318',
      'ring': '#c9a07a',
    },
  },
  {
    id: 'classic-red',
    name: 'Classic Red',
    description: 'Romantismo profundo com tons de rubi e carmesim',
    premium: true,
    colors: {
      'background': '#0f0505',
      'foreground': '#fcefed',
      'card': '#1a0a0a',
      'card-foreground': '#f5d8d5',
      'primary': '#d93838',
      'primary-foreground': '#ffffff',
      'secondary': '#2a1111',
      'secondary-foreground': '#d1a3a3',
      'muted': '#200d0d',
      'muted-foreground': '#8a5c5c',
      'accent': '#ff6b6b',
      'accent-foreground': '#1a0505',
      'border': '#3d1c1c',
      'ring': '#d93838',
    },
  },
  {
    id: 'pastel-rose',
    name: 'Pastel Rose',
    description: 'Suave e delicado, com tons de rosa empoeirado',
    premium: true,
    colors: {
      'background': '#faf5f6',
      'foreground': '#4a3336',
      'card': '#ffffff',
      'card-foreground': '#5c4044',
      'primary': '#c97a8e',
      'primary-foreground': '#ffffff',
      'secondary': '#f2e6e8',
      'secondary-foreground': '#8f686d',
      'muted': '#f7eced',
      'muted-foreground': '#a6878b',
      'accent': '#e8a9b9',
      'accent-foreground': '#4a2f34',
      'border': '#e6d3d6',
      'ring': '#c97a8e',
    },
  },
  {
    id: 'dark-velvet',
    name: 'Dark Velvet',
    description: 'Ultra-escuro e luxuoso, com toques de violeta',
    premium: true,
    colors: {
      'background': '#080512',
      'foreground': '#e6e1f0',
      'card': '#100a1f',
      'card-foreground': '#d8d1e6',
      'primary': '#8a6bcc',
      'primary-foreground': '#080512',
      'secondary': '#1c1333',
      'secondary-foreground': '#9f94b8',
      'muted': '#150d26',
      'muted-foreground': '#6b5c8a',
      'accent': '#aa8eed',
    },
  },
  {
    id: 'thigasfal',
    name: 'ThigasFal',
    description: 'Edição Especial de Criador (Gratuito)',
    premium: false,
    promotional: true,
    colors: {
      'background': '#0D0D0D',
      'foreground': '#EFEEE0',
      'card': '#1A1A1A',
      'card-foreground': '#EFEEE0',
      'primary': '#D3AF37',
      'primary-foreground': '#0D0D0D',
      'secondary': '#212121',
      'secondary-foreground': '#EFEEE0',
      'muted': '#2A2A2A',
      'muted-foreground': '#888880',
      'accent': '#D3AF37',
      'accent-foreground': '#0D0D0D',
      'border': '#2E2E2E',
      'ring': '#D3AF37',
    },
  },
];

export function getTheme(themeId: string): Theme {
  return THEMES.find((t) => t.id === themeId) || THEMES[0];
}

export function applyTheme(themeId: string) {
  const theme = getTheme(themeId);
  if (!theme) return;

  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(`--theme-${key}`, value);
  }

  // Remove previous theme classes and add the current one
  root.className = root.className.replace(/\btheme-[a-zA-Z0-9-]+\b/g, '').trim();
  root.classList.add(`theme-${themeId}`);
}
