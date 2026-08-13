# Love Letter — Roadmap

> Um site pessoal e interativo dedicado à Isadora, desenvolvido como uma experiência visual baseada no conceito do **Love Letter**.

## 1. Visão do projeto

O Love Letter será reconstruído mantendo a simplicidade de um site web estático, mas com uma estrutura moderna para permitir funcionalidades interativas.

### Stack definida

* **HTML5** — estrutura e semântica
* **CSS3** — identidade visual, responsividade e animações
* **TypeScript** — lógica e interatividade
* **Vite** — ambiente de desenvolvimento e build
* **Spotify iFrame API** — integração musical

### Direção visual

A interface seguirá o conceito criado no mockup:

* Design editorial/minimalista
* Preto, branco e vermelho como cores principais
* Tipografia grande e pesada
* Fotografias em preto e branco
* Grandes áreas de respiro
* Elementos propositalmente oversized
* Layout responsivo
* Animações sutis

---

# 2. Estrutura inicial

## Fase 1 — Setup

* [x] Criar projeto com Vite + Vanilla TypeScript
* [x] Configurar Git
* [x] Criar `.gitignore`
* [x] Limpar arquivos padrão do Vite
* [ ] Definir estrutura de diretórios
* [x] Criar CSS reset
* [x] Criar estilos globais
* [x] Configurar fontes
* [x] Adicionar favicon
* [x] Criar primeiro commit

Estrutura planejada:

```text
love-letter/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── styles/
│   │   ├── reset.css
│   │   └── main.css
│   │
│   ├── ts/
│   │   ├── counter.ts
│   │   └── spotify.ts
│   │
│   └── main.ts
│
├── index.html
├── package.json
├── tsconfig.json
└── README.md
```

---

# 3. Header

## Fase 2 — Navegação

Reproduzir o cabeçalho minimalista apresentado no conceito visual.

### Conteúdo

```text
LOVE-LETTER
POWERED BY THIGASFAL.DEV
```

### Tarefas

* [x] Criar `<header>`
* [x] Adicionar identidade `LOVE-LETTER`
* [x] Adicionar referência ao `THIGASFAL.DEV`
* [x] Implementar layout desktop
* [x] Implementar layout mobile
* [ ] Avaliar header fixo/sticky
* [ ] Adicionar microinterações aos links

---

# 4. Hero

## Fase 3 — I LOVE U, IZZY

Construir a primeira grande seção visual da página.

### Conceito

```text
I LOVE U,
IZZY
```

sobre uma composição de fotografias.

### Tarefas

* [x] Selecionar fotografias
* [x] Criar composição das imagens
* [x] Aplicar tratamento preto e branco
* [x] Implementar título oversized
* [x] Trabalhar sobreposição entre texto e fotografias
* [x] Criar comportamento responsivo
* [ ] Adicionar animação inicial
* [ ] Adicionar animações relacionadas ao scroll

### Objetivo

O Hero deve ser a primeira grande impressão do site e estabelecer imediatamente a identidade visual do Love Letter.

---

# 5. Spotify

## Fase 4 — Player musical

Criar uma seção musical inspirada no player vermelho apresentado no mockup.

### Tecnologia

**Spotify iFrame API**

O Spotify será responsável pela reprodução, enquanto o Love Letter terá sua própria apresentação visual sempre que as limitações da API permitirem.

### Informações

Playlist:

```text
JUST THE TWO OF US
```

### Tarefas

* [x] Criar playlist definitiva no Spotify
* [x] Obter URI/ID da playlist
* [x] Integrar Spotify iFrame API
* [x] Criar `spotify.ts`
* [x] Inicializar controller do Spotify
* [x] Implementar reprodução
* [x] Criar card visual do player
* [x] Exibir capa da playlist
* [x] Exibir título
* [x] Exibir informações complementares
* [ ] Criar botão Play/Pause
* [ ] Avaliar controles de próxima/anterior
* [x] Exibir músicas em destaque
* [ ] Implementar estados de loading/erro
* [x] Adaptar player para dispositivos móveis

