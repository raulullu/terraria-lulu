const campoNome = document.getElementById("nome-item");
const botaoAdicionar = document.getElementById("adicionar-item");
const listaItens = document.getElementById("lista-itens");
const totalItens = document.getElementById("total-itens");
const mensagemItem = document.getElementById("mensagem-item");
const campoBusca = document.getElementById("buscar-item");
const campoQuantidade = document.getElementById("quantidade-item");
const botaoRemoverUltimo = document.getElementById("remover-ultimo");
const mensagemBusca = document.getElementById("mensagem-busca");

function adicionarItem() {
    const nome = campoNome.value.trim();
    const quantidade = Number(campoQuantidade.value);

    if (nome === "") {
        mensagemItem.textContent = "Digite o nome de um item.";
        campoNome.focus();
        return;
    }

    if (Number.isInteger(quantidade) === false || quantidade < 1) {
        mensagemItem.textContent =
            "Digite uma quantidade inteira maior que zero.";
        campoQuantidade.focus();
        return;
    }

    mensagemItem.textContent = "";

    const item = {
        nome: nome,
        quantidade: quantidade
    };

    criarItem(item);
    filtrarItens();
    atualizarTotal();
    salvarInventario();

    campoNome.value = "";
    campoQuantidade.value = "1";
    campoNome.focus();
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
        "Registros: " + registros + " | Unidades: " + totalUnidades;
}

function removerUltimoItem() {
    const ultimoItem = listaItens.lastElementChild;

    if (ultimoItem === null) {
        return;
    }

    ultimoItem.remove();
    atualizarTotal();
    salvarInventario();
    filtrarItens();
}

function salvarInventario() {
    const itens = [];

    for (const item of listaItens.children) {
        const nome = item.querySelector("span").textContent;
        const quantidade = Number(
            item.querySelector(".quantidade-exibida").value
        );

        const itemSalvo = {
            nome: nome,
            quantidade: quantidade
        };

        itens.push(itemSalvo);
    }

    const dados = JSON.stringify(itens);
    localStorage.setItem("terraria-lulu-inventario", dados);
}

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

function criarItem(item) {
    const novoItem = document.createElement("li");

    const textoItem = document.createElement("span");
    textoItem.textContent = item.nome;

    const textoQuantidade = document.createElement("input");
    textoQuantidade.type = "number";
    textoQuantidade.min = "1";
    textoQuantidade.step = "1";
    textoQuantidade.className = "quantidade-exibida";
    textoQuantidade.value = item.quantidade;
function atualizarQuantidade() {
    const quantidade = Number(textoQuantidade.value);

    if (Number.isInteger(quantidade) === false || quantidade < 1) {
        mensagemItem.textContent =
            "Digite uma quantidade inteira maior que zero.";

        textoQuantidade.value = item.quantidade;
        return;
    }

    mensagemItem.textContent = "";

    item.quantidade = quantidade;

    atualizarTotal();
    salvarInventario();
}

textoQuantidade.addEventListener("change", atualizarQuantidade);    

    const botaoRemover = document.createElement("button");
    botaoRemover.type = "button";
    botaoRemover.textContent = "Remover";

    function removerEsteItem() {
        novoItem.remove();
        atualizarTotal();
        salvarInventario();
        filtrarItens();
    }

    botaoRemover.addEventListener("click", removerEsteItem);

    novoItem.appendChild(textoItem);
    novoItem.appendChild(textoQuantidade);
    novoItem.appendChild(botaoRemover);

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
    let encontrados = 0;

    botaoRemoverUltimo.disabled = busca !== "";

    for (const item of listaItens.children) {
        const textoItem = item.querySelector("span");
        const nome = normalizarTexto(textoItem.textContent);

        if (nome.includes(busca)) {
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
campoBusca.addEventListener("keydown", limparBusca);

carregarInventario();
atualizarTotal();
filtrarItens();