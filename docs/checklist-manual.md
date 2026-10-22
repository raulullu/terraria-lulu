# Checklist manual e roteiro de estudo

Use este roteiro depois de mudar o código. Os testes automatizados cobrem as regras, mas não cobrem aparência,
diálogos nativos, validação nativa de formulários, foco do teclado nem leitores de tela.

Faça os testes de alteração em uma cópia do inventário ou guarde antes um JSON com **Exportar inventário**.
Abra sempre pelo Live Server, com o mesmo endereço e a mesma porta, para ver os dados salvos anteriormente.

## Conferência no navegador

1. Cadastre um item pelo botão e outro por Enter. Confira a limpeza dos campos, o foco e os totais.
2. Escolha "Armas" antes de digitar um nome manual. Confira que a categoria permanece.
3. Digite "Pedra": a categoria deve ser definida pelo catálogo. Altere o texto para um nome desconhecido: a categoria manual deve voltar.
4. Tente adicionar duas Pedras vinculadas. A segunda deve ser recusada.
5. Cadastre três nomes fora de ordem. Escolha A a Z e adicione um quarto nome. A lista deve continuar ordenada.
6. Selecione "Maior quantidade" e edite uma quantidade. A posição visual e os totais devem mudar.
7. Busque por `pocao` tendo um item chamado `Poção`. Combine com categoria e confira os totais encontrados.
8. Pressione Esc na busca: só a busca deve ser limpa. Use Limpar filtros para limpar também a categoria.
9. Com uma busca que não combina, adicione um item. A mensagem deve avisar que ele está oculto; limpar os filtros deve revelá-lo.
10. Use +1, −1 e o campo numérico. Em uma unidade, −1 deve recusar a redução. Edite o campo e clique direto em +1.
11. **Teclado:** com Tab, chegue ao botão +1 de uma linha e aperte Enter várias vezes. O foco deve continuar no botão e a quantidade deve subir a cada vez.
12. Renomeie um item manual; confira os rótulos e a busca. Cancele o diálogo e confira que nada muda.
13. **Nova regra:** renomeie um item manual para "Pedra". Deve aparecer o erro dizendo que é um item do catálogo, e o nome não muda.
14. Remova um item e use Desfazer. Depois ordene, remova o último cadastrado e confira qual registro foi removido.
15. Exporte com filtros ativos. O arquivo deve conter todos os registros.
16. Importe um arquivo de texto qualquer (não JSON): deve aparecer "O arquivo não é um JSON válido." e nada muda. Importe um JSON inválido, cancele uma importação válida e confirme outra: só a última substitui os dados.
17. Recarregue a página e confira os dados e a ordem selecionada.
18. Use Tab para percorrer os controles e Esc para fechar os diálogos. Confira foco visível e retorno do foco.
19. Confira uma tela estreita ou a simulação de celular do navegador. Nada deve causar rolagem horizontal da página.

## Conferência automatizada

```sh
npm test
```

## Roteiro para fixar o aprendizado

1. Explique por que ordenar a exibição não deve alterar a ordem dos dados.
2. Acompanhe o percurso: evento → preparar alteração → tentar salvar → trocar estado → renderizar.
3. Explique por que cancelar ou falhar ao importar mantém os dados anteriores.
4. Leia o comentário acima de `renderizarInventario` e explique, com suas palavras, por que a função reaproveita linhas.
5. Explique por que a regra de renomear fica em `inventario.js` e não em `script.js`.
6. Leia uma função curta, feche o arquivo, tente escrevê-la e compare. Comece por `quantidadeValida`, depois `removerItem` e `normalizarTexto`.
7. Estude os conceitos novos separadamente: módulos, `map`, `filter`, `find`, `Set` e cópia de objetos com `...`.
8. Exercício sem IA: escreva um teste novo em `tests/` para uma regra que você queira garantir e depois faça o código passar.
