# Roteiro para levar o Love Letter ao nível 10

Este documento transforma a análise do projeto em medidas de produto, design,
segurança e qualidade que podem ser implementadas e verificadas antes da
divulgação. A nota 10 é uma meta de excelência, não uma garantia: a avaliação
final depende da experiência real e de testes no ambiente de produção.

## Objetivo

Fazer com que alguém que ainda não conhece o Love Letter entenda rapidamente
para que serve, veja por que vale a pena e consiga criar e compartilhar uma
carta com confiança, tanto no celular quanto no computador.

## Prioridades

### P0 — Resolver antes de divulgar

#### 1. Criar uma página de divulgação

- Fazer da rota inicial uma apresentação do produto, não do editor.
- Explicar em linguagem direta o que é o Love Letter e o que a pessoa poderá
  criar.
- Mostrar uma prévia real de uma carta e do editor; identificar claramente
  qualquer conteúdo de demonstração.
- Apresentar uma ação principal explícita, como **Criar minha carta**, que leve
  ao editor.
- Manter a criação acessível por uma rota própria e fácil de compartilhar.
- Mostrar preço e condições do Premium de forma clara antes da compra, se a
  oferta paga estiver ativa.
- Não adicionar avaliações, quantidade de clientes, resultados ou selos sem
  comprovação.

**Critérios de conclusão**

- Uma pessoa que nunca viu o produto consegue explicar o que ele faz após
  olhar a primeira tela por alguns segundos.
- A chamada principal funciona em desktop e celular e leva ao fluxo de criação.
- A apresentação funciona sem depender de o visitante preencher o editor para
  descobrir o produto.

#### 2. Definir privacidade das cartas e das fotos

- Decidir e documentar se cartas e fotos são públicas, privadas ou acessíveis
  somente por link não listado.
- Não tratar um slug difícil de adivinhar como controle de acesso.
- Rever a política de leitura pública de todas as linhas da tabela `letters`.
  Se a intenção for compartilhar por link, projetar uma forma de acesso que não
  exponha todas as cartas a consultas anônimas.
- Restringir upload de fotos a usuários autorizados e definir regras de
  propriedade, tamanho, tipo, quantidade e remoção.
- Considerar que fotos de casal podem conter dados pessoais e que um bucket
  público torna os arquivos acessíveis a quem obtiver suas URLs.
- Documentar retenção e exclusão de cartas, fotos e dados de conta.

**Critérios de conclusão**

- Testes com usuário anônimo, dono da carta e outro usuário confirmam a política
  escolhida para leitura, edição, exclusão e upload.
- Nenhum visitante anônimo pode enviar arquivos sem que isso seja uma decisão
  deliberada, limitada e documentada.
- A exclusão de uma carta também tem comportamento definido para os arquivos
  associados.

#### 3. Tornar a assinatura Premium confiável

- Tratar o cliente como não confiável: não aceitar `is_premium`, tema Premium,
  slug pago ou preço enviados pelo navegador como prova de pagamento.
- Derivar direitos Premium da assinatura validada no servidor.
- Impedir que as políticas de atualização permitam ao usuário alterar campos
  protegidos de assinatura ou de direitos.
- Validar o estado da assinatura consultando a fonte confiável de pagamento.
- Validar a autenticidade das notificações do Mercado Pago, quando disponível,
  e confirmar que a cobrança e a conta associada correspondem ao usuário.
- Validar e restringir URLs de retorno do checkout a destinos permitidos.
- Definir e testar os estados de assinatura: pendente, autorizada, pausada,
  cancelada, recusada e falha de renovação.
- Explicar preço, recorrência, cancelamento e suporte antes da confirmação da
  compra.

**Critérios de conclusão**

- Alterar campos ou chamadas no navegador não concede acesso Premium.
- Usuário sem assinatura válida não consegue salvar nem servir recursos pagos.
- Compra, retorno, cancelamento e mudança de status foram verificados em
  ambiente de testes do provedor de pagamento.

#### 4. Corrigir consentimento e privacidade

- Impedir o carregamento de analytics não essencial antes da escolha do
  visitante, conforme a política de privacidade e as obrigações aplicáveis.
