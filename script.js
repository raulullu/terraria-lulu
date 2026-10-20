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

    const item = {
    nome: nome,
    quantidade: quantidade,
    categoria: campoCategoria.value
};

    criarItem(item);
    filtrarItens();
    atualizarTotal();
    salvarInventario();

    campoNome.value = "";
    campoQuantidade.value = "1";
    campoNome.focus();

    mostrarSucesso("Item adicionado: " + nome);
}

function verificarTecla(evento) {
    if (evento.key === "Enter") {
        adicionarItem();
    }
}

function atualizarTotal() {
    const registros = listaItens.children.length;
    let totalUnidades = 0;

    for (const item of listaItens.children) {
        const quantidade = Number(
            item.querySelector(".quantidade-exibida").value
        );

        totalUnidades = totalUnidades + quantidade;
    }

    totalItens.textContent =
    `Registros: ${registros} | Unidades: ${totalUnidades}`;
}

function removerUltimoItem() {
    const ultimoItem = listaItens.lastElementChild;

    if (ultimoItem === null) {
        mostrarErro("Não há itens para remover.");
        return;
    }

    const nome = ultimoItem.querySelector("span").textContent;

    ultimoItem.remove();
    atualizarTotal();
    salvarInventario();
    filtrarItens();
    campoNome.focus();

    mostrarSucesso("Item removido: " + nome);
}

function obterItens() {
    const itens = [];

    for (const item of listaItens.children) {
        const nome = item.querySelector("span").textContent;

        const quantidade = Number(
            item.querySelector(".quantidade-exibida").value
        );

        const categoria = item.dataset.categoria;

        const itemSalvo = {
            nome: nome,
            quantidade: quantidade,
            categoria: categoria
        };

        itens.push(itemSalvo);
    }

    return itens;
}

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
}
        const confirmou = window.confirm(
            "Este arquivo tem " + itens.length +
            " registros e substituirá todo o inventário atual. Deseja continuar?"
        );

        if (confirmou === false) {
            mensagemItem.textContent = "Importação cancelada.";
            return;
        }

        listaItens.textContent = "";

        for (const item of itens) {
            criarItem({
        nome: item.nome.trim(),
        quantidade: item.quantidade,
        categoria: item.categoria
        });
        }

        salvarInventario();
        atualizarTotal();
        filtrarItens();
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
    const itens = Array.from(listaItens.children);
    const ordem = campoOrdem.value;

    itens.sort(function (primeiro, segundo) {

        if (ordem === "quantidade" || ordem === "menor-quantidade") {
            const quantidadePrimeiro = Number(
                primeiro.querySelector(".quantidade-exibida").value
            );

            const quantidadeSegundo = Number(
                segundo.querySelector(".quantidade-exibida").value
            );

            if (ordem === "menor-quantidade") {
                return quantidadePrimeiro - quantidadeSegundo;
            }

            return quantidadeSegundo - quantidadePrimeiro;
        }
        const nomePrimeiro = primeiro.querySelector("span").textContent;
        const nomeSegundo = segundo.querySelector("span").textContent;

        if (ordem === "za") {
            return nomeSegundo.localeCompare(nomePrimeiro, "pt-BR");
        }

        return nomePrimeiro.localeCompare(nomeSegundo, "pt-BR");
    });

    for (const item of itens) {
        listaItens.appendChild(item);
    }

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

    listaItens.textContent = "";

    for (const item of itens) {
        if (typeof item === "string") {
            const itemConvertido = {
                nome: item,
                quantidade: 1
            };

            criarItem(itemConvertido);
        } else {
            criarItem(item);
        }
    }
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

    const textoItem = document.createElement("span");
    textoItem.textContent = item.nome;
    const textoCategoria = document.createElement("small");

    let categoria = item.categoria;

    if (categoria === undefined) {
    categoria = "outros";
    }

    textoCategoria.textContent = nomeDaCategoria(categoria);
    novoItem.dataset.categoria = categoria;

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
        salvarInventario();
        avisarQuantidade(item.nome, quantidade);
    }

    textoQuantidade.addEventListener("change", atualizarQuantidade);

    const botaoRemover = document.createElement("button");
    botaoRemover.type = "button";
    botaoRemover.textContent = "Remover";

    botaoRemover.setAttribute(
        "aria-label",
        "Remover " + item.nome
    );

    function removerEsteItem() {
        novoItem.remove();
        atualizarTotal();
        salvarInventario();
        filtrarItens();
        campoNome.focus();

        mostrarSucesso("Item removido: " + item.nome);
    }

    botaoRemover.addEventListener("click", removerEsteItem);

    novoItem.appendChild(textoItem);
    novoItem.appendChild(textoCategoria);
    novoItem.appendChild(textoQuantidade);
    novoItem.appendChild(botaoRemover);

    const botaoRenomear = document.createElement("button");
    botaoRenomear.type = "button";
    botaoRenomear.textContent = "Renomear";
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

    botaoRemoverUltimo.disabled =
        busca !== "" || categoria !== "todas";

    for (const item of listaItens.children) {
        const nome = normalizarTexto(
            item.querySelector("span").textContent
        );

        const combinaNome = nome.includes(busca);

        const combinaCategoria =
            categoria === "todas" ||
            item.dataset.categoria === categoria;

        if (combinaNome && combinaCategoria) {
            item.style.display = "";
            encontrados = encontrados + 1;
        } else {
            item.style.display = "none";
        }
    }

    if (listaItens.children.length === 0) {
        mensagemBusca.textContent = "Seu inventário está vazio.";
    } else if (encontrados === 0) {
        mensagemBusca.textContent = "Nenhum item encontrado.";
    } else if (busca !== "" || categoria !== "todas") {
        mensagemBusca.textContent =
            `Registros encontrados: ${encontrados}`;
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

carregarInventario();
carregarOrdem();
atualizarTotal();
filtrarItens();