### Direção visual

```text
┌─────────────────────────────────────────┐
│                                         │
│  [CAPA]     JUST THE TWO OF US          │
│             Playlist                    │
│                                         │
│                    ▶                    │
│                                         │
│  01  Música                       03:04 │
│  02  Música                       02:32 │
│  03  Música                       06:46 │
│                                         │
└─────────────────────────────────────────┘
```

O vermelho será utilizado como principal cor de destaque dessa seção.

---

# 6. Contador do relacionamento

## Fase 5 — Relationship Counter

Implementar o contador apresentado no conceito:

```text
2 ANOS 3 MESES E 21 DIAS

842
DIAS
```

Os números acima são apenas representação visual. Os valores exibidos no site serão calculados automaticamente.

### Tarefas

* [x] Criar `counter.ts`
* [x] Definir data inicial do relacionamento
* [x] Calcular anos completos
* [x] Calcular meses completos
* [x] Calcular dias restantes
* [x] Calcular quantidade total de dias
* [x] Atualizar DOM automaticamente
* [ ] Garantir cálculo correto em anos bissextos
* [ ] Evitar problemas de timezone
* [ ] Testar viradas de mês
* [ ] Testar viradas de ano

### Resultado

O usuário nunca precisará atualizar manualmente:

```text
842 DIAS
```

O Love Letter calculará o valor usando:

```text
Data do relacionamento → Data atual
```

### Decisão visual

O contador principal mostrará **dias**, não segundos.

O objetivo é preservar a estética editorial do projeto em vez de transformá-lo visualmente em um cronômetro.

---

# 7. Typography Section

## Fase 6 — I LOVE U

Reproduzir a seção tipográfica gigante do conceito:

```text
I LOVE U, IZZY
I LOVE U, IZZY
I LOVE U, IZZY
I LOVE U, IZZY
```

### Tarefas

* [x] Construir seção utilizando HTML real
* [x] Não transformar o texto em imagem
* [x] Implementar tipografia responsiva com `clamp()`
* [x] Trabalhar `letter-spacing`
* [x] Trabalhar `line-height`
* [x] Utilizar `overflow`
* [x] Criar cortes tipográficos intencionais
* [ ] Experimentar movimento horizontal
* [ ] Avaliar animação baseada em scroll

### Possível efeito

Linhas podem se movimentar em direções opostas conforme o usuário rola a página:

```text
→ I LOVE U, IZZY
← I LOVE U, IZZY
→ I LOVE U, IZZY
← I LOVE U, IZZY
```

---

# 8. Footer

## Fase 7 — Finalização da página

Criar footer baseado no conceito:

```text
LOVE-LETTER ©2026

Todos os direitos reservados


TE
AMO
```

### Tarefas

* [x] Criar footer
* [x] Adicionar copyright
* [x] Adicionar `TE AMO`
* [x] Manter identidade tipográfica
* [x] Criar responsividade
* [x] Adicionar referência discreta ao `thigasfal.dev`

---

# 9. Animações

## Fase 8 — Motion

Depois que toda a interface estiver funcional, adicionar movimento.

### Possibilidades

* [ ] Fade/reveal das seções
* [ ] Hero aparecendo progressivamente
* [ ] Fotografias reagindo ao scroll
* [ ] Texto oversized movimentando horizontalmente
* [ ] Transições no Spotify Player
* [ ] Animação do contador ao entrar na viewport
* [ ] Hover states
* [x] Microinterações
* [x] Respeitar `prefers-reduced-motion`

### Regra

**Animação deve complementar o design, não competir com ele.**

Evitar animações simplesmente porque são possíveis.

---

# 10. Responsividade

## Fase 9 — Mobile

O projeto deverá funcionar corretamente em:

* [ ] Desktop
* [ ] Notebook
* [ ] Tablet
* [ ] Smartphone

### Prioridades

