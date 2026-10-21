const inventario = [];

function obterItens() {
    return inventario;
}

function removerDoInventario(item) {
    const posicao = inventario.indexOf(item);

    if (posicao !== -1) {
        inventario.splice(posicao, 1);
    }
}

function buscarRegistroDoCatalogo(catalogoId) {
    for (const item of inventario) {
        if (item.catalogoId === catalogoId) {
            return item;
        }
    }

    return null;
}