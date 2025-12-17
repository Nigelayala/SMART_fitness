function calcularTMB(peso, altura, edad, sexo) {
    let tmb = 0;
    if (sexo === 'hombre') {
        tmb = (10 * peso) + (6.25 * altura) - (5 * edad) + 5;
    } else if (sexo === 'mujer') {
        tmb = (10 * peso) + (6.25 * altura) - (5 * edad) - 161;
    }
    return tmb;
}

const NIVELES_ACTIVIDAD = {
    sedentario: 1.2,
    ligero: 1.375,
    moderado: 1.55,
    activo: 1.725,
    muy_activo: 1.9
};

function calcularTDEE(tmb, actividad) {
    const factor = NIVELES_ACTIVIDAD[actividad];
    if (factor) {
        return Math.round(tmb * factor);
    }
    return 0;
}

function calcularMacronutrientes(caloriasObjetivo, proteinaPct, carbPct, grasaPct) {
    const calProteina = caloriasObjetivo * proteinaPct;
    const calCarb = caloriasObjetivo * carbPct;
    const calGrasa = caloriasObjetivo * grasaPct;

    const gramosProteina = calProteina / 4;
    const gramosCarb = calCarb / 4;
    const gramosGrasa = calGrasa / 9;

    return {
        proteina: gramosProteina.toFixed(0),
        carb: gramosCarb.toFixed(0),
        grasa: gramosGrasa.toFixed(0),
        totalKcal: caloriasObjetivo
    };
}

function manejarCalculoTDEE(event) {
    event.preventDefault();

    const form = event.target;
    const peso = parseFloat(form.peso.value);
    const altura = parseFloat(form.altura.value);
    const edad = parseInt(form.edad.value);
    const sexo = form.sexo.value;
    const actividad = form.actividad.value;

    if (isNaN(peso) || isNaN(altura) || isNaN(edad) || !sexo || !actividad) {
        alert("Por favor, rellena todos los campos.");
        return;
    }

    const tmb = calcularTMB(peso, altura, edad, sexo);
    const tdee = calcularTDEE(tmb, actividad);
    const deficit = tdee - 500; 
    const superavit = tdee + 300; 

    const resultadosDiv = document.getElementById('resultado-tdee');
    
    resultadosDiv.innerHTML = `
        <h3>Tus Métricas de Energía</h3>
        <p><strong>Metabolismo Basal (TMB):</strong> ${tmb.toFixed(0)} kcal/día</p>
        <p><strong>Gasto Energético Total (TDEE):</strong> ${tdee} kcal/día</p>
        
        <h4 class="accent-text">Elige tu Objetivo:</h4>
        <div class="objetivo-selector">
            <button class="obj-btn" data-kcal="${tdee}" data-target="Mantenimiento">Mantenimiento (${tdee} kcal)</button>
            <button class="obj-btn" data-kcal="${deficit}" data-target="Definicion">Definición (${deficit} kcal)</button>
            <button class="obj-btn" data-kcal="${superavit}" data-target="Volumen">Volumen (${superavit} kcal)</button>
        </div>

        <div id="macros-resultado" class="macros-box">
            <p>Selecciona un objetivo para ver tu desglose de Macronutrientes.</p>
        </div>
    `;

    document.querySelectorAll('.obj-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const kcal = parseInt(e.target.dataset.kcal);
            const objetivo = e.target.dataset.target;
            
            let macros;
            if (objetivo === 'Definicion') {
                macros = calcularMacronutrientes(kcal, 0.40, 0.35, 0.25);
            } else if (objetivo === 'Volumen') {
                macros = calcularMacronutrientes(kcal, 0.30, 0.45, 0.25);
            } else {
                macros = calcularMacronutrientes(kcal, 0.30, 0.40, 0.30);
            }
            
            const macrosDiv = document.getElementById('macros-resultado');
            macrosDiv.innerHTML = `
                <h4>✅ Macros para ${objetivo} (${kcal} kcal):</h4>
                <div class="macros-grid">
                    <div><strong>Proteína:</strong> <span class="accent-text">${macros.proteina}g</span></div>
                    <div><strong>Carbohidratos:</strong> <span class="accent-text">${macros.carb}g</span></div>
                    <div><strong>Grasas:</strong> <span class="accent-text">${macros.grasa}g</span></div>
                </div>
                <p class="small-text" style="color:#777; margin-top:10px;">*Ratios basados en un reparto estándar.</p>
            `;

            document.querySelectorAll('.obj-btn').forEach(btn => btn.classList.remove('selected'));
            e.target.classList.add('selected');
        });
    });
    
    resultadosDiv.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
    const formTDEE = document.getElementById('formulario-tdee');
    if (formTDEE) {
        formTDEE.addEventListener('submit', manejarCalculoTDEE);
    }
});