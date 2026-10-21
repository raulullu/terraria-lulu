# Terraria Lulu

Aplicativo para organizar meu inventário no Terraria.

## Sobre o desenvolvimento

Projeto em desenvolvimento, criado para aprender HTML, CSS,
JavaScript e Git, com apoio de IA e implementação passo a passo.

## Funcionalidades

- Adicionar itens pelo botão ou pela tecla Enter.
- Validar nomes e quantidades inteiras maiores que zero.
- Editar a quantidade dos itens cadastrados.
- Renomear e alterar a categoria dos itens cadastrados manualmente.
- Remover itens individualmente ou remover o último da lista.
- Retornar o foco ao campo de nome após adicionar ou remover um item.
- Mostrar o total de registros e unidades do inventário.
- Buscar nomes sem diferenciar maiúsculas, minúsculas ou acentos.
- Combinar busca por nome e filtro de categoria.
- Mostrar registros e unidades encontrados pelos filtros.
- Limpar a busca com Esc ou limpar todos os filtros com um botão.
- Desativar a remoção do último item enquanto houver filtros ativos.
- Ordenar por nome de A a Z ou de Z a A, e por quantidade crescente ou decrescente.
- Salvar o inventário e a opção de ordenação no navegador.
- Exportar todo o inventário em JSON, com data e horário no nome do arquivo.
- Importar inventários com validação e confirmação antes da substituição.
- Preservar o inventário atual ao cancelar uma importação ou selecionar um arquivo inválido.
- Sugerir nomes a partir de um catálogo de itens.
- Usar identificadores estáveis para vincular registros ao catálogo.
- Preencher automaticamente o nome e a categoria dos itens vinculados.
- Bloquear renomeação e edição de categoria dos itens vinculados, permitindo alterar a quantidade.
- Preservar identificadores, nomes, categorias e quantidades ao salvar, exportar e importar.
- Impedir novos cadastros duplicados de itens vinculados ao catálogo.
- Recusar importações com identificadores desconhecidos ou repetidos.
- Mostrar confirmações em verde e erros em vermelho.
- Adaptar o layout para telas menores.
- Identificar campos e botões para leitores de tela.
- Destacar o foco ao navegar pelo teclado.
- Aumentar ou diminuir quantidades pelos botões +1 e −1, mantendo o mínimo de uma unidade.

## Organização do código

- index.html: estrutura e conteúdo da página.
- style.css: aparência, layout responsivo e indicação visual de foco.
- catalogo.js: catálogo de referência com identificadores, nomes e categorias.
- script.js: comportamentos, validações, filtros, ordenação e persistência.

O inventário é mantido em um array de objetos.
O registro dos dados é separado da renderização da lista na tela.
Os dados dos itens vinculados são preparados com base no catálogo antes da renderização.

## Como executar

1. Abra a pasta do projeto no VS Code.
2. Com a extensão Live Server instalada, abra index.html e clique em Go Live.
3. Utilize o aplicativo na página aberta no navegador.

## Armazenamento e cópias de segurança

O inventário fica salvo no localStorage do navegador utilizado.
Os dados não são sincronizados automaticamente entre navegadores ou dispositivos.

Use Exportar inventário para baixar uma cópia em JSON.
Para restaurá-la, selecione o arquivo em Importar inventário e confirme a substituição.

O Git e o GitHub guardam as versões do código.
Os arquivos JSON exportados guardam os dados do inventário.