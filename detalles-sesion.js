document.addEventListener('DOMContentLoaded', () => {
    const idBuscado = localStorage.getItem('sesion_detalles_id');
    const historial = JSON.parse(localStorage.getItem('historialSesiones')) || [];
    
    const sesion = historial.find(s => s.id == idBuscado);

    if (!sesion) {
        alert("No se ha encontrado la información de este entrenamiento.");
        window.location.href = 'registro.html';
        return;
    }

    document.getElementById('det-titulo').textContent = sesion.rutina;
    document.getElementById('det-fecha').textContent = `📅 ${sesion.fecha}`;
    document.getElementById('det-ejercicios-count').textContent = `💪 ${sesion.ejercicios.length} Ejercicios`;

    const contenedor = document.getElementById('lista-detalles-ejercicios');
    
    contenedor.innerHTML = sesion.ejercicios.map(ej => `
        <div class="exercise-card">
            <div class="exercise-card-header">
                <h3>${ej.nombre}</h3>
            </div>
            <div class="series-container">
                ${ej.series.map((s, i) => `
                    <div class="serie-box">
                        <span class="serie-number">SET ${i + 1}</span>
                        <span class="weight-value">${s.peso}<small>kg</small></span>
                        <span class="reps-value">${s.reps} <small>reps</small></span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
});