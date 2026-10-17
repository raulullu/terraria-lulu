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

function obterItens() {
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

    return itens;
}

async function lerInventario() {
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

            if (
                Number.isInteger(item.quantidade) === false ||
                item.quantidade < 1
            ) {
                throw new Error("Existe uma quantidade inválida.");
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
        quantidade: item.quantidade
    });
}

salvarInventario();
atualizarTotal();
filtrarItens();

mensagemItem.textContent = "Inventário importado com sucesso!";
    } catch (erro) {
        mensagemItem.textContent =
            "Não foi possível importar: " + erro.message;
    } finally {
        campoImportar.value = "";
    }
}

campoImportar.addEventListener("change", lerInventario);

function exportarInventario() {
    const itens = obterItens();
    const dados = JSON.stringify(itens, null, 2);

    const arquivo = new Blob([dados], {
        type: "application/json"
    });

    const endereco = URL.createObjectURL(arquivo);
    const link = document.createElement("a");

    link.href = endereco;
    link.download = "terraria-lulu-inventario.json";

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

function criarItem(item) {
    const novoItem = document.createElement("li");

    const textoItem = document.createElement("span");
    textoItem.textContent = item.nome;

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

function carregarOrdem() {
    const ordemSalva = localStorage.getItem("terraria-lulu-ordem");

    if (ordemSalva === "az" || ordemSalva === "za") {
        campoOrdem.value = ordemSalva;
    }
}

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
}

    botaoRemover.addEventListener("click", removerEsteItem);

    novoItem.appendChild(textoItem);
    novoItem.appendChild(textoQuantidade);
    novoItem.appendChild(botaoRemover);
    
    const botaoRenomear = document.createElement("button");
botaoRenomear.type = "button";
botaoRenomear.textContent = "Renomear";
botaoRenomear.setAttribute("aria-label", "Renomear " + item.nome);

function renomearItem() {
    const resposta = window.prompt("Novo nome do item:", item.nome);

    if (resposta === null) {
        return;
    }

    const novoNome = resposta.trim();

    if (novoNome === "") {
        mensagemItem.textContent = "Digite um nome válido para o item.";
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
    } else if (busca !== "") {
    mensagemBusca.textContent = "Registros encontrados: " + encontrados;
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
carregarOrdem();
atualizarTotal();
filtrarItens();