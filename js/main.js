
/*
=========================================
Conecta los módulos y controla la simulación.
=========================================
*/


// ========================================
// 1. IMPORTAR LOS MÓDULOS
// ========================================

// Importa las constantes y operaciones matemáticas que implementan el SOM.
import {
    GRID_SIZE,
    TOTAL_ITERATIONS,
    generateData,
    initializeNeurons,
    findBMU,
    calculateParameters,
    updateWeights
} from "./som.js";

// Importa las funciones que dibujan los gráficos en los canvas.
import {
    renderVisualization
} from "./visualizacion.js";

// Carga los controles y textos interactivos que explican los pasos del algoritmo.
import "./pasos.js";


// ========================================
// 2. ELEMENTOS HTML
// ========================================

// Elementos que muestran el contador, el porcentaje y la barra de avance.
const iterationCount =
    document.getElementById("iteration-count");

const progressText =
    document.getElementById("progress-text");

const progressFill =
    document.getElementById("progress-fill");

// Indicadores de los parámetros usados en la iteración actual.
const bmuLabel =
    document.getElementById("bmu-label");

const radiusLabel =
    document.getElementById("radius-label");

const alphaLabel =
    document.getElementById("alpha-label");

// Área de texto que explica el estado actual de la simulación.
const liveTitle =
    document.getElementById("live-title");

const liveDescription =
    document.getElementById("live-description");

// Controles para avanzar, entrenar automáticamente y reiniciar.
const nextIterationButton =
    document.getElementById("next-iteration");

const autoTrainButton =
    document.getElementById("auto-train");

const resetButton =
    document.getElementById("reset");


// ========================================
// 3. VARIABLES DEL ENTRENAMIENTO
// ========================================

// Conjunto de puntos que la red debe aprender a representar.
let data = [];

// Neuronas y pesos que se van ajustando durante el entrenamiento.
let neurons = [];

// Estado de la iteración actual y elementos seleccionados en el último ciclo.
let iteration = 0;

let currentSample = null;

let winner = null;

let neighbors = new Set();

// Parámetros del aprendizaje y temporizador del modo automático.
let currentRadius = 0;

let currentAlpha = 0;

let trainingTimer = null;


// ========================================
// 4. INICIALIZAR LA SIMULACIÓN
// ========================================

function initializeSimulation() {

    // Crea una nueva colección de puntos y una red con pesos aleatorios.
    data = generateData();

    // Crear las neuronas con pesos iniciales
    neurons = initializeNeurons();

    // Borra el estado del entrenamiento anterior.
    iteration = 0;

    currentSample = null;

    winner = null;

    neighbors = new Set();

    currentRadius = 0;

    currentAlpha = 0;


    // Informa que el mapa está listo y todavía no ha procesado puntos.
    liveTitle.textContent =
        "El mapa está listo para aprender";

    liveDescription.textContent =
        "Los puntos son los datos de entrada y cada celda de la cuadrícula es una neurona con sus propios pesos. En cada iteración se elige un punto, se busca la neurona más parecida y se ajustan sus pesos y los de sus vecinas para que el mapa aprenda a representar los datos.";


    // Dibuja los gráficos y los indicadores con el estado recién creado.
    updateScreen();

}


// ========================================
// 5. EJECUTAR UNA ITERACIÓN DEL SOM
// ========================================

function trainOneIteration() {

    // Comprobar si terminó el entrenamiento
    if (iteration >= TOTAL_ITERATIONS) {

        stopTraining();

        return;

    }


    // PASO 1: Escoge al azar uno de los puntos que debe aprender la red.

    const randomIndex = Math.floor(
        Math.random() * data.length
    );

    currentSample = data[randomIndex];


    // PASO 2: Busca la neurona cuyos pesos se parecen más al punto.

    winner = findBMU(
        currentSample,
        neurons
    );


    // Cuenta el ciclo antes de calcular sus parámetros de aprendizaje.
    iteration++;


    // PASO 3: Reduce progresivamente el aprendizaje y el radio de vecindad.

    const parameters = calculateParameters(iteration);

    currentAlpha = parameters.alpha;

    currentRadius = parameters.radius;


    // PASO 4: Acerca los pesos de la ganadora y de las otras neuronas al punto.

    neighbors = updateWeights(
        neurons,
        currentSample,
        winner,
        currentAlpha,
        currentRadius
    );


    // PASO 5: Redibuja los gráficos y actualiza los textos visibles.

    updateScreen();

}


// ========================================
// 6. ACTUALIZAR LA INTERFAZ
// ========================================

