import { GRID_SIZE } from "./som.js";


// Obtiene los canvas HTML y sus contextos 2D para dibujar en ellos.
const dataCanvas = document.getElementById("data-canvas");
const mapCanvas = document.getElementById("map-canvas");

const dataCtx = dataCanvas.getContext("2d");
const mapCtx = mapCanvas.getContext("2d");


// ========================================
// 1. OBTENER UNA NEURONA DE LA CUADRÍCULA
// ========================================

// Convierte una posición fila-columna en el índice lineal del arreglo.
function getNeuron(neurons, row, col) {

    return neurons[row * GRID_SIZE + col];

}


// Interpola entre dos colores hexadecimales; amount va de 0 a 1.
function blendColors(first, second, amount) {

    const firstRgb = first.match(/\w\w/g).map(value => parseInt(value, 16));
    const secondRgb = second.match(/\w\w/g).map(value => parseInt(value, 16));
    const blended = firstRgb.map((value, channel) =>
        Math.round(value + (secondRgb[channel] - value) * amount)
    );

    return `rgb(${blended.join(", ")})`;

}

// Asigna un tono de la paleta a partir del promedio de los dos pesos aprendidos.
function getNeuronColor(neuron) {

    const palette = [
        "#933B5B",
        "#B5728A",
        "#9F9679",
        "#AABAAE",
        "#E3D6BF"
    ];
    const value = (neuron.x + neuron.y) / 2;
    const scaledValue = value * (palette.length - 1);
    const paletteIndex = Math.min(
        Math.floor(scaledValue),
        palette.length - 2
    );

    return blendColors(
        palette[paletteIndex],
        palette[paletteIndex + 1],
        scaledValue - paletteIndex
    );

}


// ========================================
// 2. DIBUJAR EL FONDO
// ========================================

// Limpia el canvas, pinta el fondo y dibuja una cuadrícula de referencia.
function drawBackground(ctx, width, height, padding) {

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#f7f3eb";

    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#e3d6bf";
    ctx.lineWidth = 1;

    // Líneas de referencia
    for (let i = 0; i <= 5; i++) {

        const x = padding +
            (width - padding * 2) * i / 5;

        const y = padding +
            (height - padding * 2) * i / 5;

        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

    }

}


// ========================================
// 3. DIBUJAR EL ESPACIO DE CARACTERÍSTICAS
// ========================================

// Dibuja puntos de entrada, la red deformable, la BMU y su vecindad
// usando las coordenadas de los pesos en el plano x1-x2.
export function drawFeatureSpace(
    data,
    neurons,
    sample,
    winner,
    neighbors
) {

    const width = dataCanvas.width;
    const height = dataCanvas.height;

    const padding = 35;

    drawBackground(
        dataCtx,
        width,
        height,
        padding
    );

    // Convierte las coordenadas normalizadas del SOM a píxeles del canvas.
    // El eje vertical se invierte porque el canvas crece de arriba hacia abajo.
    const px = value =>
        padding + value * (width - padding * 2);

    const py = value =>
        height - padding - value * (height - padding * 2);


    // Dibujar los datos de entrada
    data.forEach(point => {

        dataCtx.beginPath();

        dataCtx.arc(
            px(point.x),
            py(point.y),
            3,
            0,
            Math.PI * 2
        );

        dataCtx.fillStyle = point.color;
        dataCtx.globalAlpha = 0.75;
        dataCtx.fill();

    });

    dataCtx.globalAlpha = 1;


    // Dibujar las conexiones horizontales y verticales
    dataCtx.strokeStyle = "#9f9679";
    dataCtx.lineWidth = 1.4;

    for (let row = 0; row < GRID_SIZE; row++) {

        for (let col = 0; col < GRID_SIZE; col++) {

            const neuron = getNeuron(neurons, row, col);

            // Conexión con la neurona de la derecha
            if (col < GRID_SIZE - 1) {

                const right = getNeuron(
                    neurons,
                    row,
                    col + 1
                );

                dataCtx.beginPath();

                dataCtx.moveTo(
                    px(neuron.x),
                    py(neuron.y)
                );

                dataCtx.lineTo(
                    px(right.x),
                    py(right.y)
                );

                dataCtx.stroke();

            }

            // Conexión con la neurona inferior
            if (row < GRID_SIZE - 1) {

                const below = getNeuron(
                    neurons,
                    row + 1,
                    col
                );

                dataCtx.beginPath();

                dataCtx.moveTo(
                    px(neuron.x),
                    py(neuron.y)
                );

                dataCtx.lineTo(
                    px(below.x),
                    py(below.y)
                );

                dataCtx.stroke();

            }

        }

    }


    // Dibuja las neuronas y diferencia la ganadora y las neuronas cercanas.
    neurons.forEach((neuron, index) => {

        const isWinner = winner === neuron;

        const isNeighbor = neighbors.has(index);

        dataCtx.beginPath();

        dataCtx.arc(
            px(neuron.x),
            py(neuron.y),
            isWinner ? 7 : isNeighbor ? 5 : 3,
            0,
            Math.PI * 2
        );

        if (isWinner) {

            dataCtx.fillStyle = "#933b5b";

        } else if (isNeighbor) {

            dataCtx.fillStyle = "#b5728a";

        } else {

            dataCtx.fillStyle = "#9f9679";

        }

        dataCtx.fill();

        // Resaltar la neurona ganadora
        if (isWinner) {

            dataCtx.beginPath();

            dataCtx.arc(
                px(neuron.x),
                py(neuron.y),
                11,
                0,
                Math.PI * 2
            );

            dataCtx.strokeStyle = "#933b5b";
            dataCtx.lineWidth = 2;
            dataCtx.stroke();

        }

    });


    // Rodea el punto actual para distinguirlo del resto de los datos.
    if (sample) {

        dataCtx.beginPath();

        dataCtx.arc(
            px(sample.x),
            py(sample.y),
            7,
            0,
            Math.PI * 2
        );

        dataCtx.strokeStyle = "#382d2e";
        dataCtx.lineWidth = 2;
        dataCtx.stroke();

    }

}


