export function normalizarTexto(texto) {
    return texto.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function copiarItens(itens) {
    return itens.map((item) => ({ ...item }));
}
