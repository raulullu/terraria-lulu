import test from "node:test";
import assert from "node:assert/strict";
import { carregarInventario } from "../armazenamento.js";

test("falha de acesso ao armazenamento gera mensagem em português", () => {
    const descricaoAnterior = Object.getOwnPropertyDescriptor(
        globalThis,
        "localStorage"
    );

    Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: {
            getItem() {
                throw new Error("SecurityError");
            }
        }
    });

    try {
        assert.throws(
            () => carregarInventario(),
            /Não foi possível acessar os dados salvos neste navegador/
        );
    } finally {
        if (descricaoAnterior === undefined) {
            delete globalThis.localStorage;
        } else {
            Object.defineProperty(
                globalThis,
                "localStorage",
                descricaoAnterior
            );
        }
    }
});