import {
    buscarNoCatalogo,
    buscarNoCatalogoPorId,
    categoriaValida,
    CATEGORIA_PADRAO,
} from "./catalogo.js";

export const ERRO_QUANTIDADE = "Digite uma quantidade inteira maior que zero, dentro do limite seguro.";

export function quantidadeValida(quantidade) {
    return Number.isSafeInteger(quantidade) && quantidade > 0;
}

export function calcularTotalUnidades(itens) {
    let total = 0;
    for (const item of itens) {
        total += item.quantidade;
        if (!Number.isSafeInteger(total)) {
            throw new Error("O total de unidades ultrapassa o limite numérico seguro.");
        }
    }
    return total;
}

function validarNome(nome) {
    if (typeof nome !== "string" || nome.trim() === "") {
        throw new Error("Digite um nome válido para o item.");
    }
    return nome.trim();
}

export function prepararInventario(dados, { aceitarLegado = false, recuperarOrfaos = false } = {}) {
    if (!Array.isArray(dados)) {
        throw new Error("Os dados precisam conter uma lista de itens.");
    }

    const ids = new Set();
    const avisos = [];
    const itens = dados.map((entrada, indice) => {
        if (typeof entrada === "string" && aceitarLegado) {
            entrada = { nome: entrada, quantidade: 1 };
        }
        if (entrada === null || typeof entrada !== "object" || Array.isArray(entrada)) {
            throw new Error(`Registro ${indice + 1}: item inválido.`);
        }

        let nome = validarNome(entrada.nome);
        const quantidade = entrada.quantidade;
        if (!quantidadeValida(quantidade)) {
            throw new Error(`Registro ${indice + 1}: ${ERRO_QUANTIDADE}`);
        }

        let categoria = entrada.categoria ?? CATEGORIA_PADRAO;
        if (entrada.categoria === null || !categoriaValida(categoria)) {
            throw new Error(`Registro ${indice + 1}: categoria inválida.`);
        }

        let catalogoId = entrada.catalogoId ?? null;
        if (catalogoId !== null) {
            if (typeof catalogoId !== "string" || catalogoId.trim() === "") {
                throw new Error(`Registro ${indice + 1}: identificador de catálogo inválido.`);
            }
            if (ids.has(catalogoId)) {
                throw new Error(`Identificador repetido: ${catalogoId}.`);
            }
            ids.add(catalogoId);
            const referencia = buscarNoCatalogoPorId(catalogoId);
            if (referencia === null) {
                if (!recuperarOrfaos) {
                    throw new Error(`Item não encontrado no catálogo: ${catalogoId}.`);
                }
                avisos.push(`${nome}: referência ${catalogoId} ausente; carregado como item manual.`);
                catalogoId = null;
            } else {
                nome = referencia.nome;
                categoria = referencia.categoria;
            }
        }
        return { catalogoId, nome, quantidade, categoria };
    });

    calcularTotalUnidades(itens);
    return { itens, avisos };
}

function obterRegistro(itens, indice) {
    if (!Number.isInteger(indice) || indice < 0 || indice >= itens.length) {
        throw new Error("O item não está mais no inventário.");
    }
    return itens[indice];
}

export function adicionarItem(itens, entrada) {
    const nome = validarNome(entrada.nome);
    const referencia = buscarNoCatalogo(nome);
    if (referencia && itens.some((item) => item.catalogoId === referencia.id)) {
        throw new Error(`${referencia.nome} já está no inventário. Edite a quantidade na linha existente.`);
    }
    const item = {
        catalogoId: referencia?.id ?? null,
        nome: referencia?.nome ?? nome,
        quantidade: entrada.quantidade,
        categoria: referencia?.categoria ?? entrada.categoria,
    };
    return prepararInventario([...itens, item]).itens;
}

export function alterarQuantidade(itens, indice, quantidade) {
    obterRegistro(itens, indice);
    if (!quantidadeValida(quantidade)) {
        throw new Error(ERRO_QUANTIDADE);
    }
    return prepararInventario(itens.map((item, posicao) => (
        posicao === indice ? { ...item, quantidade } : item
    ))).itens;
}

export function renomearItem(itens, indice, novoNome) {
    const item = obterRegistro(itens, indice);
    if (item.catalogoId !== null) {
        throw new Error("O nome dos itens vinculados é definido pelo catálogo.");
    }
    const nome = validarNome(novoNome);
    // Mesma regra do cadastro: nomes do catálogo pertencem a itens vinculados.
    // Sem este bloqueio, dava para criar um registro manual "Pedra" ao lado da Pedra do catálogo.
    const referencia = buscarNoCatalogo(nome);
    if (referencia) {
        throw new Error(`${referencia.nome} é um item do catálogo. Remova este registro e cadastre pelo nome para vinculá-lo.`);
    }
    return prepararInventario(itens.map((registro, posicao) => (
        posicao === indice ? { ...registro, nome } : registro
    ))).itens;
}

export function alterarCategoria(itens, indice, categoria) {
    const item = obterRegistro(itens, indice);
    if (item.catalogoId !== null) {
        throw new Error("A categoria dos itens vinculados é definida pelo catálogo.");
    }
    if (!categoriaValida(categoria)) {
        throw new Error("Escolha uma categoria válida.");
    }
    return prepararInventario(itens.map((registro, posicao) => (
        posicao === indice ? { ...registro, categoria } : registro
    ))).itens;
}

export function removerItem(itens, indice) {
    obterRegistro(itens, indice);
    return itens.filter((_, posicao) => posicao !== indice);
}
