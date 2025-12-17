document.addEventListener('DOMContentLoaded', () => {
    const btnSound = document.getElementById('btn-yeah-buddy');
    
    const audioYeahBuddy = new Audio('yeahbuddy.mp3'); 

    if (btnSound) {
        btnSound.addEventListener('click', () => {
            audioYeahBuddy.pause();
            audioYeahBuddy.currentTime = 0; 
            audioYeahBuddy.play()
                .then(() => {
                    console.log("Audio 'Yeah Buddy' reproducido.");
                })
                .catch(error => {
                    console.error("Error al reproducir audio:", error);
                    alert("¡Activación fallida! Revisa la Consola (F12) o asegúrate de haber interactuado con la página primero.");
                });
        });
    }
});