// ========================================
// 4. DIBUJAR EL MAPA BIDIMENSIONAL
// ========================================

// Dibuja una celda por neurona en su fila y columna de la cuadrícula.
// El color representa sus pesos; el relleno y la estrella identifican la BMU
// y los tonos rosados muestran su vecindad.
export function drawTopologicalMap(
    neurons,
    winner,
    neighbors
) {

    const width = mapCanvas.width;
    const height = mapCanvas.height;

    const padding = 42;

    drawBackground(
        mapCtx,
        width,
        height,
        padding
    );

    const cellWidth =
        (width - padding * 2) / GRID_SIZE;

    const cellHeight =
        (height - padding * 2) / GRID_SIZE;


    neurons.forEach((neuron, index) => {

        const x = padding + neuron.col * cellWidth;
        const y = padding + neuron.row * cellHeight;

        const isWinner = winner === neuron;
        const isNeighbor = neighbors.has(index);

        // La selección de colores prioriza la BMU y la vecindad sobre el peso.
        mapCtx.fillStyle = isWinner
            ? "#933B5B"
            : isNeighbor
                ? "#B5728A"
                : getNeuronColor(neuron);

        mapCtx.fillRect(
            x + 2,
            y + 2,
            cellWidth - 4,
            cellHeight - 4
        );

        // Un borde de contraste separa cada celda y refuerza los resaltados.
        mapCtx.strokeStyle = isWinner || isNeighbor
            ? "#702B45"
            : "#F7F3EB";
        mapCtx.lineWidth = isWinner ? 4 : isNeighbor ? 2.5 : 1;
        mapCtx.strokeRect(
            x + 2,
            y + 2,
            cellWidth - 4,
            cellHeight - 4
        );

        // Resaltar la neurona ganadora
        if (isWinner) {
            mapCtx.fillStyle = "#E3D6BF";
            mapCtx.font = "bold 19px Arimo";
            mapCtx.textAlign = "center";
            mapCtx.textBaseline = "middle";

            mapCtx.fillText(
                "★",
                x + cellWidth / 2,
                y + cellHeight / 2
            );

        }

    });

}


// ========================================
// 5. ACTUALIZAR LAS DOS VISUALIZACIONES
// ========================================

// Punto de entrada del módulo visual: vuelve a dibujar ambos canvas
// con el estado más reciente del entrenamiento.
export function renderVisualization(
    data,
    neurons,
    sample,
    winner,
    neighbors
) {

    drawFeatureSpace(
        data,
        neurons,
        sample,
        winner,
        neighbors
    );

    drawTopologicalMap(
        neurons,
        winner,
        neighbors
    );

}
