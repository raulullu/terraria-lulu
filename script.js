const campoNome = document.getElementById("nome-item");
const botaoAdicionar = document.getElementById("adicionar-item");
const listaItens = document.getElementById("lista-itens");
const totalItens = document.getElementById("total-itens");
const mensagemItem = document.getElementById("mensagem-item");
const campoBusca = document.getElementById("buscar-item");
const campoQuantidade = document.getElementById("quantidade-item");
const botaoRemoverUltimo = document.getElementById("remover-ultimo");
const mensagemBusca = document.getElementById("mensagem-busca");
const botaoOrdenar = document.getElementById("ordenar-itens");
const campoOrdem = document.getElementById("ordem-itens");
const botaoExportar = document.getElementById("exportar-itens");
const campoImportar = document.getElementById("importar-itens");
const campoCategoria = document.getElementById("categoria-item");
const filtroCategoria = document.getElementById("filtrar-categoria");
const botaoLimparFiltros = document.getElementById("limpar-filtros");
const sugestoesItens = document.getElementById("sugestoes-itens");

const inventario = [];

function mostrarSucesso(texto) {
    mensagemItem.classList.add("sucesso");
    mensagemItem.textContent = texto;
}

function mostrarErro(texto) {
    mensagemItem.classList.remove("sucesso");
    mensagemItem.textContent = texto;
}

function avisarQuantidade(nome, quantidade) {
    mostrarSucesso(
        `Quantidade de ${nome} atualizada para ${quantidade}.`
    );
}

function buscarRegistroDoCatalogo(catalogoId) {
    for (const item of inventario) {
        if (item.catalogoId === catalogoId) {
            return item;
        }
    }

    return null;
}

function quantidadeValida(quantidade) {
    return Number.isInteger(quantidade) && quantidade > 0;
}

function adicionarItem() {
    const nome = campoNome.value.trim();
    const quantidade = Number(campoQuantidade.value);

    if (nome === "") {
        mostrarErro("Digite o nome de um item.");
        campoNome.focus();
        return;
    }

    if (quantidadeValida(quantidade) === false) {
        mostrarErro("Digite uma quantidade inteira maior que zero.");
        campoQuantidade.focus();
        return;
}

const itemEncontrado = buscarNoCatalogo(nome);

const item = {
    catalogoId: null,
    nome: nome,
    quantidade: quantidade,
    categoria: campoCategoria.value
};

if (itemEncontrado !== null) {
    item.catalogoId = itemEncontrado.id;
    item.nome = itemEncontrado.nome;
    item.categoria = itemEncontrado.categoria;
}
if (item.catalogoId !== null) {
    const registroExistente = buscarRegistroDoCatalogo(item.catalogoId);

    if (registroExistente !== null) {
        mostrarErro(
            `${item.nome} já está no inventário. Edite a quantidade na linha existente.`
        );

        campoNome.focus();
        return;
    }
}
    registrarItem(item);
    renderizarInventario();
    salvarInventario();

    campoNome.value = "";
    campoQuantidade.value = "1";
    preencherCategoria();
    campoNome.focus();

    mostrarSucesso(`Item adicionado: ${item.nome}`);
}

function verificarTecla(evento) {
    if (evento.key === "Enter") {
        adicionarItem();
    }
}

function atualizarTotal() {
    const itens = obterItens();
    const registros = itens.length;
    let totalUnidades = 0;

    for (const item of itens) {
        totalUnidades = totalUnidades + item.quantidade;
    }

    totalItens.textContent =
        `Registros: ${registros} | Unidades: ${totalUnidades}`;
}

function removerDoInventario(item) {
    const posicao = inventario.indexOf(item);

    if (posicao !== -1) {
        inventario.splice(posicao, 1);
    }
}

function removerUltimoItem() {
    if (inventario.length === 0) {
        mostrarErro("Não há itens para remover.");
        return;
    }

    const ultimoItem = inventario[inventario.length - 1];
    const nome = ultimoItem.nome;

    removerDoInventario(ultimoItem);
    renderizarInventario();
    salvarInventario();

    campoNome.focus();
    mostrarSucesso(`Item removido: ${nome}`);
}

function obterItens() {
    return inventario;
}

function buscarNoCatalogo(nome) {
    const nomeBuscado = normalizarTexto(nome);

    for (const item of catalogoItens) {
        if (normalizarTexto(item.nome) === nomeBuscado) {
            return item;
        }
    }

    return null;
}

function preencherCategoria() {
    const itemEncontrado = buscarNoCatalogo(campoNome.value);

    if (itemEncontrado === null) {
        campoCategoria.value = "outros";
        campoCategoria.disabled = false;
        return;
    }

    campoCategoria.value = itemEncontrado.categoria;
    campoCategoria.disabled = true;
}

