// Testes extras da lógica (sem navegador). Rode com: npm test
import test from "node:test";
import assert from "node:assert/strict";

// Cada arquivo de teste roda em um processo separado, então este localStorage falso não afeta outros testes.
const memoria = new Map();
let falharAoGravar = false;
globalThis.localStorage = {
    getItem: (chave) => (memoria.has(chave) ? memoria.get(chave) : null),
    setItem: (chave, valor) => {
        if (falharAoGravar) throw new Error("cota excedida");
        memoria.set(chave, String(valor));
    },
};

const inventario = await import("../inventario.js");
const { validarCatalogo } = await import("../catalogo.js");
const armazenamento = await import("../armazenamento.js");
const {
    prepararInventario, adicionarItem, alterarQuantidade, renomearItem,
    alterarCategoria, removerItem,
} = inventario;

function mensagemDoErro(funcao) {
    try {
        funcao();
    } catch (erro) {
        return erro.message;
    }
    return null;
}

test("o catálogo de exemplo é válido", () => {
    assert.equal(validarCatalogo(), true);
});

test("registros inválidos são recusados e o erro indica o número do registro", () => {
    const invalidos = [
        [null], [1], [[]], [{}],
        [{ nome: "   ", quantidade: 1 }],
        [{ nome: "A", quantidade: "5" }],
        [{ nome: "A", quantidade: 0 }],
        [{ nome: "A", quantidade: 1.5 }],
        [{ nome: "A", quantidade: 1e21 }],
        [{ nome: "A", quantidade: 1, categoria: null }],
        [{ nome: "A", quantidade: 1, categoria: "__proto__" }],
        [{ nome: "A", quantidade: 1, catalogoId: "" }],
        [{ nome: "A", quantidade: 1, catalogoId: "nao-existe" }],
    ];
    for (const dados of invalidos) {
        assert.ok(mensagemDoErro(() => prepararInventario(dados)), `deveria recusar ${JSON.stringify(dados)}`);
    }
    const mensagem = mensagemDoErro(() => prepararInventario([
        { nome: "A", quantidade: 1 },
        { nome: "B", quantidade: 0 },
    ]));
    assert.match(mensagem, /Registro 2/);
});

test("o total de unidades não passa do limite numérico seguro", () => {
    const mensagem = mensagemDoErro(() => prepararInventario([
        { nome: "A", quantidade: Number.MAX_SAFE_INTEGER },
        { nome: "B", quantidade: 1 },
    ]));
    assert.match(mensagem, /limite/);
});

test("itens vinculados recebem nome e categoria do catálogo", () => {
    const { itens } = prepararInventario([
        { nome: "qualquer", quantidade: 2, catalogoId: "pedra", categoria: "armas" },
    ]);
    assert.deepEqual(itens[0], { catalogoId: "pedra", nome: "Pedra", quantidade: 2, categoria: "materiais" });
});

test("cadastrar um nome do catálogo vincula o item e impede duplicata", () => {
    const itens = adicionarItem([], { nome: "  pedra ", quantidade: 3, categoria: "armas" });
    assert.equal(itens[0].catalogoId, "pedra");
    assert.match(
        mensagemDoErro(() => adicionarItem(itens, { nome: "PEDRA", quantidade: 1, categoria: "outros" })),
        /já está/,
    );
});

test("registros manuais podem ter nomes iguais entre si", () => {
    let itens = adicionarItem([], { nome: "Espada", quantidade: 1, categoria: "armas" });
    itens = adicionarItem(itens, { nome: "espada", quantidade: 1, categoria: "armas" });
    assert.equal(itens.length, 2);
});

test("renomear um registro manual para um nome do catálogo é recusado", () => {
    const itens = adicionarItem([], { nome: "Pedrinha", quantidade: 1, categoria: "outros" });
    for (const nome of ["Pedra", "PEDRA", "  pedra  ", "Madeira"]) {
        const mensagem = mensagemDoErro(() => renomearItem(itens, 0, nome));
        assert.match(mensagem, /catálogo/, `deveria recusar ${nome}`);
    }
    assert.equal(itens[0].nome, "Pedrinha");
});

