import { catalogoItens, categoriasItens, CATEGORIA_PADRAO, buscarNoCatalogo } from "./catalogo.js";
import { calcularTotalUnidades } from "./inventario.js";
import { normalizarTexto } from "./utilidades.js";

export const elementos = Object.fromEntries([
    "formulario-item", "nome-item", "quantidade-item", "categoria-item", "buscar-catalogo", "sugestoes-itens", "lista-catalogo",
    "buscar-item", "filtrar-categoria", "ordem-itens", "limpar-filtros", "lista-itens",
    "total-itens", "mensagem-item", "mensagem-busca", "anuncio-busca", "adicionar-item", "remover-ultimo",
    "desfazer-remocao", "exportar-itens", "importar-itens", "recuperacao", "baixar-dados-salvos",
    "iniciar-novo", "dialogo-confirmacao", "texto-confirmacao", "dialogo-renomear", "novo-nome",
].map((id) => [id, document.getElementById(id)]));

let anuncioPendente;
let anuncioBuscaPendente;

function anunciarBusca(texto) {
    clearTimeout(anuncioBuscaPendente);
    anuncioBuscaPendente = setTimeout(() => {
        elementos["anuncio-busca"].textContent = texto;
    }, 350);
}

export function mostrarMensagem(texto, tipo = "sucesso") {
    clearTimeout(anuncioPendente);
    const mensagem = elementos["mensagem-item"];
    const prefixos = { sucesso: "Sucesso", erro: "Erro", aviso: "Aviso" };
    mensagem.dataset.tipo = tipo;
    mensagem.textContent = "";
    anuncioPendente = setTimeout(() => {
        mensagem.textContent = `${prefixos[tipo]}: ${texto}`;
    }, 30);
}

function criarOpcao(valor, texto) {
    const opcao = document.createElement("option");
    opcao.value = valor;
    opcao.textContent = texto;
    return opcao;
}

export function preencherOpcoesCategoria(seletor, incluirTodas = false) {
    seletor.replaceChildren();
    if (incluirTodas) seletor.appendChild(criarOpcao("todas", "Todas"));
    for (const [valor, nome] of Object.entries(categoriasItens)) {
        seletor.appendChild(criarOpcao(valor, nome));
    }
}

function carregarCatalogo(itens) {
    const lista = elementos["lista-catalogo"];

    lista.replaceChildren();

    const busca = normalizarTexto(
        elementos["buscar-catalogo"].value
    );

    for (const itemDoCatalogo of catalogoItens) {
        const nome = normalizarTexto(itemDoCatalogo.nome);

        if (!nome.includes(busca)) {
            continue;
        }

        let quantidade = 0;

        const linha = document.createElement("li");
        const categoria = categoriasItens[itemDoCatalogo.categoria];

        const texto = document.createElement("p");
        texto.textContent =
            `${itemDoCatalogo.nome} — ${categoria} | No inventário: ${quantidade}`;

        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "botao";
        botao.dataset.catalogoId = itemDoCatalogo.id;
        botao.textContent = quantidade > 0 ? "Já cadastrado" : "Selecionar";
        botao.disabled = quantidade > 0;

        botao.setAttribute(
            "aria-label",
            `Selecionar ${itemDoCatalogo.nome} para cadastro`
        );

        linha.append(texto, botao);
        lista.appendChild(linha);
    }
}

export function prepararCampos() {
    preencherOpcoesCategoria(elementos["categoria-item"]);
    preencherOpcoesCategoria(elementos["filtrar-categoria"], true);
    elementos["sugestoes-itens"].replaceChildren();
    for (const item of catalogoItens) {
        elementos["sugestoes-itens"].appendChild(criarOpcao(item.nome, item.nome));
    }
}

export function preencherCategoria() {
    const seletor = elementos["categoria-item"];
    const referencia = buscarNoCatalogo(elementos["nome-item"].value);
    if (referencia) {
        if (!seletor.disabled) seletor.dataset.categoriaManual = seletor.value;
        seletor.value = referencia.categoria;
        seletor.disabled = true;
    } else if (seletor.disabled) {
        seletor.disabled = false;
        seletor.value = seletor.dataset.categoriaManual || CATEGORIA_PADRAO;
    }
}