campoNome.addEventListener("input", preencherCategoria);

function categoriaValida(categoria) {
    const categorias = [
        "outros",
        "materiais",
        "armas",
        "acessorios",
        "armaduras",
        "consumiveis"
    ];

    return categorias.includes(categoria);
}

async function lerInventario() {
    mensagemItem.classList.remove("sucesso");
    const arquivo = campoImportar.files[0];

    if (arquivo === undefined) {
        return;
    }

    try {
        const texto = await arquivo.text();
        const itens = JSON.parse(texto);

        if (Array.isArray(itens) === false) {
            throw new Error("O arquivo precisa conter uma lista de itens.");
        }
        const idsEncontrados = [];
        for (const item of itens) {
            if (item === null || typeof item !== "object") {
                throw new Error("Existe um item inválido no arquivo.");
            }

            if (typeof item.nome !== "string" || item.nome.trim() === "") {
                throw new Error("Existe um item sem nome válido.");
            }

            if (quantidadeValida(item.quantidade) === false) {
                throw new Error("Existe uma quantidade inválida.");
            }
            if (
            item.categoria !== undefined &&
            categoriaValida(item.categoria) === false
          ) {
            throw new Error("Existe uma categoria inválida.");
            }
            if (item.catalogoId !== undefined && item.catalogoId !== null) {
    if (
        typeof item.catalogoId !== "string" ||
        item.catalogoId.trim() === ""
    ) {
        throw new Error("Existe um identificador de catálogo inválido.");
    }
if (idsEncontrados.includes(item.catalogoId)) {
    throw new Error(
        `Identificador repetido no arquivo: ${item.catalogoId}.`
    );
}

idsEncontrados.push(item.catalogoId);
    const itemDoCatalogo = buscarNoCatalogoPorId(item.catalogoId);

    if (itemDoCatalogo === null) {
        throw new Error(
            `Item não encontrado no catálogo: ${item.catalogoId}.`
        );
    }
}
}
        const confirmou = window.confirm(
            "Este arquivo tem " + itens.length +
            " registros e substituirá todo o inventário atual. Deseja continuar?"
        );

        if (confirmou === false) {
            mensagemItem.textContent = "Importação cancelada.";
            return;
        }

        inventario.length = 0;
        listaItens.textContent = "";

        for (const item of itens) {
            registrarItem({
    catalogoId: item.catalogoId,
    nome: item.nome.trim(),
    quantidade: item.quantidade,
    categoria: item.categoria
    });
}

        renderizarInventario();
        salvarInventario();
        mostrarSucesso(
            "Inventário importado com sucesso! Registros: " + itens.length
        );
    } catch (erro) {
        mostrarErro("Não foi possível importar: " + erro.message);
    } finally {
        campoImportar.value = "";
    }
}

campoImportar.addEventListener("change", lerInventario);

function limparFiltros() {
    campoBusca.value = "";
    filtroCategoria.value = "todas";

    filtrarItens();
    campoBusca.focus();
}

botaoLimparFiltros.addEventListener("click", limparFiltros);

function carregarSugestoes() {
    sugestoesItens.textContent = "";

    for (const item of catalogoItens) {
        const opcao = document.createElement("option");
        opcao.value = item.nome;

        sugestoesItens.appendChild(opcao);
    }
}

