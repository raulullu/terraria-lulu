import { normalizarTexto } from "./utilidades.js";

export const catalogoItens = [
    { id: "madeira", nome: "Madeira", categoria: "materiais" },
    { id: "pedra", nome: "Pedra", categoria: "materiais" },
    { id: "item-teste", nome: "Item de Teste", categoria: "outros" },
];

export const categoriasItens = {
    outros: "Outros",
    materiais: "Materiais",
    armas: "Armas",
    acessorios: "Acessórios",
    armaduras: "Armaduras",
    consumiveis: "Consumíveis",
};

export const CATEGORIA_PADRAO = "outros";

export function categoriaValida(categoria) {
    return Object.hasOwn(categoriasItens, categoria);
}

export function nomeDaCategoria(categoria) {
    return categoriasItens[categoria];
}

export function buscarNoCatalogoPorId(id) {
    return catalogoItens.find((item) => item.id === id) ?? null;
}

export function buscarNoCatalogo(nome) {
    const nomeBuscado = normalizarTexto(nome);
    return catalogoItens.find((item) => normalizarTexto(item.nome) === nomeBuscado) ?? null;
}

export function validarCatalogo() {
    const ids = new Set();
    const nomes = new Set();

    for (const item of catalogoItens) {
        if (typeof item.id !== "string" || item.id.trim() === "" || item.id !== item.id.trim()) {
            throw new Error("Existe um identificador inválido no catálogo.");
        }
        if (ids.has(item.id)) {
            throw new Error(`Identificador repetido no catálogo: ${item.id}.`);
        }
        if (typeof item.nome !== "string" || item.nome.trim() === "") {
            throw new Error(`Nome inválido no item do catálogo: ${item.id}.`);
        }
        const nome = normalizarTexto(item.nome);
        if (nomes.has(nome)) {
            throw new Error(`Nome equivalente repetido no catálogo: ${item.nome}.`);
        }
        if (!categoriaValida(item.categoria)) {
            throw new Error(`Categoria inválida no item do catálogo: ${item.id}.`);
        }
        ids.add(item.id);
        nomes.add(nome);
    }
    return true;
}
