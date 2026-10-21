const catalogoItens = [
    {
        id: "madeira",
        nome: "Madeira",
        categoria: "materiais"
    },
    {
        id: "pedra",
        nome: "Pedra",
        categoria: "materiais"
    },
    {
        id: "item-teste",
        nome: "Item de Teste",
        categoria: "outros"
    }
];

const categoriasItens = {
    outros: "Outros",
    materiais: "Materiais",
    armas: "Armas",
    acessorios: "Acessórios",
    armaduras: "Armaduras",
    consumiveis: "Consumíveis"
};

function buscarNoCatalogoPorId(id) {
    for (const item of catalogoItens) {
        if (item.id === id) {
            return item;
        }
    }

    return null;
}

function categoriaValida(categoria) {
    return Object.hasOwn(categoriasItens, categoria);
}

function nomeDaCategoria(categoria) {
    return categoriasItens[categoria];
}

function validarCatalogo() {
    const idsEncontrados = [];

    for (const item of catalogoItens) {
        if (
            typeof item.id !== "string" ||
            item.id.trim() === ""
        ) {
            throw new Error(
                "Existe um item com identificador inválido no catálogo."
            );
        }

        if (idsEncontrados.includes(item.id)) {
            throw new Error(
                "Identificador repetido no catálogo: " + item.id
            );
        }

        if (
            typeof item.nome !== "string" ||
            item.nome.trim() === ""
        ) {
            throw new Error(
                "Nome inválido no item do catálogo: " + item.id
            );
        }

        if (categoriaValida(item.categoria) === false) {
            throw new Error(
                "Categoria inválida no item do catálogo: " + item.id
            );
        }

        idsEncontrados.push(item.id);
    }

    return true;
}