function updateScreen() {

    // Envía el estado del SOM a los dos gráficos.
    renderVisualization(
        data,
        neurons,
        currentSample,
        winner,
        neighbors
    );


    // Refleja el número de ciclos y el porcentaje completado.
    iterationCount.textContent = iteration;


    // Calcular porcentaje de avance
    const percentage = Math.round(
        (iteration / TOTAL_ITERATIONS) * 100
    );

    progressText.textContent = percentage + " %";

    progressFill.style.width = percentage + "%";


    // Muestra la posición de la BMU y los parámetros del último ciclo.
    if (winner) {

        bmuLabel.textContent =
            `(${winner.row + 1}, ${winner.col + 1})`;

        radiusLabel.textContent =
            currentRadius.toFixed(2);

        alphaLabel.textContent =
            currentAlpha.toFixed(3);

    } else {

        bmuLabel.textContent = "No seleccionada";

        radiusLabel.textContent = "—";

        alphaLabel.textContent = "—";

    }


    // Mantiene la explicación alineada con el estado del entrenamiento.
    updateExplanation();

}


// ========================================
// 7. EXPLICACIÓN DE LO QUE ESTÁ OCURRIENDO
// ========================================

function updateExplanation() {

    if (!winner) {

        liveTitle.textContent =
            "El mapa está listo para aprender";

        liveDescription.textContent =
            "Cada punto de colores es un dato y cada celda de la cuadrícula es una neurona con pesos propios. Al avanzar, se elegirá un dato, se buscará la neurona con pesos más parecidos y se acercará esa neurona junto con sus vecinas al dato.";

        return;

    }


    // Prepara los valores que se insertan en el resumen de esta iteración.
    const trainingComplete = iteration >= TOTAL_ITERATIONS;
    const samplePosition =
        `(${currentSample.x.toFixed(2)}, ${currentSample.y.toFixed(2)})`;
    const winnerPosition =
        `(${winner.row + 1}, ${winner.col + 1})`;

    liveTitle.textContent = trainingComplete
        ? "¡Entrenamiento completado!"
        : `Iteración ${iteration} de ${TOTAL_ITERATIONS}: así aprende el mapa`;

    liveDescription.textContent =
        `Se eligió al azar el punto ${samplePosition}: x1 (${currentSample.x.toFixed(2)}) indica su posición horizontal y x2 (${currentSample.y.toFixed(2)}), la vertical; son coordenadas entre 0 y 1. La neurona más parecida es la BMU (${winnerPosition}); ella y sus vecinas ajustan sus pesos para acercarse al punto.${trainingComplete ? " Entrenamiento completado." : ""}`;

}


// ========================================
// 8. ENTRENAMIENTO AUTOMÁTICO
// ========================================

function startTraining() {

    // El mismo botón sirve para iniciar el modo automático o pausarlo.
    if (trainingTimer) {

        stopTraining();

        return;

    }


    if (iteration >= TOTAL_ITERATIONS) {

        return;

    }


    autoTrainButton.textContent =
        "Pausar entrenamiento";


    // Ejecuta ciclos sucesivos y se detiene al alcanzar el límite configurado.
    trainingTimer = setInterval(() => {

        trainOneIteration();

        if (iteration >= TOTAL_ITERATIONS) {

            stopTraining();

        }

    }, 45);

}


// ========================================
// 9. DETENER ENTRENAMIENTO
// ========================================

function stopTraining() {

    // Cancela el temporizador para que no se ejecuten más ciclos automáticos.
    if (trainingTimer) {

        clearInterval(trainingTimer);

        trainingTimer = null;

    }


    if (iteration >= TOTAL_ITERATIONS) {

        autoTrainButton.textContent =
            "Entrenamiento finalizado";

        autoTrainButton.disabled = true;

    } else {

        autoTrainButton.textContent =
            "Entrenar automáticamente";

    }

}


// ========================================
// 10. REINICIAR SIMULACIÓN
// ========================================

function resetSimulation() {

    // Cancela el modo automático y vuelve a habilitar sus controles.
    stopTraining();

    autoTrainButton.disabled = false;

    autoTrainButton.textContent =
        "Entrenar automáticamente";


    // Genera un conjunto y una red nuevos, y reinicia sus indicadores.
    initializeSimulation();

}


// ========================================
// 11. EVENTOS DE LOS BOTONES
// ========================================


// Avanzar una iteración
// Ejecuta un solo ciclo, a menos que ya se haya alcanzado el límite.
nextIterationButton.addEventListener("click", () => {

    if (iteration < TOTAL_ITERATIONS) {

        trainOneIteration();

    }

});


// Entrenar automáticamente o pausar
// Alterna entre el temporizador de entrenamiento y la pausa.
autoTrainButton.addEventListener("click", () => {

    startTraining();

});


// Reiniciar todo
// Vuelve al estado inicial con datos y pesos nuevos.
resetButton.addEventListener("click", () => {

    resetSimulation();

});


// Al cargar el módulo, prepara el primer conjunto de datos y dibuja el mapa.
initializeSimulation();
