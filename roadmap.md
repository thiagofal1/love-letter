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
├── ideas.md                      # Medidas e critérios para chegar ao nível 10
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

### ✅ Fase 5 — Upload de Mídia & Galeria do Casal (Implementação inicial)
- [x] Preparar bucket `love-photos` e políticas públicas iniciais em `supabase/storage.sql` (executar no SQL Editor do Supabase).
- [x] Adicionar componente de upload de fotos no Studio Editor, com validação de formato/tamanho e feedback de erro.
- [x] Exibir galeria de fotos do casal no `LoveLetterViewer` com carrossel horizontal e lightbox acessível.
- [ ] Revisar as políticas públicas de upload e leitura, propriedade dos arquivos, quotas, exclusão e privacidade antes da divulgação (Fase 11).

### ✅ Fase 6 — Autenticação & Dashboard do Criador (Concluído)
- [x] Tela de Login / Cadastro (Supabase Auth por E-mail ou Google).
- [x] Dashboard `/?view=dashboard` para listar, editar ou excluir cartas criadas pelo usuário.

### ✅ Fase 7 — Monetização & Plano Premium (Implementação inicial)
- [x] Lógica para remoção da marca d'água no rodapé.
- [x] Slugs personalizados (ex: `loveletter.app/izzy-e-thiago`).
- [x] Temas de cores adicionais (*Classic Red*, *Pastel Rose*, *Dark Velvet*).
- [x] Integração com gateway de pagamento (Mercado Pago).
- [ ] Validar direitos Premium no servidor, proteger campos contra alteração pelo cliente e testar o ciclo completo da assinatura (Fase 11).

### ✅ Fase 8 - SEO, dados e privacidade (Implementação inicial; revisão pendente)
- [x] Dados no rodape | Incluir contatos, redes, politicas, identificacao e ano dinamico.
- [x] Titulos e descricoes | `title`, descricao e idioma ja existem; revisar URL canonica e hierarquia de headings.
- [x] Meta descriptions | A home ja possui meta description; criar/validar descricoes para futuras paginas ou rotas.
- [x] Schema.org | Adicionar JSON-LD Person e ProfessionalService/WebSite com dados confirmados.
- [x] sitemap.xml | Gerar e publicar sitemap com a URL canonica.
- [x] robots.txt | Publicar regras e referencia ao sitemap.
- [x] Google Analytics | Configurar GA4/GTM usando o ID fornecido, condicionado ao consentimento.
- [x] Cookies | Criar banner com aceitar, recusar e preferencias; bloquear analytics antes da permissao.
- [x] ERROR 404 | Criar pagina personalizada de erro 404.
- [ ] Verificar consentimento real antes de carregar analytics, opções de recusa/preferências, metadados duplicados e disponibilidade da imagem Open Graph (Fase 11).
- [ ] Confirmar privacidade, retenção e exclusão de dados e publicar documentos coerentes com o funcionamento real do produto.

### ✅ Fase 9 - Responsividade e UX Mobile (Implementação inicial; validação pendente)
- [x] Ajustar Layout do Editor | Garantir que o painel lateral e a tela de preview (split screen) funcionem bem em telas pequenas sem esmagar o conteúdo.
- [x] Navegação de Abas | Fazer as abas de edição deslizarem horizontalmente no celular.
- [x] Modal Premium | Verificar se o modal cabe perfeitamente na tela de um smartphone.
- [x] Visualizador da Carta | Revisar tamanho das fontes (especialmente a Press Start 2P) e espaçamentos no mobile.
- [ ] Redesenhar e validar o fluxo móvel de ponta a ponta, com controles confortáveis, alternância clara entre edição e prévia e testes em aparelhos reais (Fase 11).

### ✅ Fase 10 - Cabeçalhos e configuração de segurança (Implementação inicial)
- [x] Configuracoes de seguranca | Aplicar CSP gradual, HSTS apos HTTPS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy e antispam/rate limit no endpoint. Revisar segredos e restaurar `.env.example` sem credenciais.
- [ ] Testar a CSP no deploy para todos os serviços necessários e concluir a revisão de segurança antes de considerar o produto pronto para divulgação (Fase 11).

### 🚧 Fase 11 - Prontidão para divulgação, privacidade e qualidade (Pendente)

> Política escolhida: cartas não listadas acessíveis por token secreto; uploads
> exigem login do criador; fotos são entregues por URL temporária a quem tem o
> Em 21/10/2026, as migrações `subscriptions.sql`, `letters_rls.sql` e
> `storage.sql` foram aplicadas no projeto Supabase ativo; `get-shared-letter`
> e `create-checkout` também foram implantadas. O frontend ainda não foi
> publicado, então links antigos podem não funcionar até a publicação da versão
> compatível. O webhook de pagamentos ainda não foi atualizado: falta configurar
> `MP_WEBHOOK_SECRET` no Supabase; a versão antiga do webhook continua ativa e
> ainda não valida a assinatura HMAC. Configure também `APP_BASE_URL` com o
> domínio de produção correto antes de habilitar checkout. A validação funcional
> com contas reais e o ciclo de pagamentos continuam pendentes.
> Na sequência de implantação original, `subscriptions.sql` precede
> `letters_rls.sql`, e `get-shared-letter` precede a privatização do bucket.
> Links antigos baseados em slug/Base64 precisarão ser substituídos por novos
> links após a migração.

