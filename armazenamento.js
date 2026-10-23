import { prepararInventario } from "./inventario.js";

export const CHAVE_INVENTARIO = "terraria-lulu-inventario";
export const CHAVE_ORDEM = "terraria-lulu-ordem";
export const ORDENS = ["cadastro", "az", "za", "quantidade", "menor-quantidade"];

// JSON.parse lança mensagens em inglês ("Unexpected token..."). Aqui elas viram texto claro para quem usa o app.
function lerJson(texto, mensagem) {
    try {
        return JSON.parse(texto);
    } catch {
        throw new Error(mensagem);
    }
}

function lerDadosSalvos(chave) {
    try {
        return localStorage.getItem(chave);
    } catch {
        throw new Error(
            "Não foi possível acessar os dados salvos neste navegador."
        );
    }
}

export function carregarInventario() {
    const dados = lerDadosSalvos(CHAVE_INVENTARIO);
    if (dados === null) return { itens: [], avisos: [] };
    return prepararInventario(lerJson(dados, "O conteúdo salvo não é um JSON válido."), {
        aceitarLegado: true,
        recuperarOrfaos: true,
    });
}

export function salvarInventario(itens) {
    const preparados = prepararInventario(itens).itens;
    try {
        localStorage.setItem(CHAVE_INVENTARIO, JSON.stringify(preparados));
    } catch {
        throw new Error("Não foi possível salvar no navegador. A alteração não foi aplicada. Verifique o espaço e as permissões de armazenamento.");
    }
}

export function carregarOrdem() {
    const ordem = lerDadosSalvos(CHAVE_ORDEM);
    return ORDENS.includes(ordem) ? ordem : "cadastro";
}

export function salvarOrdem(ordem) {
    if (!ORDENS.includes(ordem)) throw new Error("Opção de ordenação inválida.");
    try {
        localStorage.setItem(CHAVE_ORDEM, ordem);
    } catch {
        throw new Error("Não foi possível salvar a preferência de ordenação.");
    }
}

export async function lerArquivoInventario(arquivo) {
    let texto;

    try {
        texto = await arquivo.text();
    } catch {
        throw new Error("Não foi possível ler o arquivo selecionado.");
    }

    const dados = lerJson(texto, "O arquivo não é um JSON válido.");
    return prepararInventario(dados).itens;
}

export function baixarArquivo(conteudo, nome, tipo) {
    const endereco = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
    const link = document.createElement("a");
    link.href = endereco;
    link.download = nome;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(endereco), 1000);
}

export function exportarInventario(itens) {
    const data = new Date();
    const numero = (valor) => String(valor).padStart(2, "0");
    const dia = `${data.getFullYear()}-${numero(data.getMonth() + 1)}-${numero(data.getDate())}`;
    const horario = `${numero(data.getHours())}-${numero(data.getMinutes())}-${numero(data.getSeconds())}`;
    baixarArquivo(JSON.stringify(itens, null, 2), `terraria-lulu-inventario-${dia}_${horario}.json`, "application/json");
}

export function exportarDadosSalvos() {
    const dados = lerDadosSalvos(CHAVE_INVENTARIO);
    if (dados === null) throw new Error("Não há dados salvos para baixar.");
    baixarArquivo(dados, "terraria-lulu-dados-para-recuperacao.txt", "text/plain");
}