test("renomear um registro manual para outro nome comum funciona", () => {
    const itens = adicionarItem([], { nome: "Espada", quantidade: 1, categoria: "armas" });
    const renomeados = renomearItem(itens, 0, "  Espada Longa ");
    assert.equal(renomeados[0].nome, "Espada Longa");
    assert.equal(itens[0].nome, "Espada", "o array original não pode mudar");
});

test("itens vinculados não podem ser renomeados nem trocar de categoria", () => {
    const itens = adicionarItem([], { nome: "Pedra", quantidade: 1, categoria: "outros" });
    assert.ok(mensagemDoErro(() => renomearItem(itens, 0, "Outro")));
    assert.ok(mensagemDoErro(() => alterarCategoria(itens, 0, "armas")));
});

test("índices e valores inválidos não alteram o inventário", () => {
    const base = adicionarItem([], { nome: "Espada", quantidade: 1, categoria: "armas" });
    const copia = JSON.stringify(base);
    const tentativas = [
        () => alterarQuantidade(base, 5, 2),
        () => alterarQuantidade(base, -1, 2),
        () => alterarQuantidade(base, 0, 0.5),
        () => removerItem(base, 3),
        () => alterarCategoria(base, 0, "inexistente"),
        () => renomearItem(base, 0, "   "),
    ];
    for (const tentativa of tentativas) assert.ok(mensagemDoErro(tentativa));
    alterarQuantidade(base, 0, 9);
    removerItem(base, 0);
    assert.equal(JSON.stringify(base), copia);
});

test("carregar: formato antigo é aceito e órfãos viram itens manuais com aviso", () => {
    memoria.clear();
    memoria.set(armazenamento.CHAVE_INVENTARIO, JSON.stringify([
        "Espada",
        { nome: "Arco", quantidade: 2 },
        { nome: "Velho", quantidade: 1, catalogoId: "sumiu-do-catalogo" },
    ]));
    const { itens, avisos } = armazenamento.carregarInventario();
    assert.equal(itens.length, 3);
    assert.equal(itens[2].catalogoId, null);
    assert.equal(avisos.length, 1);
});

test("carregar: JSON quebrado gera erro em português e preserva os dados salvos", () => {
    memoria.clear();
    memoria.set(armazenamento.CHAVE_INVENTARIO, "{quebrado");
    const mensagem = mensagemDoErro(() => armazenamento.carregarInventario());
    assert.equal(mensagem, "O conteúdo salvo não é um JSON válido.");
    assert.equal(memoria.get(armazenamento.CHAVE_INVENTARIO), "{quebrado");
});

test("importar: arquivo que não é JSON gera erro em português", async () => {
    const arquivo = { text: async () => "isto não é json" };
    const mensagem = await armazenamento.lerArquivoInventario(arquivo).then(() => null, (erro) => erro.message);
    assert.equal(mensagem, "O arquivo não é um JSON válido.");
});

test("importar: arquivo válido é lido", async () => {
    const arquivo = { text: async () => JSON.stringify([{ nome: "A", quantidade: 1 }]) };
    const itens = await armazenamento.lerArquivoInventario(arquivo);
    assert.equal(itens.length, 1);
});

test("falha ao gravar gera erro claro", () => {
    falharAoGravar = true;
    try {
        assert.match(mensagemDoErro(() => armazenamento.salvarInventario([])), /Não foi possível salvar/);
    } finally {
        falharAoGravar = false;
    }
});

test("ordem salva inválida volta para a ordem de cadastro", () => {
    memoria.clear();
    assert.equal(armazenamento.carregarOrdem(), "cadastro");
    memoria.set(armazenamento.CHAVE_ORDEM, "lixo");
    assert.equal(armazenamento.carregarOrdem(), "cadastro");
});
