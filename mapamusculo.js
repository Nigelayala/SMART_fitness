let exerciseDB = {};

        async function loadExerciseDB() {
            try {
                const response = await fetch('exerciseDB.json');
                exerciseDB = await response.json();
                console.log('Base de datos cargada correctamente');
            } catch (error) {
                console.error('Error al cargar la base de datos:', error);
                alert('Error al cargar la base de datos de ejercicios. Asegúrate de que el archivo exerciseDB.json esté en la misma carpeta.');
            }
        }

        loadExerciseDB();

        function changeView(view) {
            const frontView = document.getElementById('frontView');
            const backView = document.getElementById('backView');
            const btnFront = document.getElementById('btnFront');
            const btnBack = document.getElementById('btnBack');

            if (view === 'front') {
                frontView.style.display = 'block';
                backView.style.display = 'none';
                btnFront.classList.add('active');
                btnBack.classList.remove('active');
            } else {
                frontView.style.display = 'none';
                backView.style.display = 'block';
                btnBack.classList.add('active');
                btnFront.classList.remove('active');
            }
        }

        function showExercises(muscle) {
            if (!exerciseDB[muscle]) {
                console.error('Músculo no encontrado:', muscle);
                return;
            }

            const modal = document.getElementById('exerciseModal');
            const modalTitle = document.getElementById('modalTitle');
            const exerciseList = document.getElementById('exerciseList');

            const muscleData = exerciseDB[muscle];
            modalTitle.textContent = muscleData.name;

            let html = '<div class="space-y-4">';
            muscleData.exercises.forEach(exercise => {
                html += `
                    <div class="bg-slate-700">
                        <h3>${exercise.name}</h3>
                        <div class="flex">
                            <span class="text-blue-300">Series: <span class="text-white">${exercise.sets}</span></span>
                            <span class="text-blue-300">Reps: <span class="text-white">${exercise.reps}</span></span>
                        </div>
                    </div>
                `;
            });
            html += '</div>';

            exerciseList.innerHTML = html;
            modal.classList.add('active');
        }

        function closeModal() {
            const modal = document.getElementById('exerciseModal');
            modal.classList.remove('active');
        }

        document.getElementById('exerciseModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });