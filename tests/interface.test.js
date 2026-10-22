import test from "node:test";
import assert from "node:assert/strict";
import { prepararAmbiente } from "./dom-simulado.js";

const ambiente = prepararAmbiente();
const { el, emitir, lerSalvos, estado } = ambiente;
await import("../script.js");
const { ordenarParaExibicao } = await import("../interface.js");
const esperarMensagem = () => new Promise((resolve) => setTimeout(resolve, 45));

async function adicionar(nome, quantidade = 1) {
    el("nome-item").value = nome;
    el("quantidade-item").value = String(quantidade);
    await emitir(el("formulario-item"), "submit");
}

async function importar(dados, confirmar = true) {
    el("importar-itens").files = [{ text: async () => JSON.stringify(dados) }];
    const promessa = emitir(el("importar-itens"), "change");
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (el("dialogo-confirmacao").open) await el("dialogo-confirmacao").close(confirmar ? "confirmar" : "cancelar");
    await promessa;
}

test("fluxos de interface com os módulos reais e DOM simulado", async (t) => {
    await t.test("categoria manual não desaparece ao digitar", async () => {
        el("categoria-item").value = "armas";
        el("nome-item").value = "Espada manual";
        await emitir(el("nome-item"), "input");
        assert.equal(el("categoria-item").value, "armas");
        el("nome-item").value = "Pedra";
        await emitir(el("nome-item"), "input");
        assert.equal(el("categoria-item").disabled, true);
        el("nome-item").value = "Pedral";
        await emitir(el("nome-item"), "input");
        assert.equal(el("categoria-item").value, "armas");
        assert.equal(el("categoria-item").disabled, false);
    });

    await t.test("ordenação automática só altera a exibição", async () => {
        await adicionar("Zebra");
        await adicionar("Areia");
        el("ordem-itens").value = "az";
        await emitir(el("ordem-itens"), "change");
        await adicionar("Bambu");
        assert.deepEqual(lerSalvos().map((item) => item.nome), ["Zebra", "Areia", "Bambu"]);
        assert.deepEqual(el("lista-itens").children.map((linha) => linha.children[0].textContent), ["Areia", "Bambu", "Zebra"]);
        const originais = lerSalvos();
        ordenarParaExibicao(originais, "za");
        assert.deepEqual(originais.map((item) => item.nome), ["Zebra", "Areia", "Bambu"]);
    });

    await t.test("ativações sucessivas de +1 e −1 mantêm o foco no botão usado", async () => {
        const linha = el("lista-itens").children.find((item) => item.children[0].textContent === "Zebra");
        linha.querySelector('button[data-acao="aumentar"]').focus();
        for (let vez = 0; vez < 2; vez += 1) {
            await emitir(el("lista-itens"), "click", { target: document.activeElement });
            assert.equal(document.activeElement.dataset.acao, "aumentar");
            assert.equal(document.activeElement.dataset.indice, 0);
        }
        assert.equal(lerSalvos()[0].quantidade, 3);
        el("lista-itens").children.find((item) => item.children[0].textContent === "Zebra")
            .querySelector('button[data-acao="diminuir"]').focus();
        for (let vez = 0; vez < 2; vez += 1) {
            await emitir(el("lista-itens"), "click", { target: document.activeElement });
            assert.equal(document.activeElement.dataset.acao, "diminuir");
        }
        assert.equal(lerSalvos()[0].quantidade, 1);
    });

    await t.test("remoção usa último cadastrado e pode ser desfeita", async () => {
        await emitir(el("remover-ultimo"), "click");
        assert.deepEqual(lerSalvos().map((item) => item.nome), ["Zebra", "Areia"]);
        assert.equal(el("desfazer-remocao").hidden, false);
        await emitir(el("desfazer-remocao"), "click");
        assert.deepEqual(lerSalvos().map((item) => item.nome), ["Zebra", "Areia", "Bambu"]);
    });

    await t.test("adicionar com filtro avisa que o item está oculto", async () => {
        el("buscar-item").value = "bota";
        await emitir(el("buscar-item"), "input");
        await adicionar("Espada");
        await esperarMensagem();
        assert.match(el("mensagem-item").textContent, /oculto pelos filtros/);
        assert.equal(el("remover-ultimo").disabled, true);
        assert.equal(el("lista-itens").children.every((linha) => linha.hidden), true);
        await emitir(el("limpar-filtros"), "click");
    });

    await t.test("falha ao salvar cadastro mantém estado, armazenamento e campo", async () => {
        const anteriores = lerSalvos();
        estado.falharGravacao = true;
        await adicionar("Não salvar");
        await esperarMensagem();
        assert.deepEqual(lerSalvos(), anteriores);
        assert.equal(el("lista-itens").children.length, anteriores.length);
        assert.equal(el("nome-item").value, "Não salvar");
        assert.match(el("mensagem-item").textContent, /^Erro:/);
        estado.falharGravacao = false;
    });

    await t.test("importação inválida ou cancelada preserva dados", async () => {
        const anteriores = lerSalvos();
        await importar([{ nome: "Inválido", quantidade: 0 }]);
        assert.deepEqual(lerSalvos(), anteriores);
        await importar([{ nome: "Novo", quantidade: 2 }], false);
        assert.deepEqual(lerSalvos(), anteriores);
    });

    await t.test("falha na gravação da importação também preserva a tela", async () => {
        const anteriores = lerSalvos();
        estado.falharGravacao = true;
        await importar([{ nome: "Novo", quantidade: 2 }]);
        assert.deepEqual(lerSalvos(), anteriores);
        assert.equal(el("lista-itens").children.length, anteriores.length);
        estado.falharGravacao = false;
    });

    await t.test("importação válida troca tudo depois da confirmação", async () => {
        await importar([{ nome: "Pedra", catalogoId: "pedra", quantidade: 40, categoria: "materiais" }]);
        assert.equal(lerSalvos().length, 1);
        assert.equal(lerSalvos()[0].quantidade, 40);
        assert.equal(el("lista-itens").children[0].querySelector('[data-controle="categoria"]').disabled, true);
    });

    await t.test("botões de quantidade usam o campo atual e impedem zero", async () => {
        let linha = el("lista-itens").children[0];
        linha.querySelector('[data-controle="quantidade"]').value = "45";
        await emitir(el("lista-itens"), "click", { target: linha.querySelector('button[data-acao="aumentar"]') });
        assert.equal(lerSalvos()[0].quantidade, 46);
        linha = el("lista-itens").children[0];
        linha.querySelector('[data-controle="quantidade"]').value = "1";
        await emitir(el("lista-itens"), "click", { target: linha.querySelector('button[data-acao="diminuir"]') });
        assert.equal(lerSalvos()[0].quantidade, 46);
    });

    await t.test("quantidade inválida não entra ao clicar em +1", async () => {
        const linha = el("lista-itens").children[0];
        linha.querySelector('[data-controle="quantidade"]').value = "0";
        await emitir(el("lista-itens"), "click", { target: linha.querySelector('button[data-acao="aumentar"]') });
        assert.equal(lerSalvos()[0].quantidade, 46);
    });

    await t.test("renomeação usa diálogo e atualiza rótulos dos controles", async () => {
        await importar([{ nome: "Manual", quantidade: 1 }]);
        const linha = el("lista-itens").children[0];
        const promessa = emitir(el("lista-itens"), "click", { target: linha.querySelector('button[data-acao="renomear"]') });
        await new Promise((resolve) => setTimeout(resolve, 0));
        el("novo-nome").value = "Pedra manual";
        await el("dialogo-renomear").close("confirmar");
        await promessa;
        assert.equal(lerSalvos()[0].nome, "Pedra manual");
        assert.equal(lerSalvos()[0].catalogoId, null);
        assert.equal(el("lista-itens").children[0].querySelector('button[data-acao="remover"]').attributes["aria-label"], "Remover Pedra manual");
    });

    await t.test("busca ignora acentos e Esc mantém o filtro de categoria", async () => {
        await importar([{ nome: "Poção Mágica", quantidade: 12, categoria: "consumiveis" }, { nome: "Areia", quantidade: 3, categoria: "materiais" }]);
        el("buscar-item").value = "  POCAO  ";
        el("filtrar-categoria").value = "consumiveis";
        await emitir(el("buscar-item"), "input");
        assert.match(el("mensagem-busca").textContent, /Registros encontrados: 1 \| Unidades: 12/);
        await emitir(el("buscar-item"), "keydown", { key: "Escape" });
        assert.equal(el("buscar-item").value, "");
        assert.equal(el("filtrar-categoria").value, "consumiveis");
        await emitir(el("limpar-filtros"), "click");
    });

    await t.test("editar quantidade reaplica a ordem de exibição e os totais", async () => {
        el("ordem-itens").value = "quantidade";
        await emitir(el("ordem-itens"), "change");
        const campo = el("lista-itens").children.find((linha) => linha.children[0].textContent === "Areia").querySelector('[data-controle="quantidade"]');
        campo.value = "30";
        await emitir(el("lista-itens"), "change", { target: campo });
        assert.equal(el("lista-itens").children[0].children[0].textContent, "Areia");
        assert.equal(el("total-itens").textContent, "Registros: 2 | Unidades: 42");
        assert.deepEqual(lerSalvos().map((item) => item.nome), ["Poção Mágica", "Areia"]);
    });

    await t.test("falha ao remover mantém estado e uma alteração posterior encerra o desfazer", async () => {
        const anteriores = lerSalvos();
        estado.falharGravacao = true;
        await emitir(el("remover-ultimo"), "click");
        assert.deepEqual(lerSalvos(), anteriores);
        estado.falharGravacao = false;
        await emitir(el("remover-ultimo"), "click");
        assert.equal(el("desfazer-remocao").hidden, false);
        await adicionar("Bambu");
        assert.equal(el("desfazer-remocao").hidden, true);
    });

    await t.test("resultados visuais são imediatos e anúncios aguardam a pausa na busca", async () => {
        const anterior = el("anuncio-busca").textContent;
        el("buscar-item").value = "Bambu";
        await emitir(el("buscar-item"), "input");
        el("buscar-item").value = "nome inexistente";
        await emitir(el("buscar-item"), "input");
        assert.equal(el("mensagem-busca").textContent, "Nenhum item encontrado.");
        assert.equal(el("anuncio-busca").textContent, anterior);
        await new Promise((resolve) => setTimeout(resolve, 400));
        assert.equal(el("anuncio-busca").textContent, "Nenhum item encontrado.");
    });
});