#### P0 - Bloqueadores antes de divulgar
- [ ] **Página de apresentação:** transformar a rota inicial em landing page que explica o produto, mostra uma demonstração identificada como tal e apresenta uma ação principal para criar carta.
- [ ] **Rotas e descoberta:** separar a página pública do editor; manter a criação em uma rota própria e garantir metadados e URLs apropriados para cada experiência.
- [ ] **Privacidade das cartas:** decidir se cartas são públicas, privadas ou acessíveis por link; ajustar RLS para que a política efetiva corresponda à decisão. Slugs não substituem autorização.
- [ ] **Privacidade e segurança de fotos:** restringir upload e acesso conforme a política escolhida; validar usuário, propriedade, tipo, tamanho e quantidade; definir remoção e retenção.
- [ ] **Direitos Premium:** usar assinatura verificada no servidor como fonte de direitos; a migração foi aplicada e o checkout implantado com URL de retorno controlada pelo servidor. Ainda falta configurar `MP_WEBHOOK_SECRET`, implantar o webhook atualizado e validar os direitos e pagamentos no Supabase/Mercado Pago.
- [ ] **Ciclo de assinatura:** testar pendente, autorizada, pausada, cancelada, recusada e falha de renovação no ambiente de testes do Mercado Pago.
- [ ] **Consentimento e dados pessoais:** bloquear analytics não essencial até consentimento; oferecer aceitar, recusar e gerenciar preferências; persistir escolhas e revisar política de privacidade e termos.
- [ ] **Critério de liberação:** executar testes de acesso como visitante anônimo, proprietário e outro usuário; confirmar que manipular chamadas do navegador não concede acesso a cartas ou recursos pagos.

#### P1 - Produto, design e experiência
- [ ] **Proposta de valor:** comunicar em linguagem direta o que é o Love Letter, para quem serve e o que será criado; não publicar avaliações, números ou promessas sem comprovação.
- [ ] **Demonstração:** incluir prévia real do editor e de uma carta de exemplo; identificar conteúdo fictício e não apresentar imagens de demonstração como fotos de usuários.
- [ ] **Conceito visual:** levar uma ideia própria — a carta como uma história pessoal que se revela e permanece viva — da landing page ao editor e à carta publicada.
- [ ] **Conteúdo e hierarquia:** priorizar um foco claro por tela, títulos curtos, texto legível, contraste adequado e imagens com origem autorizada e texto alternativo.
- [ ] **UX mobile:** validar a criação, edição, prévia, publicação e cópia do link com uma mão; garantir ações acessíveis, sem conteúdo encoberto e sem rolagem horizontal indesejada em 320, 360, 390, 768, 1024 e 1440 px.
- [ ] **Acessibilidade:** associar rótulos aos campos; garantir foco visível, ordem de teclado, nomes acessíveis em botões de ícone, semântica, anúncios de erros/estados e gerenciamento de foco em diálogos.
- [ ] **Movimento:** respeitar `prefers-reduced-motion` e nunca depender de animações para revelar conteúdo ou permitir o uso.
- [ ] **Compartilhamento social:** verificar a imagem Open Graph, títulos e descrições; assegurar que previews de cartas não revelem dados privados nem dependam de JavaScript quando o crawler não o executa.

#### P2 - Desempenho, operação e validação final
- [ ] **Desempenho:** investigar o alerta de bundle principal acima de 500 kB minificados; medir carregamento real e considerar divisão de código, imagens otimizadas e carregamento sob demanda.
- [ ] **Resiliência:** testar conexão lenta, falhas do Supabase, sessão expirada, CAPTCHA e pagamento; apresentar erros acionáveis sem perder dados preenchidos.
- [ ] **CSP e dependências externas:** validar no deploy as origens de Supabase, analytics, hCaptcha, Spotify e pagamento; manter permissões estritas e confirmar ausência de erros de console.
- [ ] **Testes de jornada:** verificar cadastro, login, logout, publicação, acesso compartilhado, edição, exclusão, upload, consentimento, checkout, cancelamento e estados de erro.
- [ ] **Compatibilidade:** testar navegadores e dispositivos representativos, incluindo aparelho móvel real e tamanhos de tela pequenos.
- [ ] **Revisão visual:** registrar capturas em desktop, tablet e celular; corrigir os problemas mais visíveis e repetir a avaliação usando a rubrica de design (40%), usabilidade (30%), criatividade (20%) e conteúdo (10%).
- [ ] **Aprovação de divulgação:** publicar somente após fechar os bloqueadores P0, verificar os fluxos principais no ambiente publicado e confirmar que textos, imagens, preços e benefícios são verdadeiros.

---

## 🎯 Princípios do Projeto
1. **Design First:** A estética editorial deve ser impecável tanto na criação quanto na visualização.
2. **Desempenho & Leveza:** Zero inchaço de código, compilação rápida com Vite e React 19.
3. **Resiliência:** Se o Supabase estiver indisponível ou não configurado, o app continua gerando links funcionais via URL encoding.
4. **Privacidade & Confiança:** Acesso a cartas, fotos, dados e recursos Premium deve seguir políticas verificadas no servidor e escolhas informadas dos usuários.
5. **Qualidade Verificável:** Só considerar lançamento concluído após testar os fluxos críticos no ambiente publicado, em desktop e dispositivos móveis.