function exportarInventario() {
    const itens = obterItens();
    const dados = JSON.stringify(itens, null, 2);

    const arquivo = new Blob([dados], {
        type: "application/json"
    });

    const endereco = URL.createObjectURL(arquivo);
    const link = document.createElement("a");

    link.href = endereco;
    const agora = new Date();

const ano = agora.getFullYear();
const mes = String(agora.getMonth() + 1).padStart(2, "0");
const dia = String(agora.getDate()).padStart(2, "0");

const hora = String(agora.getHours()).padStart(2, "0");
const minuto = String(agora.getMinutes()).padStart(2, "0");
const segundo = String(agora.getSeconds()).padStart(2, "0");

link.download =
    `terraria-lulu-inventario-${ano}-${mes}-${dia}_${hora}-${minuto}-${segundo}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(function () {
        URL.revokeObjectURL(endereco);
    }, 1000);
}

botaoExportar.addEventListener("click", exportarInventario);

function salvarInventario() {
    const itens = obterItens();
    const dados = JSON.stringify(itens);

    localStorage.setItem("terraria-lulu-inventario", dados);
}

function ordenarItens() {
    const ordem = campoOrdem.value;
    
    inventario.sort(function (primeiro, segundo) {
        if (ordem === "menor-quantidade") {
            return primeiro.quantidade - segundo.quantidade;
        }

        if (ordem === "quantidade") {
            return segundo.quantidade - primeiro.quantidade;
        }

        if (ordem === "za") {
            return segundo.nome.localeCompare(primeiro.nome, "pt-BR");
        }

        return primeiro.nome.localeCompare(segundo.nome, "pt-BR");
    });

    renderizarInventario();

    salvarInventario();
    localStorage.setItem("terraria-lulu-ordem", ordem);
}

botaoOrdenar.addEventListener("click", ordenarItens);

function carregarInventario() {
    const dados = localStorage.getItem("terraria-lulu-inventario");

    if (dados === null) {
        return;
    }

    const itens = JSON.parse(dados);

    inventario.length = 0;

    for (const item of itens) {
        if (typeof item === "string") {
            const itemConvertido = {
                catalogoId: null,
                nome: item,
                quantidade: 1,
                categoria: "outros"
            };

            registrarItem(itemConvertido);
        } else {
            registrarItem(item);
        }
    }

    renderizarInventario();
}

function carregarOrdem() {
    const ordemSalva = localStorage.getItem("terraria-lulu-ordem");

    if (
        ordemSalva === "az" ||
        ordemSalva === "za" ||
        ordemSalva === "quantidade" ||
        ordemSalva === "menor-quantidade"
    ) {
        campoOrdem.value = ordemSalva;
    }
}

function buscarNoCatalogoPorId(id) {
    for (const item of catalogoItens) {
        if (item.id === id) {
            return item;
        }
    }

    return null;
}

function registrarItem(item) {
    if (item.catalogoId === undefined) {
        item.catalogoId = null;
    }

    if (item.categoria === undefined) {
        item.categoria = "outros";
    }

    const itemDoCatalogo = buscarNoCatalogoPorId(item.catalogoId);

    if (itemDoCatalogo !== null) {
        item.nome = itemDoCatalogo.nome;
        item.categoria = itemDoCatalogo.categoria;
    }

    inventario.push(item);
}

function renderizarInventario() {
    listaItens.textContent = "";

    for (const item of inventario) {
        criarItem(item);
    }

    atualizarTotal();
    filtrarItens();
}

function nomeDaCategoria(categoria) {
    const nomes = {
        outros: "Outros",
        materiais: "Materiais",
        armas: "Armas",
        acessorios: "Acessórios",
        armaduras: "Armaduras",
        consumiveis: "Consumíveis"
    };

    return nomes[categoria];
}
function criarItem(item) {
    const novoItem = document.createElement("li");
    novoItem.dadosItem = item;
    novoItem.dataset.catalogoId = item.catalogoId || "";
    const vinculadoAoCatalogo = novoItem.dataset.catalogoId !== "";

    const textoItem = document.createElement("span");
    textoItem.textContent = item.nome;
    const textoCategoria = document.createElement("select");
    textoCategoria.className = "categoria-exibida";
    textoCategoria.setAttribute("aria-label", "Categoria de " + item.nome);

    for (const opcao of campoCategoria.options) {
    const novaOpcao = document.createElement("option");
    novaOpcao.value = opcao.value;
    novaOpcao.textContent = opcao.textContent;

    textoCategoria.appendChild(novaOpcao);
}

    let categoria = item.categoria;

    if (categoria === undefined) {
    categoria = "outros";
    }

    textoCategoria.value = categoria;
    textoCategoria.disabled = vinculadoAoCatalogo;
    novoItem.dataset.categoria = categoria;

function atualizarCategoria() {
    const novaCategoria = textoCategoria.value;

    if (categoriaValida(novaCategoria) === false) {
        mostrarErro("Escolha uma categoria válida.");
        textoCategoria.value = novoItem.dataset.categoria;
        return;
    }

    item.categoria = novaCategoria;
    novoItem.dataset.categoria = novaCategoria;

    salvarInventario();
    filtrarItens();

    mostrarSucesso(
        `Categoria de ${item.nome} atualizada para ${nomeDaCategoria(novaCategoria)}.`
    );
}

textoCategoria.addEventListener("change", atualizarCategoria);

    const textoQuantidade = document.createElement("input");
    textoQuantidade.type = "number";
    textoQuantidade.min = "1";
    textoQuantidade.step = "1";
    textoQuantidade.className = "quantidade-exibida";
    textoQuantidade.setAttribute(
        "aria-label",
        "Quantidade de " + item.nome
    );
    textoQuantidade.value = item.quantidade;

    function atualizarQuantidade() {
        mensagemItem.classList.remove("sucesso");
        const quantidade = Number(textoQuantidade.value);

        if (quantidadeValida(quantidade) === false) {
            mostrarErro("Digite uma quantidade inteira maior que zero.");

            textoQuantidade.value = item.quantidade;
            return;
        }

        mensagemItem.textContent = "";

        item.quantidade = quantidade;

        atualizarTotal();
        filtrarItens();
        salvarInventario();
        avisarQuantidade(item.nome, quantidade);
    }

    textoQuantidade.addEventListener("change", atualizarQuantidade);
    const botaoAumentar = document.createElement("button");
    botaoAumentar.type = "button";
botaoAumentar.textContent = "+1";
botaoAumentar.className = "botao-quantidade";
botaoAumentar.setAttribute(
    "aria-label",
    "Adicionar uma unidade de " + item.nome
);

function aumentarQuantidade() {
    textoQuantidade.value = item.quantidade + 1;
    atualizarQuantidade();
}

botaoAumentar.addEventListener("click", aumentarQuantidade);

    const botaoRemover = document.createElement("button");
    botaoRemover.type = "button";
    botaoRemover.textContent = "Remover";

    botaoRemover.setAttribute(
        "aria-label",
        "Remover " + item.nome
    );

    function removerEsteItem() {
    const nome = item.nome;

    removerDoInventario(item);
    renderizarInventario();
    salvarInventario();

    campoNome.focus();
    mostrarSucesso(`Item removido: ${nome}`);
}

    botaoRemover.addEventListener("click", removerEsteItem);

    novoItem.appendChild(textoItem);
    novoItem.appendChild(textoCategoria);
    novoItem.appendChild(textoQuantidade);
    novoItem.appendChild(botaoAumentar);
    novoItem.appendChild(botaoRemover);

    const botaoRenomear = document.createElement("button");
    botaoRenomear.type = "button";
    botaoRenomear.textContent = "Renomear";
    botaoRenomear.disabled = vinculadoAoCatalogo;
    botaoRenomear.setAttribute("aria-label", "Renomear " + item.nome);

    function renomearItem() {
        mensagemItem.classList.remove("sucesso");
        const resposta = window.prompt("Novo nome do item:", item.nome);

        if (resposta === null) {
            return;
        }

        const novoNome = resposta.trim();

        if (novoNome === "") {
            mostrarErro("Digite um nome válido para o item.");
            return;
        }

        item.nome = novoNome;
        textoItem.textContent = novoNome;
        botaoAumentar.setAttribute(
        "aria-label",
        "Adicionar uma unidade de " + novoNome
        );
        textoCategoria.setAttribute("aria-label", "Categoria de " + novoNome);

        textoQuantidade.setAttribute("aria-label", "Quantidade de " + novoNome);
        botaoRemover.setAttribute("aria-label", "Remover " + novoNome);
        botaoRenomear.setAttribute("aria-label", "Renomear " + novoNome);

        mensagemItem.textContent = "";

        salvarInventario();
        filtrarItens();
        mostrarSucesso(`Item renomeado: ${novoNome}`);
    }

    botaoRenomear.addEventListener("click", renomearItem);
    novoItem.insertBefore(botaoRenomear, botaoRemover);
    
    listaItens.appendChild(novoItem);
}

function normalizarTexto(texto) {
    return texto
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function filtrarItens() {
    const busca = normalizarTexto(campoBusca.value);
    const categoria = filtroCategoria.value;
    let encontrados = 0;
    let unidadesEncontradas = 0;

    botaoRemoverUltimo.disabled =
        busca !== "" || categoria !== "todas";

    for (const linha of listaItens.children) {
    const item = linha.dadosItem;
    const nome = normalizarTexto(item.nome);

    const combinaNome = nome.includes(busca);

    const combinaCategoria =
        categoria === "todas" ||
        item.categoria === categoria;

    if (combinaNome && combinaCategoria) {
        linha.style.display = "";
        encontrados = encontrados + 1;
        unidadesEncontradas = unidadesEncontradas + item.quantidade;
    } else {
        linha.style.display = "none";
    }
}

    if (inventario.length === 0) {
        mensagemBusca.textContent = "Seu inventário está vazio.";
    } else if (encontrados === 0) {
        mensagemBusca.textContent = "Nenhum item encontrado.";
    } else if (busca !== "" || categoria !== "todas") {
        mensagemBusca.textContent =
            `Registros encontrados: ${encontrados} | Unidades: ${unidadesEncontradas}`;
    } else {
        mensagemBusca.textContent = "";
    }
}

botaoAdicionar.addEventListener("click", adicionarItem);
campoNome.addEventListener("keydown", verificarTecla);
campoQuantidade.addEventListener("keydown", verificarTecla);
botaoRemoverUltimo.addEventListener("click", removerUltimoItem);
function limparBusca(evento) {
    if (evento.key === "Escape") {
        campoBusca.value = "";
        filtrarItens();
    }
}
campoBusca.addEventListener("input", filtrarItens);
filtroCategoria.addEventListener("change", filtrarItens);
campoBusca.addEventListener("keydown", limparBusca);

carregarSugestoes();
carregarInventario();
carregarOrdem();
atualizarTotal();
filtrarItens();