* [x] Tipografia fluida
* [x] Hero responsivo
* [x] Imagens sem deformação
* [x] Spotify utilizável no mobile
* [x] Contador legível
* [ ] Nenhum overflow horizontal acidental
* [ ] Touch targets adequados

Usar preferencialmente:

```css
clamp()
min()
max()
minmax()
```

antes de criar grande quantidade de breakpoints.

---

# 11. Qualidade

## Fase 10 — Polish

### HTML

* [x] HTML semântico
* [x] Hierarquia correta de headings
* [x] Meta description
* [ ] Open Graph
* [x] Alt text nas imagens
* [x] Idioma `pt-BR`

### CSS

* [ ] Remover regras não utilizadas
* [ ] Padronizar nomenclatura
* [x] Criar variáveis CSS
* [ ] Revisar breakpoints
* [ ] Revisar animações

### TypeScript

* [ ] Evitar `any`
* [ ] Separar responsabilidades
* [ ] Tratar elementos DOM inexistentes
* [ ] Remover código duplicado
* [ ] Tratar erros externos do Spotify

### Performance

* [ ] Converter/comprimir imagens
* [ ] Lazy loading quando apropriado
* [ ] Evitar assets excessivamente grandes
* [x] Verificar bundle final
* [ ] Executar Lighthouse

---

# 12. Identidade

## Fase 11 — Detalhes finais

* [x] Criar favicon personalizado
* [x] Definir título definitivo
* [ ] Criar imagem de preview
* [ ] Configurar Open Graph
* [ ] Definir fotografia de compartilhamento
* [ ] Revisar textos
* [ ] Adicionar pequenos easter eggs

---

# 13. Deploy

## Fase 12 — Produção

* [x] Executar build

```bash
npm run build
```

* [ ] Testar build localmente

```bash
npm run preview
```

* [ ] Publicar aplicação
* [ ] Configurar domínio/subdomínio
* [ ] Configurar HTTPS
* [ ] Testar desktop
* [ ] Testar Android
* [ ] Testar iPhone
* [ ] Testar integração do Spotify em produção
* [ ] Validar compartilhamento do link

---

# 14. Documentação

## Fase 13 — GitHub

Apesar de ser um projeto pessoal, manter boas práticas de desenvolvimento.

### README

* [ ] Apresentação do projeto
* [ ] Screenshot
* [ ] Stack utilizada
* [ ] Explicação da arquitetura
* [ ] Como executar localmente
* [ ] Estrutura do projeto
* [ ] Link para produção

### Git

Utilizar commits pequenos e descritivos:

```text
chore: initialize vite project

feat: create relationship counter

feat: implement hero section

feat: integrate spotify iframe api

style: create relationship counter layout

feat: add love typography section

feat: add scroll animations

fix: improve mobile hero layout

perf: optimize hero images

docs: create project documentation
```

---

# Ordem de desenvolvimento

```text
01. Setup
       ↓
02. Header
       ↓
03. Hero
       ↓
04. Spotify Player
       ↓
05. Relationship Counter
       ↓
06. I LOVE U Typography
       ↓
07. Footer
       ↓
08. Animações
       ↓
09. Responsividade
       ↓
10. Performance + Acessibilidade
       ↓
11. Identidade / detalhes
       ↓
12. Deploy
       ↓
13. Documentação
```

---

# Escopo da v1.0

O **Love Letter v1.0** estará concluído quando possuir:

* [x] Identidade visual baseada no novo conceito
* [x] Hero com fotografias
* [x] Spotify funcional
* [x] Contador automático do relacionamento
* [x] Seção tipográfica `I LOVE U, IZZY`
* [x] Footer
* [x] Animações
* [ ] Layout completamente responsivo
* [ ] Deploy em produção

## Princípio do projeto

> **Keep it simple.**

O Love Letter continuará sendo fundamentalmente um site em HTML, CSS e TypeScript.

Frameworks e dependências só deverão ser adicionados quando resolverem um problema real que as tecnologias nativas não resolvam adequadamente.