- Oferecer opções claras para aceitar, recusar e rever preferências.
- Persistir cada escolha de forma consistente e permitir alterá-la depois.
- Informar quais dados são coletados, para que servem e como solicitar sua
  exclusão.
- Rever a política de privacidade e os termos da plataforma antes de receber
  conteúdo pessoal ou pagamentos.

**Critérios de conclusão**

- Uma sessão nova não carrega analytics não essencial antes do consentimento
  escolhido.
- Aceitar, recusar, fechar o aviso e reabrir preferências têm comportamentos
  distintos e testados.
- Os textos e práticas reais do serviço estão alinhados com os documentos de
  privacidade publicados.

### P1 — Fazer a experiência parecer completa e fácil

#### 5. Criar um conceito visual próprio e coerente

- Definir uma ideia que pertença à experiência do produto: a carta como uma
  história pessoal que se revela e permanece viva.
- Levar essa ideia da página de apresentação ao editor e à carta publicada,
  sem recorrer a blocos genéricos que poderiam pertencer a qualquer serviço.
- Manter uma hierarquia clara: um foco principal por tela, títulos curtos,
  texto de leitura confortável e bom contraste.
- Usar fotos reais fornecidas pela pessoa que cria a carta ou imagens de
  demonstração autorizadas; nunca apresentar imagens genéricas como se fossem
  fotos do casal.
- Usar elementos gráficos apenas quando acrescentarem significado ou ajudarem
  a entender o produto.
- Respeitar movimento reduzido e garantir que o conteúdo continue disponível
  sem animações.

**Critérios de conclusão**

- O estilo continua reconhecível ao percorrer todas as seções e telas.
- As imagens têm origem e uso apropriados, carregam texto alternativo e não
  distorcem o layout.
- O movimento não esconde conteúdo, não bloqueia leitura e respeita a
  preferência de movimento reduzido.

#### 6. Refazer o fluxo móvel com prioridade para o polegar

- Tratar a tela pequena como uma experiência própria, não como uma versão
  estreita da interface desktop.
- Tornar as abas e ações principais fáceis de encontrar e tocar.
- Fazer a prévia e a edição terem uma alternância clara, sem exigir que o
  visitante descubra sozinho o modo de tela cheia.
- Manter ações importantes visíveis sem sobrepor campos, avisos ou conteúdo.
- Testar teclado virtual, orientação vertical e horizontal, telas pequenas e
  áreas seguras de aparelhos com recortes.
- Preservar zoom e rolagem naturais.

**Critérios de conclusão**

- Não há rolagem horizontal indesejada em 320, 360, 390, 768, 1024 e 1440 px.
- A pessoa consegue editar, visualizar, publicar e copiar o link usando apenas
  um celular.
- Nenhum aviso fixo encobre permanentemente uma ação essencial ou o conteúdo.

#### 7. Melhorar acessibilidade e feedback

- Associar cada rótulo de formulário ao seu controle com `htmlFor` e `id`, ou
  envolver o controle no rótulo.
- Fornecer nomes acessíveis a botões que exibem somente ícones.
- Garantir foco visível, ordem de teclado lógica e operação completa sem mouse.
- Usar semântica e hierarquia de títulos consistentes, incluindo uma forma de
  pular para o conteúdo principal.
- Anunciar erros, sucesso e estados de carregamento a tecnologias assistivas.
- Em diálogos, gerenciar foco, fechamento por teclado e retorno do foco ao
  elemento que abriu a janela.
- Confirmar ações destrutivas e explicar o que será removido.
- Rever contraste e tamanho de texto, inclusive textos auxiliares e estados
  desativados.

**Critérios de conclusão**

- Os fluxos principais são concluídos por teclado e leitor de tela.
- Campos inválidos recebem mensagens junto ao campo e uma orientação para
  corrigir o problema.
- Botões e links têm nomes claros, estado de foco perceptível e área de toque
  confortável.

#### 8. Aperfeiçoar compartilhamento e descoberta

- Confirmar que a imagem Open Graph configurada existe, é pública e representa
  corretamente o produto.
- Definir título, descrição e imagem apropriados para páginas de apresentação
  e de carta compartilhada.
- Garantir que robôs de redes sociais recebam os metadados da carta sem
  depender de executar JavaScript; avaliar renderização ou pré-renderização
  adequada.
