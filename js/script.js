// App state
const state = {
    totalWeight: 20,
    currentExercise: "squat",
    sets: JSON.parse(localStorage.getItem('gym-sets')) || [],
    restTimer: null,
    restSeconds: 0,
    currentPlates: [],
    selectedReps: 5,
    isDragging: false,
    startY: 0,
    currentY: 0,
    pickerOffset: 75 // Default position for 5 reps
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
    timerDisplay: document.getElementById('rest-timer'),
    repPicker: document.getElementById('rep-picker'),
    repPickerModal: document.getElementById('rep-picker-modal'),
    cancelReps: document.getElementById('cancel-reps'),
    confirmReps: document.getElementById('confirm-reps'),
    pickerContainer: document.querySelector('.picker-container')
};

// Initialize the app
function init() {
    setupNavigation();
    setupBarbellFunctionality();
    setupRepPicker();
    updateTotalWeight();
    updateSetsLabel();
    startRestTimer();
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
        alert('Dumbbell tracker coming soon!');
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

// Rep Picker Functions
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
        saveSetWithReps(state.selectedReps);
    });
    
    // Touch events
    elements.pickerContainer.addEventListener('touchstart', handleTouchStart);
    elements.pickerContainer.addEventListener('touchmove', handleTouchMove);
    elements.pickerContainer.addEventListener('touchend', handleTouchEnd);
    
    // Mouse events for desktop
    elements.pickerContainer.addEventListener('mousedown', handleTouchStart);
    elements.pickerContainer.addEventListener('mousemove', handleTouchMove);
    elements.pickerContainer.addEventListener('mouseup', handleTouchEnd);
    elements.pickerContainer.addEventListener('mouseleave', handleTouchEnd);
}

function showRepPicker() {
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

// Touch handlers
function handleTouchStart(e) {
    state.isDragging = true;
    state.startY = e.touches ? e.touches[0].clientY : e.clientY;
    state.currentY = state.startY;
    elements.repPicker.style.transition = 'none';
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!state.isDragging) return;
    
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaY = y - state.currentY;
    state.currentY = y;
    
    // Move the picker
    state.pickerOffset += deltaY;
    elements.repPicker.style.transform = `translateY(${state.pickerOffset}px)`;
    
    // Highlight closest rep
    highlightClosestRep();
    e.preventDefault();
}

function handleTouchEnd() {
    if (!state.isDragging) return;
    state.isDragging = false;
    
    // Stay at current position
    const closestRep = getClosestRep();
    if (closestRep) {
        state.selectedReps = closestRep;
    }
}

function highlightClosestRep() {
    const closestRep = getClosestRep();
    if (closestRep) {
        const repOptions = elements.repPicker.children;
        const selectedIndex = closestRep - 1;
        
        Array.from(repOptions).forEach((option, index) => {
            option.classList.toggle('selected', index === selectedIndex);
        });
    }
}

function getClosestRep() {
    const repOptions = elements.repPicker.children;
    const containerRect = elements.pickerContainer.getBoundingClientRect();
    const centerY = containerRect.top + containerRect.height / 2;
    
    let closestRep = null;
    let minDistance = Infinity;
    
    Array.from(repOptions).forEach((option, index) => {
        const optionRect = option.getBoundingClientRect();
        const optionCenterY = optionRect.top + optionRect.height / 2;
        const distance = Math.abs(optionCenterY - centerY);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestRep = index + 1;
        }
    });
    
    return closestRep;
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

// Handle iPhone home bar
document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
