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
    
    // Common state
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
    updateTotalWeight();
    updateSetsLabel();
    updateDumbbellWeight();
    updateDumbbellSetsLabel();
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

// Barbell functionality (keep all your existing barbell functions)
// [Previous barbell functions remain exactly the same]

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
    
    // Touch events
    elements.pickerContainer.addEventListener('touchstart', handleTouchStart);
    elements.pickerContainer.addEventListener('touchmove', handleTouchMove);
    elements.pickerContainer.addEventListener('touchend', handleTouchEnd);
}

function showDumbbellWeightPicker() {
    state.activePicker = 'dumbbell';
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

// Common Picker Functions
function showRepPicker() {
    state.activePicker = 'reps';
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

// [Keep all your existing touch handlers handleTouchStart, handleTouchMove, handleTouchEnd]

function getClosestValue() {
    const picker = state.activePicker === 'reps' ? elements.repPicker : elements.dumbbellWeightPicker;
    const options = picker.children;
    const containerRect = elements.pickerContainer.getBoundingClientRect();
    const centerY = containerRect.top + containerRect.height / 2;
    
    let closestValue = null;
    let minDistance = Infinity;
    
    Array.from(options).forEach((option, index) => {
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

// Update handleTouchEnd to handle both pickers
function handleTouchEnd() {
    if (!state.isDragging) return;
    state.isDragging = false;
    
    const closestValue = getClosestValue();
    if (closestValue) {
        if (state.activePicker === 'reps') {
            state.selectedReps = closestValue;
            updateSelectedRep(closestValue);
        } else {
            state.selectedWeight = closestValue;
            updateSelectedDumbbellWeight(closestValue);
        }
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

// Handle iPhone home bar
document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
