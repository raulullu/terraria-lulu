// Simulação limitada: testa lógica e eventos, não substitui um navegador real.
export function prepararAmbiente(dadosIniciais = null) {
    const elementos = new Map();
    const dados = new Map();
    if (dadosIniciais !== null) dados.set("terraria-lulu-inventario", dadosIniciais);
    const estado = { falharGravacao: false };

    class Elemento {
        constructor(tag = "div") {
            this.tagName = tag.toUpperCase();
            this.children = [];
            this.dataset = {};
            this.listeners = new Map();
            this.attributes = {};
            this.parentElement = null;
            this.value = "";
            this.hidden = false;
            this.disabled = false;
            this.files = [];
            this._text = "";
        }
        set textContent(valor) { this._text = String(valor); this.replaceChildren(); }
        get textContent() { return this._text; }
        appendChild(elemento) {
            elemento.remove();
            elemento.parentElement = this;
            this.children.push(elemento);
            if (this.tagName === "SELECT" && this.children.length === 1) this.value = elemento.value;
            return elemento;
        }
        insertBefore(elemento, referencia) {
            elemento.remove();
            elemento.parentElement = this;
            const indice = referencia === null ? this.children.length : this.children.indexOf(referencia);
            this.children.splice(indice, 0, elemento);
        }
        remove() {
            if (this.parentElement) {
                const filhos = this.parentElement.children;
                filhos.splice(filhos.indexOf(this), 1);
                this.parentElement = null;
            }
        }
        append(...elementos) { elementos.forEach((elemento) => this.appendChild(elemento)); }
        replaceChildren(...novos) {
            for (const filho of this.children) filho.parentElement = null;
            this.children = [];
            this.append(...novos);
        }
        setAttribute(nome, valor) { this.attributes[nome] = valor; }
        addEventListener(tipo, callback, opcoes = {}) {
            const listeners = this.listeners.get(tipo) ?? [];
            listeners.push({ callback, once: opcoes.once });
            this.listeners.set(tipo, listeners);
        }
        matches(seletor) {
            const tag = seletor.match(/^[a-z]+/i)?.[0];
            if (tag && this.tagName !== tag.toUpperCase()) return false;
            for (const [, chave, valor] of seletor.matchAll(/\[data-([\w-]+)(?:="([^"]*)")?\]/g)) {
                const propriedade = chave.replace(/-([a-z])/g, (_, letra) => letra.toUpperCase());
                if (!(propriedade in this.dataset)) return false;
                if (valor !== undefined && String(this.dataset[propriedade]) !== valor) return false;
            }
            return true;
        }
        querySelector(seletor) {
            for (const filho of this.children) {
                if (filho.matches(seletor)) return filho;
                const descendente = filho.querySelector(seletor);
                if (descendente) return descendente;
            }
            return null;
        }
        closest(seletor) {
            if (this.matches(seletor)) return this;
            return this.parentElement?.closest(seletor) ?? null;
        }
        focus() { globalThis.document.activeElement = this; }
        select() {}
        showModal() { this.open = true; }
        async close(valor = "") {
            this.open = false;
            this.returnValue = valor;
            await emitir(this, "close");
        }
    }

    globalThis.document = {
        activeElement: null,
        createElement: (tag) => new Elemento(tag),
        getElementById: (id) => {
            if (!elementos.has(id)) elementos.set(id, new Elemento(id.includes("categoria") || id === "ordem-itens" ? "select" : "div"));
            return elementos.get(id);
        },
        querySelectorAll: () => [...elementos.values()],
    };
    globalThis.localStorage = {
        getItem: (chave) => dados.get(chave) ?? null,
        setItem: (chave, valor) => {
            if (estado.falharGravacao) throw new Error("QuotaExceededError");
            dados.set(chave, valor);
        },
    };

    async function emitir(elemento, tipo, propriedades = {}) {
        const evento = { target: elemento, preventDefault() {}, ...propriedades };
        const listeners = [...(elemento.listeners.get(tipo) ?? [])];
        for (const listener of listeners) {
            if (listener.once) elemento.listeners.set(tipo, (elemento.listeners.get(tipo) ?? []).filter((item) => item !== listener));
            await listener.callback(evento);
        }
    }

    return {
        el: (id) => document.getElementById(id),
        dados,
        estado,
        emitir,
        lerSalvos: () => JSON.parse(dados.get("terraria-lulu-inventario") ?? "[]"),
    };
}
