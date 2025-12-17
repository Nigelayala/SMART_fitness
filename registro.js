// ==========================================================
// registro.js: Lógica de Sesiones Completas y Persistencia
// ==========================================================

const EJERCICIOS_BASE = [
    { id: 'pb', nombre: 'Press Banca', grupo: 'Pecho' },
    { id: 's', nombre: 'Sentadilla', grupo: 'Pierna' },
    { id: 'pm', nombre: 'Peso Muerto', grupo: 'Espalda' }
];

// Variable temporal para acumular ejercicios del día
let ejerciciosDeLaSesion = [];

// --- FUNCIONES DE UTILIDAD ---

function obtenerTodosLosEjercicios() {
    const ejerciciosGuardados = JSON.parse(localStorage.getItem('ejerciciosPersonalizados')) || [];
    return [...EJERCICIOS_BASE, ...ejerciciosGuardados];
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

function obtenerHistorialSesiones() {
    return JSON.parse(localStorage.getItem('historialSesiones')) || [];
}

// --- FUNCIONES DE INTERFAZ DINÁMICA ---

function createSerieRow() {
    return `
        <div class="form-group-inline serie-row">
            <div class="form-group">
                <input type="number" class="serie-peso" step="0.5" min="0" placeholder="Peso">
            </div>
            <div class="form-group">
                <input type="number" class="serie-reps" min="1" placeholder="Reps">
            </div>
            <div class="form-group" style="flex: 0 0 50px; text-align: right;">
                <button type="button" class="delete-serie-btn" onclick="this.closest('.serie-row').remove()">X</button>
            </div>
        </div>`;
}

function addSerieToForm() {
    const list = document.getElementById('series-list');
    list.insertAdjacentHTML('beforeend', createSerieRow());
}

// --- LÓGICA DE ACUMULACIÓN (AÑADIR AL DÍA) ---

function añadirEjercicioAListaTemporal() {
    const nombre = document.getElementById('ejercicio').value.trim();
    const seriesElements = document.querySelectorAll('#series-list .serie-row');

    if (!nombre || seriesElements.length === 0) {
        alert("Por favor, selecciona un ejercicio y añade al menos una serie.");
        return;
    }

    const seriesData = [];
    let isValid = true;

    seriesElements.forEach((row) => {
        const peso = parseFloat(row.querySelector('.serie-peso').value);
        const reps = parseInt(row.querySelector('.serie-reps').value);

        if (isNaN(peso) || isNaN(reps) || peso < 0 || reps < 1) {
            isValid = false;
            row.style.border = '1px solid red';
        } else {
            seriesData.push({ peso, reps });
        }
    });

    if (!isValid) {
        alert("Revisa los valores de las series.");
        return;
    }

    ejerciciosDeLaSesion.push({ nombre, series: seriesData });
    renderizarListaTemporal();

    document.getElementById('ejercicio').value = '';
    document.getElementById('series-list').innerHTML = '';
    addSerieToForm();
}

function renderizarListaTemporal() {
    const contenedor = document.getElementById('lista-ejercicios-sesion');
    contenedor.innerHTML = ejerciciosDeLaSesion.map((ej, index) => `
        <div class="ejercicio-agregado" style="background: #333; padding: 10px; margin-bottom: 5px; border-radius: 5px; display: flex; justify-content: space-between;">
            <span>💪 <strong>${ej.nombre}</strong> (${ej.series.length} series)</span>
            <button onclick="ejerciciosDeLaSesion.splice(${index}, 1); renderizarListaTemporal();" style="background:none; border:none; color:red; cursor:pointer;">Eliminar</button>
        </div>
    `).join('');
}

// --- GUARDADO FINAL (HISTORIAL) ---

function guardarSesionCompleta() {
    const fecha = document.getElementById('fecha-entreno').value;
    const nombreRutina = document.getElementById('nombre-rutina').value.trim() || "Sesión General";

    if (!fecha || ejerciciosDeLaSesion.length === 0) {
        alert("Debes poner la fecha y añadir al menos un ejercicio a la lista.");
        return;
    }

    const nuevaSesion = {
        id: Date.now(),
        fecha,
        rutina: nombreRutina,
        ejercicios: ejerciciosDeLaSesion
    };

    const historial = obtenerHistorialSesiones();
    historial.push(nuevaSesion);
    localStorage.setItem('historialSesiones', JSON.stringify(historial));

    ejerciciosDeLaSesion = [];
    document.getElementById('nombre-rutina').value = '';
    document.getElementById('lista-ejercicios-sesion').innerHTML = '';
    alert("¡Entrenamiento del día guardado con éxito!");
    mostrarHistorial();
}

// --- NUEVA FUNCIÓN: IR A DETALLES ---

window.verDetallesSesion = function(id) {
    localStorage.setItem('sesion_detalles_id', id);
    window.location.href = 'detalles-sesion.html';
};

// --- FUNCIÓN MOSTRAR HISTORIAL ACTUALIZADA ---

function mostrarHistorial() {
    const tbody = document.getElementById('historial-cuerpo');
    const totalSpan = document.getElementById('total-entrenos');
    const historial = obtenerHistorialSesiones();

    if (!tbody) return;
    tbody.innerHTML = '';
    totalSpan.textContent = historial.length;

    if (historial.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="empty-message">No hay sesiones registradas.</td></tr>`;
        return;
    }

    historial.slice().reverse().forEach(sesion => {
        const resumenEjercicios = sesion.ejercicios.map(ej => 
            `• ${ej.nombre} (${ej.series.length} ser)`
        ).join('<br>');

        const row = `
            <tr>
                <td><strong>${sesion.fecha}</strong><br><small style="color: #00ff80">${sesion.rutina}</small></td>
                <td>${resumenEjercicios}</td>
                <td style="text-align:center">
                    <button class="cta-button" style="padding:5px 10px; font-size:12px; margin-bottom:5px; background:#00ff80; color:black; border:none; border-radius:5px; cursor:pointer;" 
                        onclick="verDetallesSesion(${sesion.id})">👁️ Ver Pesos</button>
                    <button class="delete-btn" style="background:none; border:none; cursor:pointer; font-size:1.2em;" onclick="eliminarSesion(${sesion.id})">🗑️</button>
                </td>
            </tr>`;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

window.eliminarSesion = function(id) {
    if (!confirm("¿Eliminar toda esta sesión de entrenamiento?")) return;
    const nuevoHistorial = obtenerHistorialSesiones().filter(s => s.id !== id);
    localStorage.setItem('historialSesiones', JSON.stringify(nuevoHistorial));
    mostrarHistorial();
};

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    inicializarDatalistEjercicios();
    addSerieToForm();
    mostrarHistorial();

    document.getElementById('btn-add-serie').addEventListener('click', addSerieToForm);
    document.getElementById('btn-add-ejercicio-a-lista').addEventListener('click', añadirEjercicioAListaTemporal);
    document.getElementById('btn-guardar-sesion-final').addEventListener('click', guardarSesionCompleta);
    
    document.getElementById('formulario-registro-dinamico').addEventListener('submit', (e) => e.preventDefault());
});