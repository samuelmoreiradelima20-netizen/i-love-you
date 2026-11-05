
const coracao = document.getElementById("heart");

const largura = 900;
const altura = 720;

const svgNS = "http://www.w3.org/2000/svg";

const FONTE = "Arial";

const TAMANHOS = [9, 10, 11, 12];
const ESPACO = 7;

// Configurações da animação original
const DURACAO = 10000;
const INTERVALO = 16;
const FRAMES = 42;
const ALTURA_ENTRADA = 34;

const FUNDO = "#060208";

const VINHO = [0.58, 0, 0.09];
const CARMESIM = [0.90, 0.05, 0.14];
const VERMELHO = [0.98, 0.10, 0.16];
const BRILHO = [1, 0.78, 0.78];

const COR_FUNDO = [
    parseInt(FUNDO.slice(1, 3), 16) / 255,
    parseInt(FUNDO.slice(3, 5), 16) / 255,
    parseInt(FUNDO.slice(5, 7), 16) / 255
];

// Criação do SVG
const svg = document.createElementNS(svgNS, "svg");

svg.setAttribute("viewBox", `0 0 ${largura} ${altura}`);
svg.setAttribute("width", "100%");
svg.setAttribute("height", "100%");

coracao.replaceChildren(svg);

// Mistura duas cores
function misturar(a, b, fator) {
    return a.map((valor, i) =>
        valor + (b[i] - valor) * fator
    );
}

// Limita valores
function limitar(valor) {
    return Math.max(0, Math.min(1, valor));
}

// Converte RGB para hexadecimal
function corHex(cor) {
    return "#" + cor.map(valor =>
        Math.floor(limitar(valor) * 255)
            .toString(16)
            .padStart(2, "0")
    ).join("");
}

// Fórmula original do coração
function calcularCoracao(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);

    const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t);

    const escala = 18.5;

    return {
        x: largura / 2 + x * escala,
        y: altura / 2 - y * escala
    };
}

// Cria os pontos do contorno
function criarContorno() {
    const pontos = [];

    for (let i = 0; i < 720; i++) {
        const t = (2 * Math.PI * i) / 720;

        pontos.push(calcularCoracao(t));
    }

    return pontos;
}

const poligono = criarContorno();

const arestas = poligono.map((ponto, i) => [
    ponto,
    poligono[(i + 1) % poligono.length]
]);

const YMAX = Math.max(...poligono.map(p => p.y));
const YMIN = Math.min(...poligono.map(p => p.y));
const CY = (YMAX + YMIN) / 2;

// Encontra os intervalos horizontais
function encontrarIntervalos(y) {
    const intersecoes = [];

    for (const [a, b] of arestas) {
        if (
            (a.y <= y && y < b.y) ||
            (b.y <= y && y < a.y)
        ) {
            const x =
                a.x + (y - a.y) *
                (b.x - a.x) / (b.y - a.y);

            intersecoes.push(x);
        }
    }

    intersecoes.sort((a, b) => a - b);

    const intervalos = [];

    for (let i = 0; i < intersecoes.length; i += 2) {
        if (intersecoes[i + 1] !== undefined) {
            intervalos.push([
                intersecoes[i],
                intersecoes[i + 1]
            ]);
        }
    }

    return intervalos;
}

// Interseção entre duas linhas
function intersectar(a, b) {
    const resultado = [];

    for (const primeiro of a) {
        for (const segundo of b) {
            const inicio = Math.max(primeiro[0], segundo[0]);
            const fim = Math.min(primeiro[1], segundo[1]);

            if (fim - inicio > 14) {
                resultado.push([inicio, fim]);
            }
        }
    }

    return resultado;
}

// Embaralha os idiomas
function embaralhar(lista) {
    const resultado = [...lista];

    for (let i = resultado.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [resultado[i], resultado[j]] =
            [resultado[j], resultado[i]];
    }

    return resultado;
}