export function limparCadastro() {
    elementos["nome-item"].value = "";
    elementos["quantidade-item"].value = "1";
    const seletor = elementos["categoria-item"];
    seletor.disabled = false;
    seletor.value = CATEGORIA_PADRAO;
    delete seletor.dataset.categoriaManual;
}

export function combinaFiltros(item) {
    const busca = normalizarTexto(elementos["buscar-item"].value);
    const categoria = elementos["filtrar-categoria"].value;
    return normalizarTexto(item.nome).includes(busca) && (categoria === "todas" || item.categoria === categoria);
}

export function temFiltros() {
    return normalizarTexto(elementos["buscar-item"].value) !== "" || elementos["filtrar-categoria"].value !== "todas";
}

export function ordenarParaExibicao(itens, ordem) {
    const linhas = itens.map((item, indice) => ({ item, indice }));
    linhas.sort((a, b) => {
        if (ordem === "quantidade") return b.item.quantidade - a.item.quantidade;
        if (ordem === "menor-quantidade") return a.item.quantidade - b.item.quantidade;
        if (ordem === "az") return a.item.nome.localeCompare(b.item.nome, "pt-BR");
        if (ordem === "za") return b.item.nome.localeCompare(a.item.nome, "pt-BR");
        return a.indice - b.indice;
    });
    return linhas;
}

function criarBotao(texto, classe, rotulo, acao, indice) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = `botao ${classe}`;
    botao.textContent = texto;
    botao.setAttribute("aria-label", rotulo);
    botao.dataset.acao = acao;
    botao.dataset.indice = indice;
    return botao;
}

function identificarControle(controle, indice, tipo, rotulo) {
    controle.dataset.indice = indice;
    controle.dataset.controle = tipo;
    controle.setAttribute("aria-label", rotulo);
}

function criarSeletorCategoria(item, indice) {
    const seletor = document.createElement("select");
    seletor.className = "categoria-exibida";
    preencherOpcoesCategoria(seletor);
    seletor.value = item.categoria;
    seletor.disabled = item.catalogoId !== null;
    identificarControle(seletor, indice, "categoria", `Categoria de ${item.nome}`);
    return seletor;
}

function criarControleQuantidade(item, indice) {
    const grupo = document.createElement("div");
    grupo.className = "controle-quantidade";
    const campo = document.createElement("input");
    campo.type = "number";
    campo.min = "1";
    campo.max = String(Number.MAX_SAFE_INTEGER);
    campo.step = "1";
    campo.value = item.quantidade;
    campo.className = "quantidade-exibida";
    identificarControle(campo, indice, "quantidade", `Quantidade de ${item.nome}`);
    grupo.append(
        criarBotao("−1", "botao-quantidade botao-secundario", `Retirar uma unidade de ${item.nome}`, "diminuir", indice),
        campo,
        criarBotao("+1", "botao-quantidade", `Adicionar uma unidade de ${item.nome}`, "aumentar", indice),
    );
    return grupo;
}

function criarItem(item, indice) {
    const linha = document.createElement("li");
    linha.className = "item-inventario";
    linha.dataset.indice = indice;
    linha.registroRenderizado = { ...item };
    linha.hidden = !combinaFiltros(item);
    const nome = document.createElement("span");
    nome.className = "nome-exibido";
    nome.textContent = item.nome;
    const renomear = criarBotao("Renomear", "botao-secundario", `Renomear ${item.nome}`, "renomear", indice);
    renomear.disabled = item.catalogoId !== null;
    linha.append(
        nome,
        criarSeletorCategoria(item, indice),
        criarControleQuantidade(item, indice),
        renomear,
        criarBotao("Remover", "botao-perigo", `Remover ${item.nome}`, "remover", indice),
    );
    return linha;
}

