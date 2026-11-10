
// ========================================
// 1. INFORMACIÓN DE CADA ETAPA
// ========================================

// Contenido educativo mostrado al navegar los seis pasos del SOM.
const steps = [

    {
        title: "Inicialización de la red",

        description:
            "Se crea una cuadrícula de neuronas. Cada una recibe un vector de pesos inicial, normalmente asignado aleatoriamente. Al principio, el mapa todavía no representa la distribución de los datos.",

        formula:
            "wᵢ = [w₁, w₂, ..., wₙ]",

        note:
            "Cada neurona comienza con un conjunto de pesos."
    },

    {
        title: "Selección de un dato de entrada",

        description:
            "El algoritmo elige al azar un punto del conjunto de datos. Sus dos valores son coordenadas entre 0 y 1: x₁ indica la posición horizontal y x₂ la vertical. Por ejemplo, (0.77, 0.23) se ubica en x₁ = 0.77 y x₂ = 0.23.",

        formula:
            "x = [x₁, x₂]",

        note:
            "x₁ = horizontal · x₂ = vertical (coordenadas normalizadas)."
    },

    {
        title: "Búsqueda de la neurona ganadora (BMU)",

        description:
            "Se calcula la distancia entre el dato de entrada y los pesos de cada neurona. La neurona que presenta la menor distancia es la ganadora o Best Matching Unit (BMU).",

        formula:
            "BMU = arg minᵢ ||x − wᵢ||",

        note:
            "Se utiliza la distancia euclidiana para comparar los vectores."
    },

    {
        title: "Identificación de la vecindad",

        description:
            "No se modifica solamente la neurona ganadora. También se consideran las neuronas cercanas dentro de la cuadrícula. Las más próximas reciben mayor influencia durante el aprendizaje.",

        formula:
            "hᵢ = exp(−dᵢ² / 2σ²)",

        note:
            "σ representa el radio de vecindad."
    },

    {
        title: "Actualización de los pesos",

        description:
            "La neurona ganadora y sus vecinas ajustan sus pesos acercándolos al dato de entrada. La ganadora recibe el mayor ajuste y las demás se modifican según su distancia dentro de la cuadrícula.",

        formula:
            "wᵢ(t+1) = wᵢ(t) + α · hᵢ · (x − wᵢ(t))",

        note:
            "α es la tasa de aprendizaje y hᵢ representa la influencia de la vecindad."
    },

    {
        title: "Repetición y organización",

        description:
            "El algoritmo repite el proceso con diferentes datos de entrada. Durante el entrenamiento, la tasa de aprendizaje y el radio de vecindad disminuyen, permitiendo que el mapa se ajuste progresivamente.",

        formula:
            "α(t) ↓     σ(t) ↓",

        note:
            "El resultado es un mapa que representa las relaciones de similitud entre los datos."
    }

];


// ========================================
// 2. OBTENER LOS ELEMENTOS HTML
// ========================================

// Referencias al menú, al texto del paso y a los controles de navegación.
const stepButtons = document.querySelectorAll(".step-button");

const stepTitle = document.getElementById("step-title");

const stepDescription =
    document.getElementById("step-description");

const stepFormula =
    document.getElementById("step-formula");

const stepNote =
    document.getElementById("step-note");

const stepIndicator =
    document.getElementById("step-indicator");

const previousButton =
    document.getElementById("previous-step");

const nextButton =
    document.getElementById("next-step");


// Paso que se encuentra seleccionado
let currentStep = 0;


// ========================================
// 3. MOSTRAR UN PASO
// ========================================

// Limita el índice al rango válido y refleja el paso elegido en la página.
function showStep(index) {

    currentStep = Math.max(
        0,
        Math.min(index, steps.length - 1)
    );

    const step = steps[currentStep];


    // Reemplaza el título, descripción, fórmula, nota e indicador del paso.
    stepTitle.textContent = step.title;

    stepDescription.textContent = step.description;

    stepFormula.textContent = step.formula;

    stepNote.textContent = step.note;

    stepIndicator.textContent =
        `PASO ${currentStep + 1} DE ${steps.length}`;


    // Mantiene resaltado en el menú únicamente el paso actual.
    stepButtons.forEach((button, i) => {

        button.classList.toggle(
            "active",
            i === currentStep
        );

    });


    // Desactiva "Anterior" al inicio y cambia el último botón a "Volver".
    previousButton.disabled = currentStep === 0;

    nextButton.textContent =
        currentStep === steps.length - 1
            ? "Volver al inicio ↺"
            : "Siguiente paso →";

}


// ========================================
// 4. EVENTOS DE LOS BOTONES
// ========================================

// Permite saltar directamente a cualquiera de las etapas desde el menú.
stepButtons.forEach(button => {

    button.addEventListener("click", () => {

        const index = Number(button.dataset.step);

        showStep(index);

    });

});


// Muestra el paso anterior al pulsar el control de retroceso.
previousButton.addEventListener("click", () => {

    showStep(currentStep - 1);

});


// Avanza una etapa o regresa al primer paso al llegar al final.
nextButton.addEventListener("click", () => {

    if (currentStep === steps.length - 1) {

        showStep(0);

    } else {

        showStep(currentStep + 1);

    }

});


// Presenta la primera etapa como estado inicial del panel.
showStep(0);