// Ciclo de frases
function* cicloFrases() {
    while (true) {
        const frases = embaralhar(
            idiomas.map(item => item.frase)
        );

        yield* frases;
    }
}

// Mede as frases
const canvas = document.createElement("canvas");
const contexto = canvas.getContext("2d");

function medirFrase(frase, tamanho) {
    contexto.font = `bold ${tamanho}px ${FONTE}`;

    return contexto.measureText(frase).width;
}

// Distância do centro
function calcularDistancia(x, y) {
    return Math.min(
        1,
        Math.hypot(
            (x - largura / 2) / (16 * 18.5),
            (y - CY) / (14.5 * 18.5)
        )
    );
}

// Calcula a cor de cada frase
function calcularCor(x, y, borda) {
    const distancia = calcularDistancia(x, y);

    let cor = misturar(
        VINHO,
        CARMESIM,
        0.25 + 0.75 * distancia
    );

    cor = misturar(
        cor,
        VERMELHO,
        Math.random() * 0.35 + (borda ? 0.3 : 0)
    );

    return cor;
}

// Organiza as frases no coração
function construirCoracao() {
    const ciclo = cicloFrases();

    const alturaLinha = 21;
    const metade = alturaLinha / 2;

    const frases = [];

    for (
        let y = YMIN + metade;
        y < YMAX - metade;
        y += alturaLinha
    ) {
        const linha = intersectar(
            encontrarIntervalos(y + metade),
            encontrarIntervalos(y - metade)
        );

        for (const [inicioOriginal, fimOriginal] of linha) {
            const inicio = inicioOriginal + 4;
            const fim = fimOriginal - 4;

            let atual = inicio + Math.random() * 8;

            const itens = [];

            while (true) {
                let escolhido = null;

                for (let tentativa = 0; tentativa < 10; tentativa++) {
                    const frase = ciclo.next().value;

                    const tamanho = TAMANHOS[
                        Math.floor(Math.random() * TAMANHOS.length)
                    ];

                    const comprimento = medirFrase(frase, tamanho);

                    if (atual + comprimento <= fim) {
                        escolhido = {
                            frase,
                            tamanho,
                            comprimento
                        };

                        break;
                    }
                }

                if (!escolhido) break;

                itens.push(escolhido);
                atual += escolhido.comprimento + ESPACO;
            }

            if (itens.length === 0) continue;

            const larguraUsada = itens.reduce(
                (soma, item) => soma + item.comprimento,
                0
            ) + ESPACO * (itens.length - 1);

            const sobra = Math.max(
                0,
                fim - inicio - larguraUsada
            );

            let posicao = inicio;

            itens.forEach((item, i) => {
                let x = posicao + item.comprimento / 2;

                if (itens.length === 1) {
                    x = (inicio + fim) / 2;
                } else {
                    x += sobra * i / (itens.length - 1);
                }

                const borda =
                    i === 0 || i === itens.length - 1;

                frases.push({
                    x,
                    y,
                    frase: item.frase,
                    tamanho: item.tamanho,
                    cor: calcularCor(x, y, borda)
                });

                posicao += item.comprimento + ESPACO;
            });
        }
    }

    return frases;
}

// Cria um elemento de texto SVG
function criarTexto(frase, x, y, tamanho, cor) {
    const texto = document.createElementNS(svgNS, "text");

    texto.textContent = frase;

    texto.setAttribute("x", x);
    texto.setAttribute("y", y);

    texto.setAttribute("text-anchor", "middle");
    texto.setAttribute("dominant-baseline", "middle");

    texto.setAttribute("font-family", FONTE);
    texto.setAttribute("font-size", tamanho);
    texto.setAttribute("font-weight", "bold");

    texto.setAttribute("fill", corHex(cor));

    svg.appendChild(texto);

    return texto;
}

