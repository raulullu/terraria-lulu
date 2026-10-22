# Como a lista é atualizada

`renderizarInventario` recebe os dados já validados. Sua responsabilidade é mostrar esses dados e atualizar os totais, filtros e estados dos botões. Ela não salva nem altera as regras do inventário.

## Por que não apagar todos os controles em cada edição?

Um campo pode confirmar uma edição ao perder o foco. Se essa confirmação apagar a linha enquanto a pessoa está clicando no botão ao lado, o alvo do clique pode desaparecer antes de receber o clique. O foco de quem usa Tab também precisa ser preservado.

Por isso a versão atual reutiliza controles quando o registro exibido continua compatível. Essa é uma escolha de implementação, não uma exigência para toda aplicação. Uma renderização que recria tudo também é possível, mas precisaria tratar e testar a sequência nativa de foco, edição e clique no navegador.

## Percurso da função

1. Guarda qual elemento tem o foco.
2. Monta um `Map` das linhas já existentes, usando a posição do registro nos dados.
3. Prepara uma sequência ordenada apenas para exibição. Os dados continuam na ordem de cadastro.
4. Para cada registro, procura a linha existente. Se nome ou vínculo mudaram, cria uma linha; caso contrário, atualiza os controles existentes.
5. Move a linha somente se ela estiver fora da posição visual desejada.
6. Remove as linhas que não pertencem mais à lista.
7. Preserva o foco de um controle que continua na página e visível.
8. Atualiza totais, mensagem da busca, botões e área de recuperação.

O `Set` chamado `atuais` guarda as linhas que devem permanecer. `registroRenderizado` é uma cópia usada para comparar os dados visuais da linha; ele não é a fonte dos dados do inventário. As ações passam pelo controlador e pelas regras em `inventario.js`.

O índice representa a posição atual no inventário, não um identificador permanente. Ele basta para os eventos síncronos atuais e é reavaliado em cada atualização. Se o projeto passar a ter sincronização ou operações concorrentes sobre registros individuais, identificadores próprios por registro deverão substituir esse uso do índice.

## Foco dos botões de quantidade

Depois de ativar +1 ou −1, o controlador localiza o botão usando `data-indice` e `data-acao` e devolve o foco a ele. Isso permite ativações sucessivas por teclado. O comportamento de Enter dentro do campo numérico é diferente: confirma a edição e retorna ao campo de cadastro.

O `pointerdown` dos botões impede que a perda de foco confirme e atualize a linha antes do clique. A ação lê a quantidade atual do campo. É importante conferir esse comportamento com teclado, mouse e toque no navegador real.

## Próxima simplificação

Antes de substituir essa estratégia, reproduza no navegador: editar uma quantidade e clicar diretamente em +1; usar Tab depois da edição; e ativar os botões repetidamente com Enter e Espaço enquanto a ordenação por quantidade está ativa. Esses casos devem continuar funcionando após qualquer simplificação.
