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