- Remover metadados duplicados e verificar canonical, sitemap e `robots.txt`.
- Criar uma página de destino útil para links inexistentes ou removidos.
- Incluir uma explicação clara de como a pessoa pode criar sua própria carta,
  sem divulgar os dados da carta recebida.

**Critérios de conclusão**

- Links de demonstração e de cartas apresentam título, descrição e imagem
  corretos em validadores de prévia social.
- Não há imagens sociais inexistentes, título duplicado ou indexação
  acidental de dados privados.

### P2 — Validar operação e qualidade

#### 9. Melhorar desempenho e resiliência

- Investigar a divisão de código: o build atual alerta que o bundle principal
  ultrapassa 500 kB minificados.
- Carregar áreas como dashboard, editor e diálogos apenas quando necessárias,
  se isso reduzir a carga inicial sem piorar a experiência.
- Otimizar imagens com dimensões apropriadas e formatos modernos; carregar com
  prioridade o conteúdo inicial e adiar imagens fora da primeira tela.
- Reduzir e consolidar fontes externas e usar estratégias que evitem texto
  invisível durante o carregamento.
- Tratar falhas de rede, sessão expirada, ausência de configuração e erros do
  provedor com mensagens úteis e ações de recuperação.
- Verificar a CSP em produção, incluindo origens realmente necessárias para
  Supabase, Google Analytics, hCaptcha, Spotify e pagamento; não abrir
  permissões além do necessário.

**Critérios de conclusão**

- O bundle é medido e otimizado com base em carregamento real, não apenas em
  tamanho teórico.
- A primeira tela continua útil em conexão lenta ou indisponibilidade de um
  serviço opcional.
- Não há erros de console, recursos essenciais bloqueados pela CSP ou imagens
  quebradas no ambiente publicado.

#### 10. Testar a jornada inteira em produção de teste

- Testar cadastro, login, logout, recuperação de acesso e autenticação por
  provedor.
- Testar criação, publicação, abertura do link em outra sessão, edição e
  exclusão da carta.
- Testar fotos válidas, arquivo rejeitado, excesso de tamanho, falha de rede e
  remoção.
- Testar pagamento, retorno do checkout, notificações, cancelamento e acesso
  após mudança de status.
- Testar consentimento, acessibilidade, telas móveis, compartilhamento social
  e páginas inexistentes.
- Repetir testes em navegadores e aparelhos representativos, incluindo um
  celular real.
- Monitorar erros e definir um processo de resposta a incidentes e suporte.

**Critérios de conclusão**

- Cada jornada crítica tem testes repetíveis e evidência de resultado.
- Nenhum erro bloqueador permanece em publicação, autenticação, privacidade ou
  cobrança.
- A experiência foi verificada no ambiente publicado, não somente no servidor
  local.

## Ordem recomendada de execução

1. Decidir o modelo de privacidade de cartas, fotos e dados de conta.
2. Corrigir políticas de acesso, uploads e proteção de direitos Premium.
3. Ajustar o fluxo de consentimento e revisar textos legais.
4. Criar a página de divulgação e definir a rota de criação.
5. Refinar o fluxo móvel, os formulários e a acessibilidade.
6. Corrigir metadados sociais e otimizar o carregamento.
7. Rodar testes de jornada, segurança e experiência no deploy de teste.
8. Rever as capturas em desktop, tablet e celular; corrigir os problemas mais
   perceptíveis e repetir a avaliação.

## Referência de avaliação

Usar a mesma rubrica em cada rodada: **design 40%, usabilidade 30%,
criatividade 20%, conteúdo 10%**. Para perseguir o nível 10, nenhum critério
deve depender de um bom resultado em outro: aparência não compensa uma falha de
privacidade; segurança não compensa uma jornada que ninguém entende.

Registrar em cada rodada:

- data, versão e ambiente avaliados;
- notas por critério e justificativa baseada em evidências;
- capturas de desktop, tablet e celular;
- falhas abertas, responsável e teste que comprova a correção;
- confirmação de que os textos, imagens e benefícios divulgados são verdadeiros.

**Pronto para divulgação** significa que os bloqueadores P0 foram resolvidos,
os fluxos principais passaram em ambiente de teste e a versão publicada foi
verificada. Uma pontuação 10 só deve ser atribuída após a revisão completa da
experiência real.
