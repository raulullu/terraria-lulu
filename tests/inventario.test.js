import test from "node:test";
import assert from "node:assert/strict";
import {
    prepararInventario, adicionarItem, alterarQuantidade, alterarCategoria,
    renomearItem, removerItem, quantidadeValida,
} from "../inventario.js";
import { catalogoItens, validarCatalogo } from "../catalogo.js";
import { carregarInventario, salvarInventario, carregarOrdem, salvarOrdem, CHAVE_INVENTARIO } from "../armazenamento.js";

const manual = (nome = "Areia", quantidade = 1) => ({ catalogoId: null, nome, quantidade, categoria: "materiais" });

test("carrega strings antigas sem vincular pelo nome", () => {
    const { itens } = prepararInventario(["Madeira"], { aceitarLegado: true });
    assert.deepEqual(itens, [{ catalogoId: null, nome: "Madeira", quantidade: 1, categoria: "outros" }]);
});

test("normaliza registros antigos e copia somente os campos conhecidos", () => {
    assert.deepEqual(prepararInventario([{ nome: " Areia ", quantidade: 2, extra: 3 }]).itens,
        [{ catalogoId: null, nome: "Areia", quantidade: 2, categoria: "outros" }]);
});

test("rejeita estruturas e campos inválidos antes de produzir um inventário", () => {
    for (const dados of [{}, [null], [[]], [{}], [{ nome: " ", quantidade: 1 }],
        [{ nome: "Areia", quantidade: 0 }], [{ nome: "Areia", quantidade: 1, categoria: "banana" }],
        [{ nome: "Areia", quantidade: 1, categoria: null }]]) {
        assert.throws(() => prepararInventario(dados));
    }
});

test("catálogo define o nome e a categoria dos vinculados", () => {
    const { itens } = prepararInventario([{ catalogoId: "pedra", nome: "Antigo", categoria: "armas", quantidade: 2 }]);
    assert.deepEqual(itens[0], { catalogoId: "pedra", nome: "Pedra", quantidade: 2, categoria: "materiais" });
});

test("identificadores desconhecidos são recusados na importação", () => {
    assert.throws(() => prepararInventario([{ ...manual(), catalogoId: "ausente" }]));
});

test("referência removida dos dados locais é recuperada como manual com aviso", () => {
    const { itens, avisos } = prepararInventario([{ ...manual(), catalogoId: "ausente" }], { recuperarOrfaos: true });
    assert.equal(itens[0].catalogoId, null);
    assert.equal(avisos.length, 1);
    assert.equal(renomearItem(itens, 0, "Novo nome")[0].nome, "Novo nome");
});

test("recusa IDs repetidos e novo cadastro duplicado, mas permite nomes manuais iguais", () => {
    const pedra = { ...manual("Pedra"), catalogoId: "pedra" };
    assert.throws(() => prepararInventario([pedra, pedra]));
    assert.throws(() => adicionarItem([pedra], manual("PEDRA")));
    assert.equal(prepararInventario([manual("Pedra"), pedra]).itens.length, 2);
});

test("cadastro reconhece catálogo e valida categoria e quantidade na camada de dados", () => {
    assert.equal(adicionarItem([], manual(" MADEIRA "))[0].catalogoId, "madeira");
    assert.throws(() => adicionarItem([], manual("Areia", -1)));
    assert.throws(() => adicionarItem([], { ...manual(), categoria: "banana" }));
});

test("alterações não modificam a entrada e vinculados não podem mudar nome ou categoria", () => {
    const entrada = [manual("Areia", 5)];
    assert.equal(alterarQuantidade(entrada, 0, 8)[0].quantidade, 8);
    assert.equal(entrada[0].quantidade, 5);
    assert.equal(alterarCategoria(entrada, 0, "outros")[0].categoria, "outros");
    const vinculado = adicionarItem([], manual("Pedra"));
    assert.throws(() => renomearItem(vinculado, 0, "Outra"));
    assert.throws(() => alterarCategoria(vinculado, 0, "outros"));
});

test("remove pelo registro de cadastro e preserva a entrada", () => {
    const entrada = [manual("Zebra"), manual("Areia")];
    assert.deepEqual(removerItem(entrada, 1), [entrada[0]]);
    assert.equal(entrada.length, 2);
    assert.throws(() => removerItem(entrada, 9));
});

test("renomeação bloqueia nomes do catálogo, inclusive equivalentes com acento e espaços", () => {
    const entrada = [manual("Areia")];
    assert.throws(() => renomearItem(entrada, 0, " PÉDRA "), /é um item do catálogo/);
    assert.equal(entrada[0].nome, "Areia");
    assert.equal(renomearItem(entrada, 0, "Areia fina")[0].nome, "Areia fina");
});

test("rejeita números imprecisos e soma que excede o limite seguro", () => {
    for (const numero of [0, -1, 1.5, Infinity, NaN, 1e21, "2"]) assert.equal(quantidadeValida(numero), false);
    assert.equal(quantidadeValida(Number.MAX_SAFE_INTEGER), true);
    assert.throws(() => prepararInventario([manual("A", Number.MAX_SAFE_INTEGER), manual("B", 1)]));
    assert.throws(() => alterarQuantidade([manual()], 0, Number.MAX_SAFE_INTEGER + 1));
});

test("valida catálogo e detecta IDs, nomes equivalentes e categorias inválidos", () => {
    assert.equal(validarCatalogo(), true);
    for (const item of [
        { id: "madeira", nome: "Outra", categoria: "outros" },
        { id: "outro", nome: "MÁDEIRA", categoria: "outros" },
        { id: "outro", nome: "Outra", categoria: "banana" },
    ]) {
        catalogoItens.push(item);
        try { assert.throws(() => validarCatalogo()); }
        finally { catalogoItens.pop(); }
    }
});

test("armazenamento protege dados antigos quando leitura ou gravação falham", () => {
    let salvo = JSON.stringify([manual("Anterior", 10)]);
    globalThis.localStorage = { getItem: () => salvo, setItem: () => { throw Error("QuotaExceededError"); } };
    assert.equal(carregarInventario().itens[0].nome, "Anterior");
    assert.throws(() => salvarInventario([manual("Novo")]));
    assert.equal(JSON.parse(salvo)[0].nome, "Anterior");
    salvo = "{";
    assert.throws(() => carregarInventario(), /O conteúdo salvo não é um JSON válido/);
    assert.equal(salvo, "{");
});

test("salva dados validados e preferência de ordem separadamente", () => {
    const dados = new Map();
    globalThis.localStorage = { getItem: (chave) => dados.get(chave) ?? null, setItem: (chave, valor) => dados.set(chave, valor) };
    assert.equal(carregarOrdem(), "cadastro");
    salvarInventario([manual("Areia", 3)]);
    salvarOrdem("az");
    assert.equal(JSON.parse(dados.get(CHAVE_INVENTARIO))[0].quantidade, 3);
    assert.equal(carregarOrdem(), "az");
    assert.throws(() => salvarOrdem("invalida"));
});
