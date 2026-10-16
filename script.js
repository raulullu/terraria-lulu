const campoNome = document.getElementById("nome-item");
const botaoAdicionar = document.getElementById("adicionar-item");
const listaItens = document.getElementById("lista-itens");
const totalItens = document.getElementById("total-itens");
const mensagemItem = document.getElementById("mensagem-item");
const campoBusca = document.getElementById("buscar-item");
const campoQuantidade = document.getElementById("quantidade-item");

function adicionarItem() {
    const nome = campoNome.value.trim();
    const quantidade = Number(campoQuantidade.value);

    if (nome === "") {
        mensagemItem.textContent = "Digite o nome de um item.";
        campoNome.focus();
        return;
    }

    if (Number.isInteger(quantidade) === false || quantidade < 1) {
        mensagemItem.textContent = "Digite uma quantidade inteira ou maior que zero.";
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
    const itens = [];

    for (const item of listaItens.children) {
        const nome = item.querySelector("span").textContent;
        const quantidade = Number(
            item.querySelector(".quantidade-exibida").textContent
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

    atualizarTotal();
}

function criarItem(item) {
    const novoItem = document.createElement("li");

    const textoItem = document.createElement("span");
    textoItem.textContent = item.nome;

    const textoQuantidade = document.createElement("span");
    textoQuantidade.className = "quantidade-exibida";
    textoQuantidade.textContent = item.quantidade;

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
    novoItem.appendChild(textoQuantidade);
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