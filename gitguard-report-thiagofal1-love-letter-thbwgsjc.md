# Relatório de Segurança — thiagofal1/love-letter

**Scan:** `cmux7dtg808uuk0a2thbwgsjc` · MANUAL · branch `main` · commit `38dd53945560`
**Status:** COMPLETED · **Executado em:** 2026-10-06T21:41:07.894Z · **Concluído em:** 2026-10-06T21:43:29.666Z
**Relatório gerado em:** 2026-10-06T21:45:28.167Z por GitGuard

## Instruções para a IA que for corrigir isto

- Repositório alvo: thiagofal1/love-letter, branch "main", commit 38dd53945560060e18fefff926df93c3b76e5540. Aplique as correções diretamente nesse checkout.
- Em "dependencyUpgrades", cada entrada agrupa TODOS os CVEs de um mesmo pacote — faça UM upgrade por pacote (para "recommendedVersion" ou mais recente), não uma correção por CVE.
- Em "secrets", nunca tente adivinhar ou reconstruir o valor original do segredo (ele foi propositalmente redigido) — apenas remova/rotacione conforme "remediation".
- Depois de aplicar as correções, rode os testes existentes do projeto e, se disponível, o linter/build antes de considerar concluído.

## Resumo

- **Total de findings:** 11
- **Por severidade:** MEDIUM: 11
- **Por scanner:** SEMGREP: 11

## Outros findings

| Severidade | Scanner | Categoria | Título | Local |
|---|---|---|---|---|
| MEDIUM | SEMGREP | SAST | Semgrep Finding: rules.html.security.audit.missing-integrity.missing-integrity | /scan/index.html:12 |
| MEDIUM | SEMGREP | SAST | Semgrep Finding: rules.ajinabraham.njsscan.crypto.crypto_node.node_insecure_random_generator | /scan/src/components/LoveLetterEditor.tsx:18 |
| MEDIUM | SEMGREP | SAST | Semgrep Finding: rules.ajinabraham.njsscan.crypto.crypto_node.node_insecure_random_generator | /scan/src/components/LoveLetterViewer.tsx:85 |
| MEDIUM | SEMGREP | SAST | Semgrep Finding: rules.ajinabraham.njsscan.crypto.crypto_node.node_insecure_random_generator | /scan/src/components/LoveLetterViewer.tsx:87 |
| MEDIUM | SEMGREP | SAST | Semgrep Finding: rules.ajinabraham.njsscan.crypto.crypto_node.node_insecure_random_generator | /scan/src/components/LoveLetterViewer.tsx:88 |
| MEDIUM | SEMGREP | SAST | Semgrep Finding: rules.ajinabraham.njsscan.crypto.crypto_node.node_insecure_random_generator | /scan/src/components/LoveLetterViewer.tsx:92 |
| MEDIUM | SEMGREP | SAST | Semgrep Finding: rules.ajinabraham.njsscan.crypto.crypto_node.node_insecure_random_generator | /scan/src/components/LoveLetterViewer.tsx:94 |
| MEDIUM | SEMGREP | SAST | Semgrep Finding: rules.ajinabraham.njsscan.crypto.crypto_node.node_insecure_random_generator | /scan/src/components/LoveLetterViewer.tsx:95 |
| MEDIUM | SEMGREP | SAST | Semgrep Finding: rules.ajinabraham.njsscan.crypto.crypto_node.node_insecure_random_generator | /scan/src/components/LoveLetterViewer.tsx:96 |
| MEDIUM | SEMGREP | SAST | Semgrep Finding: rules.javascript.lang.security.audit.incomplete-sanitization.incomplete-sanitization | /scan/src/components/LoveLetterViewer.tsx:396 |
| MEDIUM | SEMGREP | SAST | Semgrep Finding: rules.ajinabraham.njsscan.crypto.crypto_node.node_insecure_random_generator | /scan/src/components/PhotoUploader.tsx:23 |
