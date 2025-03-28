// App state
const state = {
    totalWeight: 20,
    currentExercise: "squat",
    sets: JSON.parse(localStorage.getItem('gym-sets')) || [],
    restTimer: null,
    restSeconds: 0,
    currentPlates: []
};

// DOM elements
const elements = {
    screens: {
        home: document.getElementById('home-screen'),
        barbell: document.getElementById('barbell-screen')
    },
    buttons: {
        home: document.querySelectorAll('.home-button'),
        barbell: document.getElementById('barbell-button'),
        dumbbell: document.getElementById('dumbbell-button')
    },
    totalWeight: document.getElementById('total-weight-label'),
    setsLabel: document.getElementById('sets-label'),
    leftPlates: document.getElementById('left-plates'),
    rightPlates: document.getElementById('right-plates'),
    setButton: document.getElementById('set-button'),
    resetButton: document.getElementById('reset-weight-button'),
    deleteButton: document.getElementById('delete-last-button'),
    plateButtons: document.querySelectorAll('.plate-button'),
    exerciseSelect: document.getElementById('exercise-select'),
    timerDisplay: document.getElementById('rest-timer')
};

// Initialize
updateTotalWeight();
updateSetsLabel();
startRestTimer();

// Navigation functions
function showScreen(screenName) {
    Object.values(elements.screens).forEach(screen => {
        screen.classList.remove('active');
    });
    elements.screens[screenName].classList.add('active');
}

// Core functions
function addPlate(weight) {
    state.currentPlates.push(weight);
    renderPlates();
    state.totalWeight += weight * 2;
    updateTotalWeight();
}

function renderPlates() {
    elements.leftPlates.innerHTML = '';
    elements.rightPlates.innerHTML = '';
    
    state.currentPlates.forEach(weight => {
        const plate = document.createElement('div');
        plate.className = 'plate';
        plate.textContent = `${weight} kg`;
        plate.dataset.weight = weight;
        elements.leftPlates.appendChild(plate.cloneNode(true));
        elements.rightPlates.appendChild(plate);
    });
}

function resetWeight() {
    state.currentPlates = [];
    state.totalWeight = 20;
    renderPlates();
    updateTotalWeight();
}

// Add to DOM elements:
elements.repPicker = document.getElementById('rep-picker');
elements.repPickerModal = document.getElementById('rep-picker-modal');
elements.cancelReps = document.getElementById('cancel-reps');
elements.confirmReps = document.getElementById('confirm-reps');

// Replace saveSet() with:
function showRepPicker() {
  // Generate rep options (1-20)
  elements.repPicker.innerHTML = '';
  for (let i = 1; i <= 20; i++) {
    const repOption = document.createElement('div');
    repOption.textContent = i;
    repOption.dataset.value = i;
    elements.repPicker.appendChild(repOption);
  }
  
  // Center the picker on 5 reps by default
  elements.repPicker.style.transform = 'translateY(60px)';
  elements.repPicker.children[4].style.fontWeight = 'bold';
  elements.repPicker.children[4].style.color = '#4CAF50';
  
  elements.repPickerModal.style.display = 'flex';
  state.selectedReps = 5;
}

// Add these event listeners (put with other listeners):
elements.cancelReps.addEventListener('click', () => {
  elements.repPickerModal.style.display = 'none';
});

elements.confirmReps.addEventListener('click', () => {
  elements.repPickerModal.style.display = 'none';
  saveSetWithReps(state.selectedReps);
});

// Add touch events for picker
let startY;
elements.repPicker.addEventListener('touchstart', (e) => {
  startY = e.touches[0].clientY;
});

elements.repPicker.addEventListener('touchmove', (e) => {
  const y = e.touches[0].clientY;
  const deltaY = y - startY;
  elements.repPicker.style.transform = `translateY(${60 + deltaY * 0.3}px)`;
  highlightCenterRep();
});

elements.repPicker.addEventListener('touchend', () => {
  snapToNearestRep();
});

