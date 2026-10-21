import { validarCatalogo } from "./catalogo.js";
import { adicionarItem, alterarQuantidade, alterarCategoria, renomearItem, removerItem, quantidadeValida, ERRO_QUANTIDADE } from "./inventario.js";
import { copiarItens } from "./utilidades.js";
import {
    carregarInventario, salvarInventario, carregarOrdem, salvarOrdem,
    lerArquivoInventario, exportarInventario, exportarDadosSalvos,
} from "./armazenamento.js";
import {
    elementos as el, prepararCampos, preencherCategoria, limparCadastro, mostrarMensagem,
    renderizarInventario, combinaFiltros, temFiltros, confirmarSubstituicao, pedirNovoNome,
} from "./interface.js";

let itens = [];
let ordem = "cadastro";
let bloqueado = false;
let ultimaRemocao = null;

function atualizarTela() {
    renderizarInventario(itens, ordem, { bloqueado, podeDesfazer: ultimaRemocao !== null });
}

function verificarDisponibilidade() {
    if (bloqueado) throw new Error("Resolva o carregamento pelas opções de recuperação antes de alterar o inventário.");
}

function aplicarAlteracao(novosItens, { permitirRecuperacao = false, guardarRemocao = false } = {}) {
    if (!permitirRecuperacao) verificarDisponibilidade();
    // A gravação acontece antes de trocar o estado da aplicação.
    salvarInventario(novosItens);
    const anteriores = copiarItens(itens);
    itens = copiarItens(novosItens);
    ultimaRemocao = guardarRemocao ? anteriores : null;
    bloqueado = false;
    atualizarTela();
}

function executar(acao) {
    try {
        acao();
        return true;
    } catch (erro) {
        mostrarMensagem(erro.message, "erro");
        return false;
    }
}

function mensagemAdicao(item) {
    const complemento = combinaFiltros(item) ? "" : " O item está oculto pelos filtros atuais. Use Limpar filtros para vê-lo.";
    return `Item adicionado: ${item.nome}.${complemento}`;
}

el["formulario-item"].addEventListener("submit", (evento) => {
    evento.preventDefault();
    executar(() => {
        verificarDisponibilidade();
        const novosItens = adicionarItem(itens, {
            nome: el["nome-item"].value,
            quantidade: Number(el["quantidade-item"].value),
            categoria: el["categoria-item"].value,
        });
        const adicionado = novosItens.at(-1);
        aplicarAlteracao(novosItens);
        limparCadastro();
        el["nome-item"].focus();
        mostrarMensagem(mensagemAdicao(adicionado));
    });
});

el["nome-item"].addEventListener("input", preencherCategoria);

for (const id of ["buscar-item", "filtrar-categoria"]) {
    el[id].addEventListener(id === "buscar-item" ? "input" : "change", atualizarTela);
}

el["buscar-item"].addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") return;
    evento.preventDefault();
    el["buscar-item"].value = "";
    atualizarTela();
});

el["limpar-filtros"].addEventListener("click", () => {
    el["buscar-item"].value = "";
    el["filtrar-categoria"].value = "todas";
    atualizarTela();
    el["buscar-item"].focus();
});

el["ordem-itens"].addEventListener("change", () => {
    executar(() => {
        const novaOrdem = el["ordem-itens"].value;
        salvarOrdem(novaOrdem);
        ordem = novaOrdem;
        atualizarTela();
    });
    el["ordem-itens"].value = ordem;
});

function removerRegistro(indice) {
    const nome = itens[indice].nome;
    aplicarAlteracao(removerItem(itens, indice), { guardarRemocao: true });
    el["nome-item"].focus();
    mostrarMensagem(`Item removido: ${nome}. Você pode desfazer esta remoção.`);
}

el["remover-ultimo"].addEventListener("click", () => executar(() => {
    verificarDisponibilidade();
    if (temFiltros()) throw new Error("Limpe os filtros antes de remover o último cadastrado.");
    if (itens.length === 0) throw new Error("Não há itens para remover.");
    removerRegistro(itens.length - 1);
}));

el["desfazer-remocao"].addEventListener("click", () => executar(() => {
    if (ultimaRemocao === null) return;
    aplicarAlteracao(ultimaRemocao);
    el["nome-item"].focus();
    mostrarMensagem("Remoção desfeita. O inventário anterior foi restaurado.");
}));

function restaurarFoco(indice, controle) {
    const campo = el["lista-itens"].querySelector(`[data-indice="${indice}"][data-controle="${controle}"]`);
    if (campo && !campo.closest("li").hidden) campo.focus();
}

function atualizarQuantidade(indice, quantidade) {
    const nome = itens[indice].nome;
    aplicarAlteracao(alterarQuantidade(itens, indice, quantidade));
    mostrarMensagem(`Quantidade de ${nome} atualizada para ${quantidade}.`);
}

