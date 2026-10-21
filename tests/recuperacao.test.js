import test from "node:test";
import assert from "node:assert/strict";
import { prepararAmbiente } from "./dom-simulado.js";

const { el, emitir, dados, lerSalvos } = prepararAmbiente("{");
await import("../script.js");

test("dados corrompidos não são sobrescritos e exigem recuperação explícita", async () => {
    assert.equal(el("recuperacao").hidden, false);
    assert.equal(el("adicionar-item").disabled, true);
    assert.equal(dados.get("terraria-lulu-inventario"), "{");
    el("nome-item").value = "Tentativa";
    el("quantidade-item").value = "1";
    await emitir(el("formulario-item"), "submit");
    assert.equal(dados.get("terraria-lulu-inventario"), "{");

    const cancelar = emitir(el("iniciar-novo"), "click");
    await el("dialogo-confirmacao").close("cancelar");
    await cancelar;
    assert.equal(dados.get("terraria-lulu-inventario"), "{");

    const confirmar = emitir(el("iniciar-novo"), "click");
    await el("dialogo-confirmacao").close("confirmar");
    await confirmar;
    assert.deepEqual(lerSalvos(), []);
    assert.equal(el("recuperacao").hidden, true);
    assert.equal(el("adicionar-item").disabled, false);
});