function highlightCenterRep() {
  const repOptions = elements.repPicker.children;
  const pickerRect = elements.repPicker.getBoundingClientRect();
  const centerY = pickerRect.top + pickerRect.height / 2;
  
  for (let i = 0; i < repOptions.length; i++) {
    const option = repOptions[i];
    const optionRect = option.getBoundingClientRect();
    const optionCenterY = optionRect.top + optionRect.height / 2;
    
    if (Math.abs(optionCenterY - centerY) < 15) {
      option.style.fontWeight = 'bold';
      option.style.color = '#4CAF50';
      state.selectedReps = parseInt(option.dataset.value);
    } else {
      option.style.fontWeight = 'normal';
      option.style.color = 'white';
    }
  }
}

function snapToNearestRep() {
  const repOptions = elements.repPicker.children;
  const pickerRect = elements.repPicker.getBoundingClientRect();
  const centerY = pickerRect.top + pickerRect.height / 2;
  
  let closestRep = null;
  let minDistance = Infinity;
  
  for (let i = 0; i < repOptions.length; i++) {
    const option = repOptions[i];
    const optionRect = option.getBoundingClientRect();
    const optionCenterY = optionRect.top + optionRect.height / 2;
    const distance = Math.abs(optionCenterY - centerY);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestRep = i;
    }
  }
  
  if (closestRep !== null) {
    const offset = 60 - (closestRep * 30);
    elements.repPicker.style.transform = `translateY(${offset}px)`;
    state.selectedReps = parseInt(repOptions[closestRep].dataset.value);
    highlightCenterRep();
  }
}

function saveSetWithReps(reps) {
  state.sets.push({
    exercise: state.currentExercise,
    weight: state.totalWeight,
    reps: reps,
    date: new Date().toISOString()
  });
  
  localStorage.setItem('gym-sets', JSON.stringify(state.sets));
  updateSetsLabel();
  resetRestTimer();
}

// Replace the original set button listener:
elements.setButton.addEventListener('click', showRepPicker);

function deleteLastSet() {
    if (state.sets.length > 0) {
        state.sets.pop();
        localStorage.setItem('gym-sets', JSON.stringify(state.sets));
        updateSetsLabel();
    }
}

function updateTotalWeight() {
    elements.totalWeight.textContent = `Total: ${state.totalWeight} kg`;
}

function updateSetsLabel() {
    const exerciseSets = state.sets
        .filter(set => set.exercise === state.currentExercise)
        .slice(-3);
    
    elements.setsLabel.textContent = exerciseSets.length > 0
        ? `${state.currentExercise.toUpperCase().replace('_', ' ')}:\n${exerciseSets.map(set => 
            `${set.weight}kg × ${set.reps}`).join('\n')}`
        : "No sets yet";
}

function startRestTimer() {
    state.restTimer = setInterval(() => {
        state.restSeconds++;
        const mins = Math.floor(state.restSeconds / 60);
        const secs = state.restSeconds % 60;
        elements.timerDisplay.textContent = `Rest: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }, 1000);
}

function resetRestTimer() {
    state.restSeconds = 0;
    elements.timerDisplay.textContent = "Rest: 0:00";
}

// Event listeners
elements.buttons.home.forEach(btn => {
    btn.addEventListener('click', () => showScreen('home'));
});

elements.buttons.barbell.addEventListener('click', () => showScreen('barbell'));
elements.buttons.dumbbell.addEventListener('click', () => alert('Dumbbell tracker coming soon!'));

elements.plateButtons.forEach(btn => {
    btn.addEventListener('click', () => addPlate(parseFloat(btn.dataset.weight)));
});

elements.setButton.addEventListener('click', saveSet);
elements.resetButton.addEventListener('click', resetWeight);
elements.deleteButton.addEventListener('click', deleteLastSet);

elements.exerciseSelect.addEventListener('change', (e) => {
    if (state.currentExercise !== e.target.value) resetWeight();
    state.currentExercise = e.target.value;
    updateSetsLabel();
});

// Handle iPhone home bar
document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
