// ==========================================================
// motivacion.js: Lógica del botón de Motivación "Yeah Buddy!"
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Identificar el botón que activará el sonido
    const btnSound = document.getElementById('btn-yeah-buddy');
    
    // 2. Crear el objeto de audio (Asegúrate que el archivo 'yeah_buddy.mp3' exista en la raíz)
    // NOTA: Si necesitas reproducir dos sonidos (Lightweight y Yeah Buddy), puedes definir ambos aquí:
    const audioYeahBuddy = new Audio('yeahbuddy.mp3'); 
    // const audioLightweight = new Audio('lightweight.mp3'); // Opcional, si tienes otro archivo

    if (btnSound) {
        btnSound.addEventListener('click', () => {
            // Detener el audio si ya se está reproduciendo y reiniciar
            audioYeahBuddy.pause();
            audioYeahBuddy.currentTime = 0; 

            // 3. Reproducir el audio
            audioYeahBuddy.play()
                .then(() => {
                    console.log("Audio 'Yeah Buddy' reproducido.");
                    // Opcional: Si quieres encadenar el otro sonido:
                    // setTimeout(() => { audioLightweight.play(); }, 500); 
                })
                .catch(error => {
                    // Esto maneja el caso donde el navegador bloquea el audio si no fue iniciado por el usuario.
                    console.error("Error al reproducir audio:", error);
                    alert("¡Activación fallida! Revisa la Consola (F12) o asegúrate de haber interactuado con la página primero.");
                });
        });
    }
});