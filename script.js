const campoNome = document.getElementById("nome-item");
const botaoAdicionar = document.getElementById("adicionar-item");
const listaItens = document.getElementById("lista-itens");
const totalItens = document.getElementById("total-itens");

function adicionarItem() {
    const nome = campoNome.value.trim();

    if (nome === "") {
        return;
    }

    const novoItem = document.createElement("li");
    novoItem.textContent = nome;
    listaItens.appendChild(novoItem);
    atualizarTotal();
    salvarInventario();

campoNome.value = "";
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
        nomes.push(item.textContent);
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
        const novoItem = document.createElement("li");
        novoItem.textContent = nome;
        listaItens.appendChild(novoItem);
    }

    atualizarTotal();
}

carregarInventario();