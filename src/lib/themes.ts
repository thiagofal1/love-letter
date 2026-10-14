export interface Theme {
  id: string;
  name: string;
  description: string;
  premium: boolean;
  promotional?: boolean;
  visualMode: 'editorial' | 'brutalist' | 'glass' | 'cinematic' | 'pixel';
  artDirection: 'canopy' | 'lucky' | 'glass' | 'grim' | 'pixel';
  fonts: {
    display: string;
    body: string;
    mono: string;
  };
  colors: Record<string, string>;
}

export const THEMES: Theme[] = [
  {
    id: 'warm-gold',
    name: 'Canopy',
    description: 'Editorial verde profundo, textura de produto e narrativa em capítulos',
    premium: false,
    visualMode: 'editorial',
    artDirection: 'canopy',
    fonts: { display: 'Fraunces', body: 'Lora', mono: 'DM Mono' },
    colors: {
      'background': '#07130e',
      'foreground': '#e9f1e8',
      'card': '#0d2118',
      'card-foreground': '#dcebdd',
      'primary': '#63e6a7',
      'primary-foreground': '#06100b',
      'secondary': '#123323',
      'secondary-foreground': '#a6cbb3',
      'muted': '#0b1e15',
      'muted-foreground': '#84a991',
      'accent': '#b4f1c8',
      'accent-foreground': '#06100b',
      'border': '#1d4b34',
      'ring': '#63e6a7',
    },
  },
  {
    id: 'classic-red',
    name: 'Lucky Wheel',
    description: 'Colorido, lúdico e inesperado — uma carta que parece um jogo',
    premium: true,
    visualMode: 'brutalist',
    artDirection: 'lucky',
    fonts: { display: 'Archivo Black', body: 'Space Grotesk', mono: 'Space Mono' },
    colors: {
      'background': '#7f1d32',
      'foreground': '#fff0ed',
      'card': '#a92c45',
      'card-foreground': '#fff0ed',
      'primary': '#ffc0bd',
      'primary-foreground': '#3b0b16',
      'secondary': '#5f1427',
      'secondary-foreground': '#f4aaa9',
      'muted': '#8e243b',
      'muted-foreground': '#f6c9c4',
      'accent': '#f25c6c',
      'accent-foreground': '#3b0b16',
      'border': '#3b0b16',
      'ring': '#ffc0bd',
    },
  },
  {
    id: 'pastel-rose',
    name: 'Soft Glass',
    description: 'Glassmorphism delicado com camadas translúcidas e fotos flutuantes',
    premium: true,
    visualMode: 'glass',
    artDirection: 'glass',
    fonts: { display: 'DM Serif Display', body: 'Manrope', mono: 'DM Mono' },
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
    name: 'Grim London',
    description: 'Gótico cinematográfico, mapas antigos e uma atmosfera de mistério',
    premium: true,
    visualMode: 'cinematic',
    artDirection: 'grim',
    fonts: { display: 'Bodoni Moda', body: 'Manrope', mono: 'DM Mono' },
    colors: {
      'background': '#080b0d',
      'foreground': '#eee8dc',
      'card': '#11191b',
      'card-foreground': '#e0d8ca',
      'primary': '#d4bf9d',
      'primary-foreground': '#0b0d0e',
      'secondary': '#1a2426',
      'secondary-foreground': '#b5aca0',
      'muted': '#101617',
      'muted-foreground': '#8c928d',
      'accent': '#a58063',
      'accent-foreground': '#0b0d0e',
      'border': '#344044',
      'ring': '#d4bf9d',
    },
  },
  {
    id: 'thigasfal',
    name: 'Pixel Arcade',
    description: 'Edição Especial de Criador (Gratuito)',
    premium: false,
    promotional: true,
    visualMode: 'pixel',
    artDirection: 'pixel',
    fonts: { display: 'Press Start 2P', body: 'Rajdhani', mono: 'JetBrains Mono' },
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
  const allThemeKeys = new Set(Object.values(THEMES).flatMap((item) => Object.keys(item.colors)));
  for (const key of allThemeKeys) root.style.removeProperty(`--theme-${key}`);
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(`--theme-${key}`, value);
  }
  root.style.setProperty('--theme-font-display', `'${theme.fonts.display}'`);
  root.style.setProperty('--theme-font-body', `'${theme.fonts.body}'`);
  root.style.setProperty('--theme-font-mono', `'${theme.fonts.mono}'`);
  root.dataset.themeMode = theme.visualMode;
  root.style.colorScheme = theme.id === 'pastel-rose' ? 'light' : 'dark';

  // Remove previous theme classes and add the current one
  root.className = root.className.replace(/\btheme-[a-zA-Z0-9-]+\b/g, '').trim();
  root.classList.add(`theme-${themeId}`);
}
