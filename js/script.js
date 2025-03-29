// App state
const state = {
    // Barbell state
    totalWeight: 20,
    currentExercise: "squat",
    sets: JSON.parse(localStorage.getItem('gym-sets')) || [],
    restTimer: null,
    restSeconds: 0,
    currentPlates: [],
    
    // Dumbbell state
    dumbbellWeight: 5,
    currentDumbbellExercise: "shoulder_press",
    dumbbellSets: JSON.parse(localStorage.getItem('gym-dumbbell-sets')) || [],
    dumbbellRestTimer: null,
    dumbbellRestSeconds: 0,
    
    // Picker state
    selectedReps: 5,
    isDragging: false,
    startY: 0,
    currentY: 0,
    pickerOffset: 75,
    activePicker: null // 'reps' or 'dumbbell'
};

// DOM elements
const elements = {
    screens: {
        home: document.getElementById('home-screen'),
        barbell: document.getElementById('barbell-screen'),
        dumbbell: document.getElementById('dumbbell-screen')
    },
    buttons: {
        home: document.querySelectorAll('.home-button'),
        barbell: document.getElementById('barbell-button'),
        dumbbell: document.getElementById('dumbbell-button')
    },
    
    // Barbell elements
    totalWeight: document.getElementById('total-weight-label'),
    setsLabel: document.getElementById('sets-label'),
    leftPlates: document.getElementById('left-plates'),
    rightPlates: document.getElementById('right-plates'),
    setButton: document.getElementById('set-button'),
    resetButton: document.getElementById('reset-weight-button'),
    deleteButton: document.getElementById('delete-last-button'),
    plateButtons: document.querySelectorAll('.plate-button'),
    exerciseSelect: document.getElementById('exercise-select'),
    timerDisplay: document.getElementById('rest-timer'),
    
    // Dumbbell elements
    dumbbellWeightLabel: document.getElementById('dumbbell-weight-label'),
    dumbbellSetsLabel: document.getElementById('dumbbell-sets-label'),
    leftDumbbell: document.getElementById('left-dumbbell'),
    rightDumbbell: document.getElementById('right-dumbbell'),
    dumbbellSetButton: document.getElementById('dumbbell-set-button'),
    dumbbellResetButton: document.getElementById('dumbbell-reset-button'),
    dumbbellDeleteButton: document.getElementById('dumbbell-delete-button'),
    dumbbellExerciseSelect: document.getElementById('dumbbell-exercise-select'),
    dumbbellTimerDisplay: document.getElementById('dumbbell-rest-timer'),
    
    // Pickers
    repPicker: document.getElementById('rep-picker'),
    repPickerModal: document.getElementById('rep-picker-modal'),
    cancelReps: document.getElementById('cancel-reps'),
    confirmReps: document.getElementById('confirm-reps'),
    
    dumbbellWeightPicker: document.getElementById('dumbbell-weight-picker'),
    dumbbellPickerModal: document.getElementById('dumbbell-picker-modal'),
    cancelDumbbell: document.getElementById('cancel-dumbbell'),
    confirmDumbbell: document.getElementById('confirm-dumbbell'),
    
    pickerContainer: document.querySelector('.picker-container')
};

// Initialize the app
function init() {
    setupNavigation();
    setupBarbellFunctionality();
    setupDumbbellFunctionality();
    setupRepPicker();
    setupDumbbellWeightPicker();
    
    // Initialize displays
    updateTotalWeight();
    updateSetsLabel();
    updateDumbbellWeight();
    updateDumbbellSetsLabel();
    
    // Start timers
    startRestTimer();
    startDumbbellRestTimer();
}

// Navigation setup
function setupNavigation() {
    // Home button
    elements.buttons.home.forEach(btn => {
        btn.addEventListener('click', () => showScreen('home'));
    });
    
    // Barbell button
    elements.buttons.barbell.addEventListener('click', () => {
        showScreen('barbell');
        resetWeight();
    });
    
    // Dumbbell button
    elements.buttons.dumbbell.addEventListener('click', () => {
        showScreen('dumbbell');
        resetDumbbellWeight();
    });
}

function showScreen(screenName) {
    Object.values(elements.screens).forEach(screen => {
        screen.classList.remove('active');
    });
    elements.screens[screenName].classList.add('active');
}

// Barbell functionality
function setupBarbellFunctionality() {
    // Plate buttons
    elements.plateButtons.forEach(btn => {
        btn.addEventListener('click', () => addPlate(parseFloat(btn.dataset.weight)));
    });
    
    // Control buttons
    elements.setButton.addEventListener('click', showRepPicker);
    elements.resetButton.addEventListener('click', resetWeight);
    elements.deleteButton.addEventListener('click', deleteLastSet);
    
    // Exercise selection
    elements.exerciseSelect.addEventListener('change', (e) => {
        if (state.currentExercise !== e.target.value) resetWeight();
        state.currentExercise = e.target.value;
        updateSetsLabel();
    });
}

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
    clearInterval(state.restTimer);
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

