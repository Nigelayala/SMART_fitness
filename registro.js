// ==========================================================
// registro.js: Lógica de Registro Dinámico de Series y Persistencia
// ==========================================================

// Lista estática inicial de ejercicios comunes
const EJERCICIOS_BASE = [
    { id: 'pb', nombre: 'Press Banca', grupo: 'Pecho' },
    { id: 's', nombre: 'Sentadilla', grupo: 'Pierna' },
    { id: 'pm', nombre: 'Peso Muerto', grupo: 'Espalda' }
];

// --- FUNCIONES DE UTILIDAD ---

function obtenerTodosLosEjercicios() {
    const ejerciciosGuardados = JSON.parse(localStorage.getItem('ejerciciosPersonalizados')) || [];
    return [...EJERCICIOS_BASE, ...ejerciciosGuardados];
}

function obtenerEjerciciosPersonalizados() {
    return JSON.parse(localStorage.getItem('ejerciciosPersonalizados')) || [];
}

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

function obtenerHistorial() {
    return JSON.parse(localStorage.getItem('historialEntrenos')) || [];
}

function guardarEjercicioCompleto(ejercicioRegistro) {
    let historial = obtenerHistorial();
    historial.push(ejercicioRegistro);
    localStorage.setItem('historialEntrenos', JSON.stringify(historial));
    
    mostrarHistorial(); 
}

// --- FUNCIONES DE INTERFAZ DINÁMICA ---

function createSerieRow() {
    return `
        <div class="form-group-inline serie-row">
            <div class="form-group">
                <input type="number" class="serie-peso" step="0.5" min="0" placeholder="Peso" value="">
            </div>
            <div class="form-group">
                <input type="number" class="serie-reps" min="1" placeholder="Reps" value="">
            </div>
            <div class="form-group" style="flex: 0 0 50px; text-align: right;">
                <button type="button" class="delete-serie-btn" onclick="this.closest('.serie-row').remove()">X</button>
            </div>
        </div>
    `;
}

function addSerieToForm() {
    const list = document.getElementById('series-list');
    list.insertAdjacentHTML('beforeend', createSerieRow());
}

// --- FUNCIÓN DE ELIMINACIÓN DE REGISTRO COMPLETO ---

window.eliminarRegistro = function(timestamp) {
    if (!confirm("¿Estás seguro de que quieres eliminar este ejercicio completo con todas sus series?")) {
        return;
    }

    let historial = obtenerHistorial();
    const nuevoHistorial = historial.filter(registro => registro.timestamp !== timestamp);
    
    localStorage.setItem('historialEntrenos', JSON.stringify(nuevoHistorial));
    mostrarHistorial(); 
}


// --- LÓGICA DE GUARDADO FINAL ---

function manejarGuardadoEjercicio(event) {
    event.preventDefault();
    
    const fecha = document.getElementById('fecha-entreno').value;
    const ejercicioNombre = document.getElementById('ejercicio').value.trim();
    const seriesElements = document.querySelectorAll('#series-list .serie-row');

    if (!fecha || !ejercicioNombre) {
        alert("Por favor, introduce la Fecha y el Ejercicio.");
        return;
    }
    if (seriesElements.length === 0) {
        alert("Debes añadir al menos una serie.");
        return;
    }

    const seriesData = [];
    let isValid = true;

    seriesElements.forEach((row, index) => {
        const pesoInput = row.querySelector('.serie-peso');
        const repsInput = row.querySelector('.serie-reps');
        
        const peso = parseFloat(pesoInput.value);
        const reps = parseInt(repsInput.value);

        if (isNaN(peso) || isNaN(reps) || peso < 0 || reps < 1) {
            isValid = false;
            row.style.border = '1px solid red'; 
        }

        seriesData.push({
            peso: peso,
            reps: reps,
            numeroSerie: index + 1
        });
    });

    if (!isValid) {
        alert("Por favor, revisa que todas las series tengan valores numéricos válidos (Peso >= 0, Reps >= 1).");
        return;
    }

    const registroEjercicio = {
        fecha: fecha,
        ejercicio: ejercicioNombre,
        series: seriesData,
        totalSeries: seriesData.length,
        timestamp: Date.now()
    };
    
    guardarEjercicioCompleto(registroEjercicio);
    guardarNuevoEjercicio(ejercicioNombre);

    document.getElementById('formulario-registro-dinamico').reset();
    document.getElementById('series-list').innerHTML = '';
    addSerieToForm(); 

    alert(`¡Ejercicio de ${ejercicioNombre} con ${seriesData.length} series guardado con éxito!`);
}


// --- FUNCIÓN PRINCIPAL DE RENDERIZADO DE TABLA (VERSIÓN ÚNICA Y ROBUSTA) ---

function mostrarHistorial() {
    const tbody = document.getElementById('historial-cuerpo');
    const totalEntrenosSpan = document.getElementById('total-entrenos');
    const historial = obtenerHistorial();
    
    if (!tbody || !totalEntrenosSpan) return;

    tbody.innerHTML = ''; 
    totalEntrenosSpan.textContent = historial.length;
    
    const COLSPAN_COUNT = 4;

    if (historial.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${COLSPAN_COUNT}" class="empty-message">No tienes registros aún. ¡Empieza a entrenar!</td></tr>`;
        return;
    }

    // Usamos reverse() para mostrar los más recientes arriba
    historial.slice().reverse().forEach(registro => {
        
        // **CORRECCIÓN CLAVE: Asegurar que 'registro.series' sea un array**
        const seriesArray = Array.isArray(registro.series) ? registro.series : [];
        
        // 1. Crear el resumen detallado de series
        const resumenSeries = seriesArray
            .map(s => `${s.peso}kg x ${s.reps}`)
            .join(' | ');
        
        // 2. Usar un template literal (más seguro)
        const rowHTML = `
            <tr>
                <td>${registro.fecha}</td>
                <td>${registro.ejercicio}</td>
                <td>${resumenSeries}</td>
                <td style="text-align: center;">
                    <button class="delete-btn" onclick="eliminarRegistro(${registro.timestamp})">🗑️</button>
                </td>
            </tr>
        `;
        
        tbody.insertAdjacentHTML('beforeend', rowHTML);
    });
}


// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Enlace del botón de añadir serie
    const btnAddSerie = document.getElementById('btn-add-serie');
    if (btnAddSerie) {
        btnAddSerie.addEventListener('click', addSerieToForm);
        // Añadir una serie inicial al cargar, si no hay ninguna
        if (document.querySelectorAll('#series-list .serie-row').length === 0) {
            addSerieToForm(); 
        }
    }
    
    // 2. Enlace del formulario (Usamos el botón de submit para el guardado final)
    const formRegistro = document.getElementById('formulario-registro-dinamico');
    if (formRegistro) {
        formRegistro.addEventListener('submit', manejarGuardadoEjercicio);
    }
    
    // 3. Inicializar datalist y la tabla 
    if (document.getElementById('lista-ejercicios')) {
        inicializarDatalistEjercicios();
    }
    
    // LLAMADA CLAVE: Esto carga los datos guardados en la tabla
    if (document.getElementById('historial-tabla')) {
        mostrarHistorial();
    }
});