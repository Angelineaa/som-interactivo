

// Tamaño de la cuadrícula de neuronas
export const GRID_SIZE = 10;

// Cantidad máxima de iteraciones
export const TOTAL_ITERATIONS = 500;


// ========================================
// 1. GENERAR DATOS DE ENTRADA
// ========================================

// Genera tres grupos de puntos bidimensionales; cada grupo aporta 50 ejemplos.
export function generateData() {

    // Centro (x, y) y color de cada grupo en el plano normalizado 0..1.
    const clusters = [
        { x: 0.23, y: 0.28, color: "#B5728A" },
        { x: 0.73, y: 0.30, color: "#AABAAE" },
        { x: 0.49, y: 0.76, color: "#9F9679" }
    ];

    const data = [];

    clusters.forEach(cluster => {

        for (let i = 0; i < 50; i++) {

            data.push({
                // Añade una variación aleatoria y mantiene cada coordenada dentro del plano.
                x: Math.max(0.04, Math.min(0.96,
                    cluster.x + (Math.random() - 0.5) * 0.26
                )),

                y: Math.max(0.04, Math.min(0.96,
                    cluster.y + (Math.random() - 0.5) * 0.26
                )),

                color: cluster.color
            });

        }

    });

    return data;
}


// ========================================
// 2. INICIALIZAR LAS NEURONAS
// ========================================

// Construye una neurona por celda y le asigna pesos iniciales aleatorios.
export function initializeNeurons() {

    const neurons = [];

    for (let row = 0; row < GRID_SIZE; row++) {

        for (let col = 0; col < GRID_SIZE; col++) {

            neurons.push({

                // row y col indican la posición topológica, no los pesos de entrada.
                row: row,
                col: col,

                // Pesos iniciales aleatorios
                x: Math.random(),
                y: Math.random()

            });

        }

    }

    return neurons;
}


// ========================================
// 3. CALCULAR DISTANCIA EUCLIDIANA
// ========================================

// Mide qué tan diferentes son dos puntos o vectores de pesos en el plano x-y.
export function calculateDistance(a, b) {

    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(
        dx * dx + dy * dy
    );

}


// ========================================
// 4. ENCONTRAR LA NEURONA GANADORA
// ========================================

// Compara una muestra con todas las neuronas y devuelve la de menor distancia.
export function findBMU(sample, neurons) {

    let winner = null;
    let minimumDistance = Infinity;

    neurons.forEach(neuron => {

        const distance = calculateDistance(
            sample,
            neuron
        );

        if (distance < minimumDistance) {

            minimumDistance = distance;
            winner = neuron;

        }

    });

    return winner;
}


// ========================================
// 5. CALCULAR LOS PARÁMETROS
// ========================================

// Calcula la tasa de aprendizaje y el radio adecuados para el ciclo actual.
export function calculateParameters(iteration) {

    const progress = iteration / TOTAL_ITERATIONS;

    // La tasa de aprendizaje disminuye
    const alpha = 0.55 * (1 - progress) + 0.04;

    // El radio de vecindad también disminuye
    const radius = Math.max(
        0.8,
        (GRID_SIZE / 2) * (1 - progress)
    );

    return {
        alpha,
        radius
    };
}


// ========================================
// 6. ACTUALIZAR LOS PESOS
// ========================================

// Ajusta cada neurona hacia la muestra y devuelve los índices de la vecindad
// que se resaltará en pantalla.
export function updateWeights(
    neurons,
    sample,
    winner,
    alpha,
    radius
) {

    const neighbors = new Set();

    neurons.forEach(neuron => {

        // Distancia entre neuronas en la cuadrícula
        const gridDistance = Math.sqrt(

            Math.pow(neuron.row - winner.row, 2) +
            Math.pow(neuron.col - winner.col, 2)

        );

        // Identificar las neuronas de la vecindad
        const index = neuron.row * GRID_SIZE + neuron.col;

        if (gridDistance <= radius * 2.2) {
            neighbors.add(index);
        }

        // La influencia gaussiana es máxima en la BMU y baja con la distancia.
        const influence = Math.exp(

            -(gridDistance * gridDistance) /
            (2 * radius * radius)

        );

        // Mueve los dos pesos hacia las coordenadas de la muestra.
        neuron.x += alpha * influence *
            (sample.x - neuron.x);

        // Actualización del peso Y
        neuron.y += alpha * influence *
            (sample.y - neuron.y);

    });

    return neighbors;
}