// Anima uma frase individual
function animarFrase(item, aoTerminar) {
    const x = item.x;
    const y = item.y;

    const cor = item.cor;
    const tamanho = item.tamanho;

    const deslocamentoX = Math.random() * 20 - 10;

    // Sombra
    const sombra = criarTexto(
        item.frase,
        x + 2,
        y + 3,
        tamanho,
        COR_FUNDO
    );

    // Halo
    const halo = criarTexto(
        item.frase,
        x,
        y,
        tamanho + 1,
        COR_FUNDO
    );

    // Frase principal começa acima
    const principal = criarTexto(
        item.frase,
        x + deslocamentoX,
        y - ALTURA_ENTRADA,
        tamanho,
        COR_FUNDO
    );

    let quadro = 0;

    function animar() {
        quadro++;

        const progresso = limitar(quadro / FRAMES);

        // Desaceleração suave
        const suavizacao = 1 - Math.pow(1 - progresso, 3);

        const movimentoX =
            x + deslocamentoX * (1 - suavizacao);

        const movimentoY =
            y - ALTURA_ENTRADA * (1 - suavizacao);

        // Sombra
        sombra.setAttribute(
            "fill",
            corHex(
                misturar(
                    COR_FUNDO,
                    cor.map(valor => valor * 0.30),
                    suavizacao
                )
            )
        );

        // Halo
        halo.setAttribute("x", movimentoX);
        halo.setAttribute("y", movimentoY);

        halo.setAttribute(
            "fill",
            corHex(
                misturar(
                    COR_FUNDO,
                    cor.map(valor => valor * 0.20),
                    suavizacao * suavizacao
                )
            )
        );

        // Clarão rosado na chegada
        const claridade = 0.75 * Math.sin(
            Math.PI * limitar((progresso - 0.55) / 0.45)
        );

        const corAtual = misturar(
            misturar(
                COR_FUNDO,
                cor,
                Math.pow(suavizacao, 1.5)
            ),
            BRILHO,
            claridade
        );

        principal.setAttribute("x", movimentoX);
        principal.setAttribute("y", movimentoY);
        principal.setAttribute("fill", corHex(corAtual));

        if (progresso >= 1) {
            halo.setAttribute("x", x);
            halo.setAttribute("y", y);

            principal.setAttribute("x", x);
            principal.setAttribute("y", y);
            principal.setAttribute("fill", corHex(cor));

            aoTerminar(principal, cor);

            return;
        }

        setTimeout(
            () => requestAnimationFrame(animar),
            INTERVALO
        );
    }

    requestAnimationFrame(animar);
}

// Brilhos aleatórios depois que o coração estiver pronto
function iniciarBrilho(frasesPrincipais) {
    function brilhar() {
        const escolhido = frasesPrincipais[
            Math.floor(Math.random() * frasesPrincipais.length)
        ];

        escolhido.elemento.setAttribute(
            "fill",
            corHex(
                misturar(escolhido.cor, BRILHO, 0.6)
            )
        );

        setTimeout(() => {
            escolhido.elemento.setAttribute(
                "fill",
                corHex(escolhido.cor)
            );
        }, 260);

        setTimeout(brilhar, 140);
    }

    brilhar();
}

// Inicia a formação do coração
function formarCoracao() {
    const frases = construirCoracao();

    const frasesPrincipais = [];

    let concluidas = 0;

    console.log(`Idiomas cadastrados: ${idiomas.length}`);
    console.log(`Frases exibidas: ${frases.length}`);

    frases.forEach((item, i) => {
        // Distribui as entradas ao longo de 10 segundos
        const atraso = i * (DURACAO / frases.length);

        setTimeout(() => {
            animarFrase(item, (elemento, cor) => {
                frasesPrincipais.push({
                    elemento,
                    cor
                });

                concluidas++;

                if (concluidas === frases.length) {
                    iniciarBrilho(frasesPrincipais);
                }
            });
        }, atraso);
    });
}

formarCoracao();
