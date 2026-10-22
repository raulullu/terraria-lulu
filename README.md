# Terraria Lulu

Aplicativo para organizar meu inventário no Terraria. Projeto de estudo de HTML, CSS, JavaScript e Git, desenvolvido passo a passo com apoio de IA.

## Funcionalidades

### Inventário e catálogo

- Adicionar pelo botão ou por Enter, com validação de nome e quantidade.
- Editar quantidades pelo campo ou pelos botões +1 e −1, mantendo o mínimo de uma unidade.
- Renomear e alterar a categoria dos registros manuais. Um registro manual não pode ser renomeado para um nome do catálogo.
- Sugerir nomes do catálogo e preencher nome e categoria dos itens vinculados.
- Usar identificadores estáveis e impedir registros vinculados com ID repetido.
- Validar IDs, nomes equivalentes e categorias do catálogo ao iniciar.
- Remover individualmente ou remover o último cadastrado, independentemente da ordenação visual.
- Desfazer a última remoção enquanto nenhuma outra alteração do inventário for concluída.

### Busca e organização

- Combinar busca sem diferença de acentos ou maiúsculas com filtro por categoria.
- Mostrar totais de registros e unidades, incluindo os totais encontrados pelos filtros.
- Limpar apenas a busca com Esc ou limpar todos os filtros com um botão.
- Desativar a remoção do último cadastrado enquanto houver filtros ativos.
- Avisar quando um item adicionado estiver oculto pelos filtros atuais.
- Exibir por ordem de cadastro, nome ou quantidade; reaplicar a ordenação após alterações.
- Preservar a ordem de cadastro nos dados. Ordenar muda apenas a exibição.

### Armazenamento e cópias de segurança

- Salvar inventário e preferência de ordenação no navegador.
- Validar registros ao carregar e ao importar, usando as mesmas regras.
- Mostrar mensagens em português quando os dados salvos ou o arquivo importado não são um JSON válido.
- Aceitar no carregamento os formatos antigos: arrays de nomes e objetos sem categoria ou identificador.
- Carregar referências removidas do catálogo como itens manuais, com aviso; arquivos importados com IDs desconhecidos continuam sendo recusados.
- Gravar antes de trocar o inventário em uso. Se a gravação falhar, a alteração não é aplicada.
- Manter dados locais inválidos intactos e oferecer recuperação por arquivo ou reinício confirmado.
- Exportar todo o inventário em JSON, independentemente dos filtros, com data e horário no nome do arquivo.
- Validar completamente o arquivo importado antes de confirmar a substituição e tentar salvar.
- Preservar o inventário atual se a importação for inválida, cancelada ou se a gravação falhar.

### Interface e acessibilidade

- Layout responsivo, controles com rótulos e foco visível ao navegar pelo teclado.
- Manter o foco no botão +1 ou −1 usado, para repetir a ação pelo teclado, e preservar a semântica de lista em leitores de tela.
- Mensagens identificadas por texto e cor; região de status preparada para anúncios repetidos.
- Formulário de cadastro com envio por Enter.
- Diálogos HTML para renomear e confirmar substituições.
- Cores diferentes para ações principais, secundárias e de remoção.

## Como executar

1. Abra a pasta do projeto no VS Code.
2. Com a extensão Live Server instalada, abra `index.html` e clique em **Go Live**.
3. Use a página aberta no navegador.

O aplicativo usa módulos JavaScript. Abra pelo Live Server, não por duplo clique no arquivo. Não precisa instalar pacotes para usar o aplicativo.

## Organização do código

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Formulários, seções e diálogos. |
| `style.css` | Layout, cores, estados e adaptação para telas menores. |
| `catalogo.js` | Catálogo, categorias, consultas e validação do catálogo. |
| `inventario.js` | Validação, migração e regras para preparar alterações dos dados. |
| `armazenamento.js` | Leitura e gravação local, leitura de arquivos e exportação. |
| `interface.js` | Montagem dos controles, filtros, ordenação visual, mensagens e diálogos. |
| `script.js` | Estado da aplicação e ligação entre eventos, regras, armazenamento e interface. |
| `utilidades.js` | Normalização de textos e cópia dos registros. |
| `tests/` | Testes de regras, armazenamento e fluxos com DOM simulado. |
| `docs/` | Checklist de conferência no navegador e roteiro de estudo. |

As dependências são declaradas com `import` e `export`. Os dados seguem este formato:

```json
[
    {
        "catalogoId": "madeira",
        "nome": "Madeira",
        "quantidade": 44,
        "categoria": "materiais"
    }
]
```

Itens manuais usam `"catalogoId": null`. Registros manuais podem ter nomes iguais entre si; apenas os IDs vinculados devem ser únicos. Cadastrar um nome do catálogo vincula o item automaticamente, e renomear um registro manual para um nome do catálogo é recusado: remova o registro e cadastre pelo nome. Dados antigos ou importados que já tenham um registro manual com nome do catálogo continuam sendo aceitos.

## Armazenamento e recuperação

O inventário fica no `localStorage`, na chave `terraria-lulu-inventario`; a preferência usa `terraria-lulu-ordem`. As chaves anteriores foram preservadas.

O navegador identifica esse armazenamento pelo protocolo, endereço e porta. Alterar de `127.0.0.1` para `localhost`, mudar a porta ou publicar em outro endereço não transfere os dados. Exporte e importe para fazer a transferência.

Não há sincronização automática entre dispositivos ou abas. Evite editar simultaneamente em mais de uma aba.

O Git e o GitHub guardam versões do código. Os arquivos JSON exportados guardam os dados do inventário. O desfazer vale apenas para a última remoção desta sessão; ele termina na próxima alteração do inventário ou ao recarregar a página. Buscar e ordenar não encerram o desfazer.

## Testes

Com Node.js instalado, execute na pasta do projeto:

```sh
npm test
```

Os testes usam o executor integrado do Node.js e não exigem dependências; `npm test` roda todos os arquivos `*.test.js` encontrados, inclusive `tests/logica-extra.test.js`. Há testes das regras, das falhas de armazenamento e dos fluxos da interface em um DOM simulado. A simulação não verifica aparência, comportamento nativo dos diálogos, validação nativa de formulários nem leitores de tela. Veja também o roteiro em `docs/checklist-manual.md` para conferir no navegador.

## Limitações e próximos passos

- O catálogo ainda contém três exemplos; o Item de Teste será retirado quando o catálogo definitivo for preparado.
- Quantidades e total precisam ser inteiros positivos representáveis com segurança em JavaScript. Valores acima de `Number.MAX_SAFE_INTEGER` são recusados.
- A ordem de cadastro passa a ser preservada daqui em diante. Ordenações já gravadas pela versão antiga não permitem recuperar a ordem histórica anterior.
- Publicação no GitHub Pages e conferência com leitores de tela ficam como etapas posteriores.
- As informações do catálogo definitivo ainda precisam ser conferidas com fontes do jogo.
