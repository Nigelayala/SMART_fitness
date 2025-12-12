// ==========================================================
// registro.js: Lógica de Registro de Entrenamientos y LocalStorage
// (Cubre 10% Funcionalidad y 5% Base de Datos/Datos)
// ==========================================================

// Lista estática inicial de ejercicios comunes
const EJERCICIOS_BASE = [
    { id: 'pb', nombre: 'Press Banca', grupo: 'Pecho' },
    { id: 's', nombre: 'Sentadilla', grupo: 'Pierna' },
    { id: 'pm', nombre: 'Peso Muerto', grupo: 'Espalda' }
];

// Obtiene la lista completa de ejercicios (base + personalizados del usuario).
function obtenerTodosLosEjercicios() {
    const ejerciciosGuardados = JSON.parse(localStorage.getItem('ejerciciosPersonalizados')) || [];
    return [...EJERCICIOS_BASE, ...ejerciciosGuardados];
}

// Obtiene ejercicios guardados por el usuario
function obtenerEjerciciosPersonalizados() {
    return JSON.parse(localStorage.getItem('ejerciciosPersonalizados')) || [];
}

// Guarda un nuevo ejercicio si no existe (para el datalist)
function guardarNuevoEjercicio(nombreEjercicio) {
    const nombreNormalizado = nombreEjercicio.trim();
    const todosLosEjercicios = obtenerTodosLosEjercicios();

    const yaExiste = todosLosEjercicios.some(ej => ej.nombre.toLowerCase() === nombreNormalizado.toLowerCase());

    if (!yaExiste) {
        let ejerciciosPersonalizados = obtenerEjerciciosPersonalizados();
        const nuevoEjercicio = {
            id: 'user-' + Date.now(),
            nombre: nombreNormalizado,
            grupo: 'Personalizado'
        };
        ejerciciosPersonalizados.push(nuevoEjercicio);
        localStorage.setItem('ejerciciosPersonalizados', JSON.stringify(ejerciciosPersonalizados));
        inicializarDatalistEjercicios(); 
    }
}

// Función que llena el datalist del formulario de registro con ejercicios disponibles
function inicializarDatalistEjercicios() {
    const datalist = document.getElementById('lista-ejercicios');
    if (!datalist) return;
    
    const ejercicios = obtenerTodosLosEjercicios();
    datalist.innerHTML = '';
    
    ejercicios.forEach(ej => {
        const option = document.createElement('option');
        option.value = ej.nombre;
        datalist.appendChild(option);
    });
}

// Obtiene el historial de entrenamientos del Local Storage
function obtenerHistorial() {
    return JSON.parse(localStorage.getItem('historialEntrenos')) || [];
}

// Guarda un nuevo registro en el Local Storage
function guardarRegistro(registro) {
    const historial = obtenerHistorial();
    historial.push(registro);
    localStorage.setItem('historialEntrenos', JSON.stringify(historial));
    
    mostrarHistorial(); 
}

// Función principal para mostrar los registros en la tabla
function mostrarHistorial() {
    const tbody = document.getElementById('historial-cuerpo');
    const totalEntrenosSpan = document.getElementById('total-entrenos');
    const historial = obtenerHistorial();
    
    if (!tbody || !totalEntrenosSpan) return;

    tbody.innerHTML = ''; 
    totalEntrenosSpan.textContent = historial.length;

    if (historial.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-message">No tienes registros aún. ¡Empieza a entrenar!</td></tr>';
        return;
    }

    // El más reciente se muestra arriba
    historial.slice().reverse().forEach(registro => {
        const row = tbody.insertRow();
        
        row.insertCell().textContent = registro.fecha;
        row.insertCell().textContent = registro.ejercicio;
        row.insertCell().textContent = registro.peso;
        row.insertCell().textContent = registro.series;
        row.insertCell().textContent = registro.repeticiones;
    });
}


// Maneja el envío del Formulario de Registro de Entrenamientos.
function manejarRegistroEntreno(event) {
    event.preventDefault();
    
    const form = event.target;
    
    const registro = {
        fecha: form['fecha-entreno'].value,
        ejercicio: form.ejercicio.value.trim(),
        peso: parseFloat(form['peso-entreno'].value),
        series: parseInt(form['series-entreno'].value),
        repeticiones: parseInt(form['repeticiones-entreno'].value),
        timestamp: Date.now()
    };
    
    if (!registro.fecha || !registro.ejercicio || isNaN(registro.peso)) {
        alert("Por favor, rellena todos los campos.");
        return;
    }
    
    guardarRegistro(registro);
    guardarNuevoEjercicio(registro.ejercicio);

    form.reset();
    alert(`¡Sesión de ${registro.ejercicio} con ${registro.peso}kg guardada con éxito!`);
}


// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const formRegistro = document.getElementById('formulario-registro-entreno');
    if (formRegistro) {
        formRegistro.addEventListener('submit', manejarRegistroEntreno);
    }

    if (document.getElementById('lista-ejercicios')) {
        inicializarDatalistEjercicios();
    }
    if (document.getElementById('historial-tabla')) {
        mostrarHistorial();
    }
});