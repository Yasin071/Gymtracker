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
    selectedWeight: 5
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
    dumbbellWeightButtons: document.querySelectorAll('.dumbbell-weight-button'),
    
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
    
    // Initialize pickers
    updateSelectedRep(5);
    updateSelectedDumbbellWeight(5);
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
    
    // Weight shortcut buttons
    elements.dumbbellWeightButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            state.dumbbellWeight = parseFloat(btn.dataset.weight);
            updateDumbbellWeight();
        });
    });
    
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
        if (elements.screens.barbell.classList.contains('active')) {
            saveSetWithReps(state.selectedReps);
        } else {
            saveDumbbellSetWithReps(state.selectedReps);
        }
    });

    // Setup picker interaction
    setupPickerInteraction(elements.repPicker, (value) => {
        state.selectedReps = value;
    });
}

function showRepPicker() {
    elements.repPickerModal.style.display = 'flex';
    updateSelectedRep(state.selectedReps);
}

function updateSelectedRep(rep) {
    const repOptions = elements.repPicker.children;
    const selectedIndex = rep - 1;
    const optionHeight = 30;
    const centerOffset = 75;
    
    const pickerOffset = centerOffset - (selectedIndex * optionHeight);
    
    elements.repPicker.style.transition = 'transform 0.2s ease-out';
    elements.repPicker.style.transform = `translateY(${pickerOffset}px)`;
    
    // Highlight selected rep
    Array.from(repOptions).forEach((option, index) => {
        option.classList.toggle('selected', index === selectedIndex);
    });
}

// Dumbbell Weight Picker
function setupDumbbellWeightPicker() {
    // Create weight options (1kg to 50kg in 1kg increments)
    for (let i = 1; i <= 50; i++) {
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
        state.dumbbellWeight = state.selectedWeight;
        updateDumbbellWeight();
    });

    // Setup picker interaction
    setupPickerInteraction(elements.dumbbellWeightPicker, (value) => {
        state.selectedWeight = value;
    });
}

function showDumbbellWeightPicker() {
    elements.dumbbellPickerModal.style.display = 'flex';
    updateSelectedDumbbellWeight(state.dumbbellWeight);
}

function updateSelectedDumbbellWeight(weight) {
    const weightOptions = elements.dumbbellWeightPicker.children;
    const selectedIndex = weight - 1;
    const optionHeight = 30;
    const centerOffset = 75;
    
    const pickerOffset = centerOffset - (selectedIndex * optionHeight);
    
    elements.dumbbellWeightPicker.style.transition = 'transform 0.2s ease-out';
    elements.dumbbellWeightPicker.style.transform = `translateY(${pickerOffset}px)`;
    
    // Highlight selected weight
    Array.from(weightOptions).forEach((option, index) => {
        option.classList.toggle('selected', index === selectedIndex);
    });
}

// Common Picker Functionality - IMPROVED VERSION
function setupPickerInteraction(pickerElement, onSelectCallback) {
    let isDragging = false;
    let startY = 0;
    let currentY = 0;
    let pickerOffset = 75;
    const optionHeight = 30;
    const centerOffset = 75;
    const options = Array.from(pickerElement.children);
    let selectedIndex = 0;

    // Initialize picker position
    updatePickerPosition();

    // Touch/mouse events
    pickerElement.addEventListener('mousedown', handleStart);
    pickerElement.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);

    function handleStart(e) {
        isDragging = true;
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        currentY = startY;
        
        // Get current transform
        const transform = window.getComputedStyle(pickerElement).getPropertyValue('transform');
        if (transform && transform !== 'none') {
            const matrix = transform.match(/^matrix\((.+)\)$/);
            if (matrix) {
                pickerOffset = parseFloat(matrix[1].split(', ')[5]) || centerOffset;
                // Calculate selectedIndex based on current position
                selectedIndex = Math.round((centerOffset - pickerOffset) / optionHeight);
                selectedIndex = Math.max(0, Math.min(options.length - 1, selectedIndex));
            }
        }
        
        pickerElement.style.transition = 'none';
        e.preventDefault();
    }

    function handleMove(e) {
        if (!isDragging) return;
        
        const y = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = y - currentY;
        currentY = y;
        
        pickerOffset += deltaY;
        pickerElement.style.transform = `translateY(${pickerOffset}px)`;
        
        // Calculate which option is closest to center
        const containerRect = elements.pickerContainer.getBoundingClientRect();
        const centerY = containerRect.top + containerRect.height / 2;
        
        let closestIndex = selectedIndex;
        let minDistance = Infinity;
        
        options.forEach((option, index) => {
            const optionRect = option.getBoundingClientRect();
            const optionCenterY = optionRect.top + optionRect.height / 2;
            const distance = Math.abs(optionCenterY - centerY);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });
        
        // Update selection if we found a closer option
        if (closestIndex !== selectedIndex) {
            selectedIndex = closestIndex;
            highlightSelectedOption();
        }
        
        e.preventDefault();
    }

    function handleEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        // Calculate final selected index based on current position
        const containerRect = elements.pickerContainer.getBoundingClientRect();
        const centerY = containerRect.top + containerRect.height / 2;
        
        let finalSelectedIndex = 0;
        let minDistance = Infinity;
        
        options.forEach((option, index) => {
            const optionRect = option.getBoundingClientRect();
            const optionCenterY = optionRect.top + optionRect.height / 2;
            const distance = Math.abs(optionCenterY - centerY);
            
            if (distance < minDistance) {
                minDistance = distance;
                finalSelectedIndex = index;
            }
        });
        
        selectedIndex = finalSelectedIndex;
        highlightSelectedOption();
        
        // Update the selected value
        const selectedValue = parseFloat(options[selectedIndex].dataset.value);
        onSelectCallback(selectedValue);
        
        // Keep the picker at its current visual position
        // Only update the selection internally
        pickerElement.style.transition = 'transform 0.2s ease-out';
    }

    function updatePickerPosition() {
        pickerOffset = centerOffset - (selectedIndex * optionHeight);
        pickerElement.style.transition = 'transform 0.2s ease-out';
        pickerElement.style.transform = `translateY(${pickerOffset}px)`;
        highlightSelectedOption();
    }

    function highlightSelectedOption() {
        options.forEach((option, index) => {
            option.classList.toggle('selected', index === selectedIndex);
        });
    }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle iPhone home bar
document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