// Dumbbell functionality
function setupDumbbellFunctionality() {
    // Dumbbell click handlers
    elements.leftDumbbell.addEventListener('click', showDumbbellWeightPicker);
    elements.rightDumbbell.addEventListener('click', showDumbbellWeightPicker);
    
    // Control buttons
    elements.dumbbellSetButton.addEventListener('click', showRepPicker);
    elements.dumbbellResetButton.addEventListener('click', resetDumbbellWeight);
    elements.dumbbellDeleteButton.addEventListener('click', deleteLastDumbbellSet);
    
    // Exercise selection
    elements.dumbbellExerciseSelect.addEventListener('change', (e) => {
        if (state.currentDumbbellExercise !== e.target.value) resetDumbbellWeight();
        state.currentDumbbellExercise = e.target.value;
        updateDumbbellSetsLabel();
    });
}

function updateDumbbellWeight() {
    elements.dumbbellWeightLabel.textContent = `Weight: ${state.dumbbellWeight} kg (each)`;
    elements.leftDumbbell.textContent = `${state.dumbbellWeight}kg`;
    elements.rightDumbbell.textContent = `${state.dumbbellWeight}kg`;
}

function resetDumbbellWeight() {
    state.dumbbellWeight = 5;
    updateDumbbellWeight();
}

function saveDumbbellSetWithReps(reps) {
    state.dumbbellSets.push({
        exercise: state.currentDumbbellExercise,
        weight: state.dumbbellWeight,
        reps: reps,
        date: new Date().toISOString()
    });
    
    localStorage.setItem('gym-dumbbell-sets', JSON.stringify(state.dumbbellSets));
    updateDumbbellSetsLabel();
    resetDumbbellRestTimer();
}

function deleteLastDumbbellSet() {
    if (state.dumbbellSets.length > 0) {
        state.dumbbellSets.pop();
        localStorage.setItem('gym-dumbbell-sets', JSON.stringify(state.dumbbellSets));
        updateDumbbellSetsLabel();
    }
}

function updateDumbbellSetsLabel() {
    const exerciseSets = state.dumbbellSets
        .filter(set => set.exercise === state.currentDumbbellExercise)
        .slice(-3);
    
    elements.dumbbellSetsLabel.textContent = exerciseSets.length > 0
        ? `${state.currentDumbbellExercise.toUpperCase().replace('_', ' ')}:\n${exerciseSets.map(set => 
            `${set.weight}kg × ${set.reps}`).join('\n')}`
        : "No sets yet";
}