// Desenha a lista a partir dos dados. Em vez de apagar e recriar tudo, reaproveita as linhas:
//   1. guarda as linhas atuais num Map, usando o índice do registro nos dados como chave;
//   2. percorre os itens já na ordem de exibição; se a linha antiga ainda representa o mesmo
//      item (mesmo nome e mesmo vínculo), só atualiza quantidade e categoria; senão cria outra;
//   3. posiciona cada linha com insertBefore e remove as que sobraram;
//   4. devolve o foco ao controle que o tinha, porque mover elementos do DOM pode fazê-lo perdê-lo;
//   5. por fim atualiza totais, mensagens e o estado dos botões.
// O motivo de reaproveitar é manter o foco do teclado durante edições. Se você achar essa
// função difícil, é normal: ela é a mais complexa do projeto.
export function renderizarInventario(itens, ordem, { bloqueado = false, podeDesfazer = false } = {}) {
    carregarCatalogo(itens);

    const lista = elementos["lista-itens"];
    const focoAnterior = document.activeElement;
    const anteriores = new Map([...lista.children].map((linha) => [Number(linha.dataset.indice), linha]));
    const atuais = new Set();
    const ordenados = ordenarParaExibicao(itens, ordem);
    for (const [posicao, { item, indice }] of ordenados.entries()) {
        let linha = anteriores.get(indice);
        const anterior = linha?.registroRenderizado;
        if (!anterior || anterior.nome !== item.nome || anterior.catalogoId !== item.catalogoId) {
            linha = criarItem(item, indice);
        } else {
            // Reutiliza controles durante a edição para preservar o foco e a navegação por Tab.
            linha.querySelector('[data-controle="quantidade"]').value = item.quantidade;
            linha.querySelector('[data-controle="categoria"]').value = item.categoria;
            linha.hidden = !combinaFiltros(item);
            linha.registroRenderizado = { ...item };
        }
        atuais.add(linha);
        if (lista.children[posicao] !== linha) lista.insertBefore(linha, lista.children[posicao] ?? null);
    }
    for (const linha of [...lista.children]) {
        if (!atuais.has(linha)) linha.remove();
    }
    if (focoAnterior?.isConnected && focoAnterior.closest("#lista-itens") && !focoAnterior.closest("li").hidden) {
        focoAnterior.focus();
    }
    elementos["total-itens"].textContent = `Registros: ${itens.length} | Unidades: ${calcularTotalUnidades(itens)}`;
    const encontrados = itens.filter(combinaFiltros);
    let mensagem = "";
    if (bloqueado) mensagem = "Carregamento interrompido. Use as opções de recuperação.";
    else if (itens.length === 0) mensagem = "Seu inventário está vazio.";
    else if (encontrados.length === 0) mensagem = "Nenhum item encontrado.";
    else if (temFiltros()) mensagem = `Registros encontrados: ${encontrados.length} | Unidades: ${calcularTotalUnidades(encontrados)}`;
    elementos["mensagem-busca"].textContent = mensagem;
    anunciarBusca(mensagem || "Filtros limpos. Todos os itens estão visíveis.");
    elementos["adicionar-item"].disabled = bloqueado;
    elementos["remover-ultimo"].disabled = bloqueado || itens.length === 0 || temFiltros();
    elementos["desfazer-remocao"].hidden = !podeDesfazer;
    elementos["exportar-itens"].disabled = bloqueado;
    elementos.recuperacao.hidden = !bloqueado;
}

export function confirmarSubstituicao(texto) {
    return abrirDialogo(elementos["dialogo-confirmacao"], () => {
        elementos["texto-confirmacao"].textContent = texto;
    }).then((resultado) => resultado === "confirmar");
}

export async function pedirNovoNome(nome) {
    const resultado = await abrirDialogo(elementos["dialogo-renomear"], () => {
        elementos["novo-nome"].value = nome;
    });
    return resultado === "confirmar" ? elementos["novo-nome"].value : null;
}

function abrirDialogo(dialogo, preparar) {
    return new Promise((resolve) => {
        dialogo.returnValue = "";
        preparar();
        dialogo.addEventListener("close", () => resolve(dialogo.returnValue), { once: true });
        dialogo.showModal();
    });
}
