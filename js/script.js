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
    pickerOffset: 0,
    velocity: 0,
    lastY: 0,
    lastTime: 0
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

// Initialize
function init() {
    showScreen('home');
    updateTotalWeight();
    updateSetsLabel();
    startRestTimer();
    setupEventListeners();
    setupRepPicker();
    requestAnimationFrame(animatePicker);
}

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
    updateSelectedRep(5);
}

function showRepPicker() {
    elements.repPickerModal.style.display = 'flex';
    updateSelectedRep(state.selectedReps);
}

function updateSelectedRep(rep) {
    const repOptions = elements.repPicker.children;
    const selectedIndex = rep - 1;
    const offset = 75 - (selectedIndex * 30);
    
    state.pickerOffset = offset;
    elements.repPicker.style.transition = 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)';
    elements.repPicker.style.transform = `translateY(${offset}px)`;
    state.selectedReps = rep;
    
    // Highlight selected rep
    Array.from(repOptions).forEach((option, index) => {
        option.classList.toggle('selected', index === selectedIndex);
    });
}

// Animation and touch handling
function handleTouchStart(e) {
    state.isDragging = true;
    state.startY = e.touches ? e.touches[0].clientY : e.clientY;
    state.lastY = state.startY;
    state.lastTime = Date.now();
    elements.repPicker.style.transition = 'none';
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!state.isDragging) return;
    
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const now = Date.now();
    const deltaTime = now - state.lastTime;
    
    if (deltaTime > 0) {
        const deltaY = y - state.lastY;
        state.velocity = deltaY / deltaTime * 1000; // pixels per second
        state.lastY = y;
        state.lastTime = now;
    }
    
    state.pickerOffset += (y - state.currentY) * 1.5;
    state.currentY = y;
    elements.repPicker.style.transform = `translateY(${state.pickerOffset}px)`;
    highlightClosestRep();
    e.preventDefault();
}

function handleTouchEnd() {
    if (!state.isDragging) return;
    state.isDragging = false;
    
    // Apply momentum
    const momentumDuration = 300;
    const startOffset = state.pickerOffset;
    const endOffset = startOffset + state.velocity * 0.3;
    
    let startTime = null;
    
    function momentumAnimation(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / momentumDuration, 1);
        
        state.pickerOffset = startOffset + (endOffset - startOffset) * Math.sin(percentage * Math.PI/2);
        elements.repPicker.style.transform = `translateY(${state.pickerOffset}px)`;
        
        if (progress < momentumDuration) {
            requestAnimationFrame(momentumAnimation);
        } else {
            snapToNearestRep();
        }
    }
    
    requestAnimationFrame(momentumAnimation);
}

function highlightClosestRep() {
    const repOptions = elements.repPicker.children;
    const containerRect = elements.pickerContainer.getBoundingClientRect();
    const centerY = containerRect.top + containerRect.height / 2;
    
    Array.from(repOptions).forEach(option => {
        const optionRect = option.getBoundingClientRect();
        const optionCenterY = optionRect.top + optionRect.height / 2;
        option.classList.toggle('selected', Math.abs(optionCenterY - centerY) < 15);
    });
}

function snapToNearestRep() {
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
    
    if (closestRep) {
        updateSelectedRep(closestRep);
    }
}

function animatePicker() {
    if (!state.isDragging && Math.abs(state.velocity) > 10) {
        state.pickerOffset += state.velocity * 0.03;
        state.velocity *= 0.95;
        elements.repPicker.style.transform = `translateY(${state.pickerOffset}px)`;
        highlightClosestRep();
        
        if (Math.abs(state.velocity) < 10) {
            snapToNearestRep();
        }
    }
    requestAnimationFrame(animatePicker);
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    elements.buttons.home.forEach(btn => {
        btn.addEventListener('click', () => showScreen('home'));
    });
    
    elements.buttons.barbell.addEventListener('click', () => showScreen('barbell'));
    elements.buttons.dumbbell.addEventListener('click', () => alert('Dumbbell tracker coming soon!'));
    
    // Barbell controls
    elements.plateButtons.forEach(btn => {
        btn.addEventListener('click', () => addPlate(parseFloat(btn.dataset.weight)));
    });
    
    elements.setButton.addEventListener('click', showRepPicker);
    elements.resetButton.addEventListener('click', resetWeight);
    elements.deleteButton.addEventListener('click', deleteLastSet);
    
    elements.exerciseSelect.addEventListener('change', (e) => {
        if (state.currentExercise !== e.target.value) resetWeight();
        state.currentExercise = e.target.value;
        updateSetsLabel();
    });
    
    // Rep picker
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

// Handle iPhone home bar
document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');

// Start the app
init();