el["lista-itens"].addEventListener("change", (evento) => {
    const campo = evento.target;
    if (!campo.dataset.controle) return;
    const indice = Number(campo.dataset.indice);
    const controle = campo.dataset.controle;
    const tinhaFoco = document.activeElement === campo;
    const sucesso = executar(() => {
        if (controle === "quantidade") atualizarQuantidade(indice, Number(campo.value));
        if (controle === "categoria") {
            const nome = itens[indice].nome;
            aplicarAlteracao(alterarCategoria(itens, indice, campo.value));
            mostrarMensagem(`Categoria de ${nome} atualizada.`);
        }
    });
    if (!sucesso) campo.value = controle === "quantidade" ? itens[indice].quantidade : itens[indice].categoria;
    if (tinhaFoco) restaurarFoco(indice, controle);
});

// Mantém o campo em edição até o clique; evita perder o clique ao recriar a linha.
el["lista-itens"].addEventListener("pointerdown", (evento) => {
    if (evento.target.closest("button[data-acao]")) evento.preventDefault();
});

el["lista-itens"].addEventListener("keydown", (evento) => {
    if (evento.key !== "Enter" || evento.target.dataset.controle !== "quantidade") return;
    evento.preventDefault();
    const campo = evento.target;
    const indice = Number(campo.dataset.indice);
    const sucesso = executar(() => atualizarQuantidade(indice, Number(campo.value)));
    if (sucesso) el["nome-item"].focus();
    else {
        campo.value = itens[indice].quantidade;
        campo.focus();
        campo.select();
    }
});

el["lista-itens"].addEventListener("click", async (evento) => {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao || botao.disabled) return;
    const indice = Number(botao.dataset.indice);
    const acao = botao.dataset.acao;
    if (acao === "renomear") {
        const resposta = await pedirNovoNome(itens[indice].nome);
        if (resposta !== null) executar(() => {
            aplicarAlteracao(renomearItem(itens, indice, resposta));
            mostrarMensagem(`Item renomeado: ${itens[indice].nome}.`);
            el["nome-item"].focus();
        });
        return;
    }
    executar(() => {
        verificarDisponibilidade();
        if (acao === "remover") removerRegistro(indice);
        if (acao === "aumentar" || acao === "diminuir") {
            const campo = botao.closest("li").querySelector('[data-controle="quantidade"]');
            const atual = Number(campo.value);
            if (!quantidadeValida(atual)) throw new Error(ERRO_QUANTIDADE);
            if (acao === "diminuir" && atual === 1) {
                throw new Error("Para excluir este item, use o botão Remover.");
            }
            atualizarQuantidade(indice, atual + (acao === "aumentar" ? 1 : -1));
            restaurarFoco(indice, "quantidade");
        }
    });
});

el["exportar-itens"].addEventListener("click", () => executar(() => {
    verificarDisponibilidade();
    exportarInventario(itens);
    mostrarMensagem("Arquivo de exportação gerado.");
}));

el["importar-itens"].addEventListener("change", async () => {
    const arquivo = el["importar-itens"].files[0];
    if (!arquivo) return;
    el["importar-itens"].disabled = true;
    try {
        const novosItens = await lerArquivoInventario(arquivo);
        const confirmou = await confirmarSubstituicao(`O arquivo contém ${novosItens.length} registros e substituirá todo o inventário atual. Deseja continuar?`);
        if (!confirmou) {
            mostrarMensagem("Importação cancelada. O inventário atual foi mantido.", "aviso");
            return;
        }
        aplicarAlteracao(novosItens, { permitirRecuperacao: true });
        mostrarMensagem(`Inventário importado com sucesso. Registros: ${novosItens.length}.`);
    } catch (erro) {
        mostrarMensagem(`Importação não aplicada: ${erro.message}`, "erro");
    } finally {
        el["importar-itens"].value = "";
        el["importar-itens"].disabled = false;
    }
});

el["baixar-dados-salvos"].addEventListener("click", () => executar(exportarDadosSalvos));

el["iniciar-novo"].addEventListener("click", async () => {
    if (await confirmarSubstituicao("Isso substituirá os dados salvos por um inventário vazio. Baixe uma cópia para recuperação antes de continuar. Deseja substituir?")) {
        executar(() => {
            aplicarAlteracao([], { permitirRecuperacao: true });
            mostrarMensagem("Um inventário vazio foi salvo.");
        });
    }
});

function iniciar() {
    try {
        validarCatalogo();
    } catch (erro) {
        mostrarMensagem(`Catálogo inválido: ${erro.message} Corrija catalogo.js e atualize a página.`, "erro");
        for (const controle of document.querySelectorAll("input, select, button")) controle.disabled = true;
        return;
    }
    prepararCampos();
    try {
        ordem = carregarOrdem();
    } catch {
        mostrarMensagem("A preferência de ordenação não pôde ser lida. Usando a ordem de cadastro.", "aviso");
    }
    el["ordem-itens"].value = ordem;
    try {
        const resultado = carregarInventario();
        itens = resultado.itens;
        if (resultado.avisos.length) mostrarMensagem(resultado.avisos.join(" "), "aviso");
    } catch (erro) {
        bloqueado = true;
        mostrarMensagem(`Não foi possível carregar: ${erro.message} Os dados salvos foram mantidos.`, "erro");
    }
    atualizarTela();
}

iniciar();
