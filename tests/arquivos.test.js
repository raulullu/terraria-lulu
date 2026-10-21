import test from "node:test";
import assert from "node:assert/strict";
import { lerArquivoInventario, exportarInventario } from "../armazenamento.js";

test("leitura de arquivo valida JSON, identificadores e campos antes da confirmação", async () => {
    const arquivo = (texto) => ({ text: async () => texto });
    await assert.rejects(lerArquivoInventario(arquivo("{")));
    await assert.rejects(lerArquivoInventario(arquivo('{"nome":"Pedra"}')));
    await assert.rejects(lerArquivoInventario(arquivo('[{"nome":"Antigo","catalogoId":"ausente","quantidade":1}]')));
    const itens = await lerArquivoInventario(arquivo('[{"nome":"Madeira","catalogoId":"madeira","quantidade":44}]'));
    assert.equal(itens[0].categoria, "materiais");
    assert.equal(itens[0].quantidade, 44);
});

test("exportação mantém todos os registros, gera data no nome e libera o endereço temporário", async () => {
    const originais = { document: globalThis.document, criar: URL.createObjectURL, revogar: URL.revokeObjectURL, temporizador: globalThis.setTimeout };
    let blob;
    let clicou = false;
    let removeu = false;
    let revogou = false;
    const link = { click: () => { clicou = true; }, remove: () => { removeu = true; } };
    globalThis.document = { createElement: () => link, body: { appendChild() {} } };
    URL.createObjectURL = (arquivo) => { blob = arquivo; return "blob:teste"; };
    URL.revokeObjectURL = (endereco) => { revogou = endereco === "blob:teste"; };
    globalThis.setTimeout = (acao) => { acao(); };
    try {
        const itens = [
            { catalogoId: null, nome: "Poção", quantidade: 2, categoria: "consumiveis" },
            { catalogoId: "madeira", nome: "Madeira", quantidade: 44, categoria: "materiais" },
        ];
        exportarInventario(itens);
        assert.deepEqual(JSON.parse(await blob.text()), itens);
        assert.match(link.download, /^terraria-lulu-inventario-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/);
        assert.equal(clicou && removeu && revogou, true);
    } finally {
        globalThis.document = originais.document;
        URL.createObjectURL = originais.criar;
        URL.revokeObjectURL = originais.revogar;
        globalThis.setTimeout = originais.temporizador;
    }
});