function startDumbbellRestTimer() {
    clearInterval(state.dumbbellRestTimer);
    state.dumbbellRestTimer = setInterval(() => {
        state.dumbbellRestSeconds++;
        const mins = Math.floor(state.dumbbellRestSeconds / 60);
        const secs = state.dumbbellRestSeconds % 60;
        elements.dumbbellTimerDisplay.textContent = `Rest: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }, 1000);
}

function resetDumbbellRestTimer() {
    state.dumbbellRestSeconds = 0;
    elements.dumbbellTimerDisplay.textContent = "Rest: 0:00";
}

// Rep Picker
function setupRepPicker() {
    // Create rep options (1-20)
    for (let i = 1; i <= 20; i++) {
        const repOption = document.createElement('div');
        repOption.textContent = i;
        repOption.dataset.value = i;
        elements.repPicker.appendChild(repOption);
    }
    
    // Picker controls
    elements.cancelReps.addEventListener('click', () => {
        elements.repPickerModal.style.display = 'none';
    });
    
    elements.confirmReps.addEventListener('click', () => {
        elements.repPickerModal.style.display = 'none';
        if (state.activePicker === 'barbell') {
            saveSetWithReps(state.selectedReps);
        } else {
            saveDumbbellSetWithReps(state.selectedReps);
        }
    });
}

function showRepPicker() {
    state.activePicker = elements.screens.barbell.classList.contains('active') ? 'barbell' : 'dumbbell';
    elements.repPickerModal.style.display = 'flex';
    updateSelectedRep(state.selectedReps);
}

function updateSelectedRep(rep) {
    const repOptions = elements.repPicker.children;
    const selectedIndex = rep - 1;
    state.pickerOffset = 75 - (selectedIndex * 30);
    state.selectedReps = rep;
    
    elements.repPicker.style.transition = 'transform 0.3s ease-out';
    elements.repPicker.style.transform = `translateY(${state.pickerOffset}px)`;
    
    // Highlight selected rep
    Array.from(repOptions).forEach((option, index) => {
        option.classList.toggle('selected', index === selectedIndex);
    });
}

// Dumbbell Weight Picker
function setupDumbbellWeightPicker() {
    // Create weight options (2.5kg to 50kg in 2.5kg increments)
    for (let i = 2.5; i <= 50; i += 2.5) {
        const weightOption = document.createElement('div');
        weightOption.textContent = `${i}kg`;
        weightOption.dataset.value = i;
        elements.dumbbellWeightPicker.appendChild(weightOption);
    }
    
    // Picker controls
    elements.cancelDumbbell.addEventListener('click', () => {
        elements.dumbbellPickerModal.style.display = 'none';
    });
    
    elements.confirmDumbbell.addEventListener('click', () => {
        elements.dumbbellPickerModal.style.display = 'none';
        state.dumbbellWeight = parseFloat(state.selectedWeight || state.dumbbellWeight);
        updateDumbbellWeight();
    });
}

function showDumbbellWeightPicker() {
    elements.dumbbellPickerModal.style.display = 'flex';
    updateSelectedDumbbellWeight(state.dumbbellWeight);
}

function updateSelectedDumbbellWeight(weight) {
    const weightOptions = elements.dumbbellWeightPicker.children;
    const selectedIndex = (weight / 2.5) - 1;
    state.pickerOffset = 75 - (selectedIndex * 30);
    state.selectedWeight = weight;
    
    elements.dumbbellWeightPicker.style.transition = 'transform 0.3s ease-out';
    elements.dumbbellWeightPicker.style.transform = `translateY(${state.pickerOffset}px)`;
    
    // Highlight selected weight
    Array.from(weightOptions).forEach((option, index) => {
        option.classList.toggle('selected', index === selectedIndex);
    });
}

// Common Picker Handlers
function handleTouchStart(e) {
    state.isDragging = true;
    state.startY = e.touches ? e.touches[0].clientY : e.clientY;
    state.currentY = state.startY;
    
    // Get current transform
    const picker = state.activePicker === 'dumbbell' ? elements.dumbbellWeightPicker : elements.repPicker;
    const transform = window.getComputedStyle(picker).getPropertyValue('transform');
    if (transform && transform !== 'none') {
        const matrix = transform.match(/^matrix\((.+)\)$/);
        if (matrix) {
            state.pickerOffset = parseFloat(matrix[1].split(', ')[5]) || 75;
        }
    }
    
    picker.style.transition = 'none';
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!state.isDragging) return;
    
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaY = y - state.currentY;
    state.currentY = y;
    
    // Move the picker
    const picker = state.activePicker === 'dumbbell' ? elements.dumbbellWeightPicker : elements.repPicker;
    state.pickerOffset += deltaY * 0.8;
    picker.style.transform = `translateY(${state.pickerOffset}px)`;
    
    // Highlight closest value
    highlightClosestValue();
    e.preventDefault();
}

function handleTouchEnd() {
    if (!state.isDragging) return;
    state.isDragging = false;
    
    // Snap to closest value
    const closestValue = getClosestValue();
    if (closestValue !== null) {
        if (state.activePicker === 'dumbbell') {
            state.selectedWeight = closestValue;
            updateSelectedDumbbellWeight(closestValue);
        } else {
            state.selectedReps = closestValue;
            updateSelectedRep(closestValue);
        }
    }
}

function highlightClosestValue() {
    const picker = state.activePicker === 'dumbbell' ? elements.dumbbellWeightPicker : elements.repPicker;
    const options = picker.children;
    const containerRect = elements.pickerContainer.getBoundingClientRect();
    const centerY = containerRect.top + containerRect.height / 2;
    
    Array.from(options).forEach(option => {
        const optionRect = option.getBoundingClientRect();
        const optionCenterY = optionRect.top + optionRect.height / 2;
        option.classList.toggle('selected', Math.abs(optionCenterY - centerY) < 15);
    });
}

function getClosestValue() {
    const picker = state.activePicker === 'dumbbell' ? elements.dumbbellWeightPicker : elements.repPicker;
    const options = picker.children;
    const containerRect = elements.pickerContainer.getBoundingClientRect();
    const centerY = containerRect.top + containerRect.height / 2;
    
    let closestValue = null;
    let minDistance = Infinity;
    
    Array.from(options).forEach(option => {
        const optionRect = option.getBoundingClientRect();
        const optionCenterY = optionRect.top + optionRect.height / 2;
        const distance = Math.abs(optionCenterY - centerY);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestValue = parseFloat(option.dataset.value);
        }
    });
    
    return closestValue;
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle iPhone home bar
document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
