# 💌 Love Letter — Roadmap do Projeto

> Plataforma SaaS onde qualquer pessoa pode criar, personalizar e compartilhar uma **carta de amor viva e interativa** para seu parceiro(a).

---

## 1. Visão Geral e Stack

### Visual & Experiência
* **Estética:** Design editorial minimalista warm-dark (`#0d0a08`, `#c9a07a`, `#16120e`).
* **Tipografia:** `Fraunces` (headives e destaque), `Lora` (corpo), `DM Mono` (rótulos e dados).
* **Elementos Visuais:** Film grain overlay, vinheta ambiente, letreiro marquee, linha do tempo interativa e contador em tempo real (dias, horas, minutos e segundos).

### Stack Tecnológica
* **Frontend:** Vite + React 19 + TypeScript + Tailwind CSS v4 + Lucide Icons
* **Backend:** Supabase (PostgreSQL + Auth + Storage)
* **Deploy:** Vercel / Netlify

---

## 2. Estrutura do Projeto

```text
love-letter/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── LoveLetterEditor.tsx   # Studio de criação (formulário + live preview)
│   │   └── LoveLetterViewer.tsx   # Experiência visual completa da carta
│   ├── lib/
│   │   └── supabase.ts            # Cliente do Supabase com fallback resiliente
│   ├── types/
│   │   └── letter.ts              # Modelo de dados LoveLetterData & MemoryItem
│   ├── App.tsx                    # Roteador (Editor vs Viewer por parâmetro URL)
│   ├── main.tsx                   # Ponto de entrada React
│   ├── spotify.ts                 # Utilitário de conversão de URLs do Spotify
│   └── style.css                  # Design system global e animações
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── roadmap.md
```

---

## 3. Fases do Desenvolvimento

### ✅ Fase 1 — Setup & Estrutura Base (Concluído)
- [x] Configuração inicial do Vite + React + TypeScript + Tailwind CSS v4.
- [x] Limpeza e remoção de código legado e arquivos mortos (`counter.ts`, `hearts.ts`, assets não utilizados).
- [x] Padronização do `.gitignore` e proteção do `.env`.

### ✅ Fase 2 — Design System & Componente Viewer (Concluído)
- [x] Replicação fiel do visual do Figma Make (Warm Dark Editorial).
- [x] Componente `LoveLetterViewer`:
  - [x] Hero oversized com títulos e descrição parametrizados.
  - [x] Contador ao vivo (dias, horas, minutos e segundos com ticking a cada 1s).
  - [x] Faixa letreiro (Marquee Strip) deslizante.
  - [x] Player do Spotify integrado.
  - [x] Lista de declarações numeradas com hover interativo.
  - [x] Linha do tempo (Timeline) de memórias marcantes expansíveis.
  - [x] Seção de fechamento e citação final.
  - [x] Marca d'água discreta "Criado com Love Letter".

### ✅ Fase 3 — Studio Editor & Roteamento (Concluído)
- [x] Componente `LoveLetterEditor`:
  - [x] Painel *split-screen* com formulário em abas (Geral, Mensagens, Timeline, Música).
  - [x] Live Preview atualizado instantaneamente a cada digitação.
  - [x] Alternador de visualização (Editor vs Tela Cheia).
  - [x] Gerador de link único compartilhável.
- [x] Roteador dinâmico em `App.tsx`:
  - [x] Acesso direto `/` abre o Studio Editor.
  - [x] Acesso via `?l=slug` busca a carta no Supabase.
  - [x] Fallback via `?d=base64` decodifica e exibe a carta sem backend.

### ✅ Fase 4 — Persistência & Supabase Backend (Concluído)
- [x] Integração da SDK do Supabase em `src/lib/supabase.ts`.
- [x] Criar tabela `letters` no banco de dados do Supabase:
  ```sql
  create table letters (
    id uuid default gen_random_uuid() primary key,
    slug text unique not null,
    partner_name text not null,
    author_name text not null,
    relationship_start_date text not null,
    hero_title text,
    hero_subtitle text,
    hero_description text,
    marquee_text text,
    declarations jsonb,
    memories jsonb,
    closing_quote text,
    closing_message text,
    footer_text text,
    spotify_playlist_url text,
    photos jsonb,
    theme_id text default 'warm-gold',
    is_premium boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );
  ```
- [x] Testar salvamento e leitura de cartas reais cadastradas no Supabase.

### ✅ Fase 5 — Upload de Mídia & Galeria do Casal (Concluído)
- [x] Preparar bucket `love-photos` e políticas públicas iniciais em `supabase/storage.sql` (executar no SQL Editor do Supabase).
- [x] Adicionar componente de upload de fotos no Studio Editor, com validação de formato/tamanho e feedback de erro.
- [x] Exibir galeria de fotos do casal no `LoveLetterViewer` com carrossel horizontal e lightbox acessível.

### ✅ Fase 6 — Autenticação & Dashboard do Criador (Concluído)
- [x] Tela de Login / Cadastro (Supabase Auth por E-mail ou Google).
- [x] Dashboard `/?view=dashboard` para listar, editar ou excluir cartas criadas pelo usuário.

### 💎 Fase 7 — Monetização & Plano Premium
- [ ] Lógica para remoção da marca d'água no rodapé.
- [ ] Slugs personalizados (ex: `loveletter.app/izzy-e-thiago`).
- [ ] Temas de cores adicionais (*Classic Red*, *Pastel Rose*, *Dark Velvet*).
- [ ] Integração com gateway de pagamento (Stripe / Abmex / Asaas).

---

## 🎯 Princípios do Projeto
1. **Design First:** A estética editorial deve ser impecável tanto na criação quanto na visualização.
2. **Desempenho & Leveza:** Zero inchaço de código, compilação rápida com Vite e React 19.
3. **Resiliência:** Se o Supabase estiver indisponível ou não configurado, o app continua gerando links funcionais via URL encoding.
