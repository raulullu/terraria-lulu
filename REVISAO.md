# Aplicar e conferir a revisão

## Antes de trocar os arquivos

1. Abra o aplicativo antigo e use **Exportar inventário**. Guarde esse JSON.
2. No terminal da pasta original, rode `git status`. Se houver alterações que deseja guardar, faça o commit antes de substituir os arquivos.
3. Crie uma branch com `git switch -c refino-do-projeto`.
4. Extraia o ZIP em uma pasta temporária. Copie o conteúdo de `terraria-lulu-revisado` para a pasta original do projeto, substituindo os arquivos de mesmo nome e acrescentando os novos.
5. Os nomes corretos são `index.html` e `script.js`, sem `(1)`. Os arquivos originais enviados não foram modificados; este pacote é uma versão revisada.
6. Não substitua a pasta `.git`. O pacote não contém essa pasta e não muda o endereço do repositório.
7. Use **Salvar Tudo** no VS Code e abra o `index.html` pelo Live Server.
8. Para acessar o armazenamento anterior, use o mesmo navegador, endereço e porta. Caso o inventário esteja em outro endereço, use o JSON exportado para importá-lo.

O código agora usa módulos; por isso todos os arquivos JavaScript do pacote precisam estar na mesma pasta. O `index.html` carrega apenas `script.js`, e os demais são importados por ele.

## O que mudou no funcionamento

- A ordem de exibição se mantém após adicionar ou editar; ela não altera a sequência de cadastro nos dados.
- “Remover último cadastrado” remove o último registro dessa sequência. A ordem histórica anterior à revisão não pode ser recuperada se a versão antiga já a tiver alterado.
- Escolher uma categoria manual antes de digitar o nome mantém essa escolha. Ao reconhecer um nome do catálogo, a categoria é preenchida e bloqueada; ao deixar de reconhecer, a escolha manual anterior é restaurada.
- Remoções oferecem desfazer até a próxima alteração do inventário, ou até recarregar a página.
- Um registro local com ID que não existe mais no catálogo vira manual e gera um aviso. Isso evita bloquear a edição permanentemente. Importações com IDs desconhecidos continuam sendo recusadas.
- Dados locais inválidos não são apagados nem sobrescritos automaticamente. A área de recuperação permite baixar o texto original, importar um JSON válido ou confirmar um reinício vazio.
- Registros manuais com o mesmo nome continuam permitidos. O vínculo é determinado pelo identificador, não pela igualdade do nome.

## Conferência no navegador

Faça os testes de alteração em uma cópia do inventário ou guarde primeiro o JSON exportado.

1. Cadastre um item pelo botão e outro por Enter. Confira a limpeza dos campos, o foco e os totais.
2. Escolha “Armas” antes de digitar um nome manual. Confira que a categoria permanece.
3. Digite “Pedra”: a categoria deve ser definida pelo catálogo. Edite o nome para um desconhecido: a categoria manual deve voltar.
4. Tente adicionar duas Pedras vinculadas. A segunda deve ser recusada.
5. Cadastre três nomes fora de ordem. Escolha A a Z e adicione um quarto nome. A lista deve continuar ordenada.
6. Selecione maior quantidade e edite uma quantidade. A posição visual e os totais devem mudar.
7. Busque por `pocao` tendo um item chamado `Poção`. Combine com categoria; confira os totais encontrados.
8. Pressione Esc na busca. Só a busca deve ser limpa. Use Limpar filtros para limpar também a categoria.
9. Com uma busca que não combina, adicione um item. A mensagem deve avisar que ele está oculto; limpar os filtros deve revelá-lo.
10. Use +1, −1 e o campo numérico. Em uma unidade, −1 deve recusar a redução. Confira também editar o campo e clicar diretamente em +1.
11. Renomeie um item manual; confira os rótulos e a busca. Cancele o diálogo e confira que nada muda.
12. Remova um item e use Desfazer. Depois ordene, remova o último cadastrado e confira qual registro foi removido.
13. Exporte com filtros ativos. O arquivo deve conter todos os registros.
14. Importe um JSON inválido: nada deve mudar. Cancele uma importação válida: nada deve mudar. Confirme: os dados devem ser substituídos.
15. Recarregue a página e confira dados e ordem selecionada.
16. Use Tab para percorrer os controles e Esc para fechar os diálogos. Confira foco visível e retorno do foco.
17. Confira uma tela estreita ou a simulação de celular no navegador. Os controles devem caber sem rolagem horizontal da página.

## Conferência automatizada

```sh
npm test
```

Os testes abrangem migração, dados inválidos, catálogo, duplicidade, quantidades seguras, falhas de gravação, confirmação e cancelamento de importação, recuperação, filtros, ordenação e desfazer. A interface usa um DOM simulado nos testes; diálogos nativos, layout e leitores de tela precisam da conferência no navegador.

## Depois de conferir

```sh
git add index.html style.css catalogo.js inventario.js armazenamento.js interface.js script.js utilidades.js package.json README.md REVISAO.md tests
git commit -m "Refina inventário, armazenamento e interface"
git push -u origin refino-do-projeto
```

Essa branch permite revisar a versão sem substituir imediatamente a `master`. A publicação e a união das branches podem ser feitas depois da conferência.

## Roteiro para fixar o aprendizado

1. Explique por que ordenar a exibição não deve alterar a ordem dos dados.
2. Acompanhe o percurso: evento → preparar alteração → tentar salvar → trocar estado → renderizar.
3. Explique por que cancelar ou falhar ao importar mantém os dados anteriores.
4. Compare a função antiga de categoria com a nova e identifique a condição que preserva a escolha manual.
5. Leia uma função curta, feche o arquivo, tente escrevê-la e compare. Comece por `quantidadeValida`, depois `removerItem` e `normalizarTexto`.
6. Estude os conceitos novos separadamente: módulos, `map`, `filter`, `find`, `Set` e cópia de objetos com `...`.
