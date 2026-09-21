export interface MemoryItem {
  date: string;
  label: string;
  desc: string;
}

export interface LoveLetterData {
  id?: string;
  user_id?: string | null;
  slug?: string;
  partner_name: string;
  author_name: string;
  relationship_start_date: string; // ISO or YYYY-MM-DD
  hero_title?: string;
  hero_subtitle?: string;
  hero_description?: string;
  marquee_text?: string;
  declarations?: string[];
  memories?: MemoryItem[];
  closing_quote?: string;
  closing_message?: string;
  footer_text?: string;
  spotify_playlist_url?: string;
  photos?: string[];
  theme_id?: string;
  is_premium?: boolean;
}

export const DEFAULT_LOVE_LETTER: LoveLetterData = {
  partner_name: 'Izzy',
  author_name: 'Thiago',
  relationship_start_date: '2024-05-03T00:00:00',
  hero_title: 'Eu te amo,',
  hero_subtitle: 'e nunca vou parar.',
  hero_description: 'Desde o primeiro dia, cada momento com você virou meu lugar favorito no mundo.',
  marquee_text: 'EU TE AMO · ',
  declarations: [
    'Eu te amo além das palavras.',
    'Você é meu lugar favorito.',
    'Com você, tudo faz sentido.',
    'Eu te escolho todos os dias.',
    'Você é meu lar.'
  ],
  memories: [
    { date: '03 Maio, 2024', label: 'O começo de tudo', desc: 'O dia em que o universo conspirou a nosso favor — e eu parei de resistir.' },
    { date: 'Julho, 2024', label: 'Primeira viagem juntos', desc: 'Descobri que me perder contigo é a forma mais bonita de me encontrar.' },
    { date: 'Dezembro, 2024', label: 'Primeiro Natal', desc: 'Luzes de natal que nunca brilharam tanto. Ou talvez seja você.' },
    { date: 'Maio, 2025', label: 'Um ano', desc: '365 dias. Cada um melhor que o anterior. Que número absurdo de sorte.' },
    { date: 'Hoje', label: 'Agora', desc: 'E aqui estamos — ainda escolhendo um ao outro, todos os dias.' }
  ],
  closing_quote: 'O amor não é um destino. É o caminho inteiro.',
  closing_message: 'E eu escolho percorrê-lo ao seu lado, todos os dias, enquanto houver tempo.',
  footer_text: 'feito com amor · thigasfal.dev',
  spotify_playlist_url: 'https://open.spotify.com/playlist/2GQUVltP1fAKGYhIDdBkNf',
  photos: [],
  theme_id: 'warm-gold',
  is_premium: false
};
