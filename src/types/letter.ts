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
  created_at?: string;
}

export const DEFAULT_LOVE_LETTER: LoveLetterData = {
  partner_name: 'Nome do seu amor',
  author_name: 'Seu nome',
  relationship_start_date: new Date().toISOString().split('T')[0] + 'T00:00:00',
  hero_title: 'Eu te amo,',
  hero_subtitle: 'mais a cada dia.',
  hero_description: 'Desde que nossos caminhos se cruzaram, a vida ganhou novas cores e meu sorriso encontrou um motivo.',
  marquee_text: 'EU TE AMO · ',
  declarations: [
    'Eu amo o seu sorriso.',
    'Você é meu lugar favorito no mundo.',
    'Com você, tudo faz sentido.',
    'Eu escolho você todos os dias.',
    'Você é o meu lar.'
  ],
  memories: [
    { date: 'Dia, Mês, Ano', label: 'Onde tudo começou', desc: 'O dia em que o universo conspirou a nosso favor e nossas histórias se uniram.' },
    { date: 'Uma data especial', label: 'Nossa primeira viagem', desc: 'Descobri que me perder ao seu lado é a forma mais bonita de me encontrar.' },
    { date: 'Aquele dia inesquecível', label: 'Nosso momento', desc: 'Aquele instante em que o tempo parou e eu tive certeza de que era você.' }
  ],
  closing_quote: 'O verdadeiro amor nunca se esgota. Quanto mais se dá, mais se tem.',
  closing_message: 'Obrigado por compartilhar a jornada da vida comigo. Que este seja apenas o começo.',
  footer_text: 'feito com amor',
  spotify_playlist_url: '',
  photos: [],
  theme_id: 'warm-gold',
  is_premium: false
};
