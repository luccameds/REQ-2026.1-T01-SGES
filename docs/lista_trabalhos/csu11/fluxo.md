# SGES
## Especificação de Caso de Uso: CSU11 (RF13) - Registrar falta justificada

[Matriz de Priorização](../../matriz_de_acao_e_priorizacao.md) <br>
[Andamento](../andamento.md) <br>
[Cronograma e Planejamento](../../cronograma_e_entregas.md#tabela-de-cronograma-e-planejamento)

---

### 1. Breve Descrição
Lançar e registrar o abono de ausências de beneficiários no diário de classe mediante justificativas aceitas.

---

### 2. Fluxo Básico de Eventos
1. O Instrutor seleciona o beneficiário que faltou a uma aula específica. [[FE-1-A](#fe-1-a-beneficiario-inexistente), [FE-1-B](#fe-1-b-permissao-insuficiente)]
2. O Instrutor seleciona a opção 'Registrar Justificativa de Falta'. [[FA-2-A](#fa-2-a-historico-de-faltas-vazio)]
3. O sistema solicita o motivo da justificativa e a anexação de um comprovante (ex: atestado médico, declaração escolar).
4. O Instrutor preenche a justificativa, anexa o documento correspondente e clica em 'Salvar'. [[FE-4-A](#fe-4-a-dados-invalidos-ou-anexo-excedido)]
5. O sistema altera o status da falta daquele dia de 'Não Justificada' para 'Justificada'. [[FE-5-A](#fe-5-a-falha-de-persistencia)]
6. O sistema armazena o anexo e exibe uma mensagem de confirmação de sucesso.

---

### 3. Fluxos Alternativos
#### FA-2-A - Histórico de Faltas Vazio
No passo 2, se o beneficiário selecionado não possuir nenhuma falta registrada na data ou turma correspondente, o sistema exibe um aviso de histórico vazio ("Este beneficiário não possui faltas a serem justificadas").

---

### 4. Fluxos de Exceção
#### FE-1-A - Beneficiário Inexistente
No passo 1, se o beneficiário ou a aula especificada não existirem no sistema (ex: por remoção simultânea), o sistema cancela a ação e exibe erro correspondente.

#### FE-1-B - Permissão Insuficiente
No passo 1, se o usuário logado não for o instrutor responsável pela turma ou um gestor autorizado, o sistema bloqueia o registro de justificativas.

#### FE-4-A - Dados Inválidos ou Anexo Excedido
No passo 4, se o comprovante anexado possuir tamanho superior a 5MB, extensão diferente de PDF, JPG ou PNG, ou se o motivo estiver vazio, o sistema exibe mensagens de erro específicas e impede o salvamento.

#### FE-5-A - Falha de Persistência
No passo 5, se houver erro ao efetuar o upload do comprovante ou ao persistir a alteração de status no banco de dados, o sistema impede a gravação, exibe erro de persistência e mantém o formulário aberto.

---

### 5. Pré-Condições
* O Instrutor está autenticado e o beneficiário possui uma falta registrada na data do abono.

---

### 6. Pós-Condições
* A falta do beneficiário é marcada como Justificada e não será contabilizada nos indicadores de risco de evasão.

---

### 7. Pontos de Extensão
Nenhum ponto de extensão identificado.

---

### 8. Requisitos Especiais
* Permitir o upload seguro de arquivos de comprovantes (formatos PDF, JPG, PNG) limitados a 5MB.

---

### 9. Informações Adicionais

#### Protótipo de Tela (DoR)

![Protótipo - CSU11](CSU11.png){: style="border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); max-width: 100%; border: 1px solid var(--sges-card-border); margin-top: 1rem;"}
