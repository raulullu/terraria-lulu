const campoNome = document.getElementById("nome-item");
const botaoAdicionar = document.getElementById("adicionar-item");
const listaItens = document.getElementById("lista-itens");
const totalItens = document.getElementById("total-itens");
const mensagemItem = document.getElementById("mensagem-item");
const campoBusca = document.getElementById("buscar-item");

function adicionarItem() {
    const nome = campoNome.value.trim();

    if (nome === "") {
        mensagemItem.textContent = "Digite o nome de um item.";
        campoNome.focus();
        return;
    }

    mensagemItem.textContent = "";

    criarItem(nome);
    filtrarItens();
    atualizarTotal();
    salvarInventario();

    campoNome.value = "";
    campoNome.focus();
}

botaoAdicionar.addEventListener("click", adicionarItem);

function verificarTecla(evento) {
    if (evento.key === "Enter") {
        adicionarItem();
    }
}

campoNome.addEventListener("keydown", verificarTecla);

function atualizarTotal() {
    const quantidade = listaItens.children.length;
    totalItens.textContent = "Total de itens: " + quantidade;
}

atualizarTotal();

const botaoRemoverUltimo = document.getElementById("remover-ultimo");

function removerUltimoItem() {
    const ultimoItem = listaItens.lastElementChild;

    if (ultimoItem === null) {
        return;
    }

    ultimoItem.remove();

    atualizarTotal();
    salvarInventario();
}

botaoRemoverUltimo.addEventListener("click", removerUltimoItem);

function salvarInventario() {
    const nomes = [];

    for (const item of listaItens.children) {
        const textoItem = item.querySelector("span");
        nomes.push(textoItem.textContent);
    }

    const dados = JSON.stringify(nomes);
    localStorage.setItem("terraria-lulu-inventario", dados);
}

function carregarInventario() {
    const dados = localStorage.getItem("terraria-lulu-inventario");

    if (dados === null) {
        return;
    }

    const nomes = JSON.parse(dados);

    listaItens.textContent = "";

    for (const nome of nomes) {
        criarItem(nome);
    }

    atualizarTotal();
}
function criarItem(nome) {
    const novoItem = document.createElement("li");

    const textoItem = document.createElement("span");
    textoItem.textContent = nome;

    const botaoRemover = document.createElement("button");
    botaoRemover.type = "button";
    botaoRemover.textContent = "Remover";

    function removerEsteItem() {
        novoItem.remove();
        atualizarTotal();
        salvarInventario();
    }

    botaoRemover.addEventListener("click", removerEsteItem);

    novoItem.appendChild(textoItem);
    novoItem.appendChild(botaoRemover);
    listaItens.appendChild(novoItem);
}
function filtrarItens() {
    const busca = campoBusca.value.trim().toLowerCase();

    botaoRemoverUltimo.disabled = busca !== "";

    for (const item of listaItens.children) {
        const textoItem = item.querySelector("span");
        const nome = textoItem.textContent.toLowerCase();

        if (nome.includes(busca)) {
            item.style.display = "";
        } else {
            item.style.display = "none";
        }
    }
}

campoBusca.addEventListener("input", filtrarItens);

carregarInventario();
filtrarItens();