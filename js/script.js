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
    pickerOffset: 75, // Start at center position (for 5 reps)
    velocity: 0,
    lastTime: 0,
    animationFrame: null
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
    setupRepPicker();
    setupEventListeners();
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
    elements.repPicker.innerHTML = '';
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
    state.pickerOffset = 75 - (selectedIndex * 30); // 30px per item
    state.selectedReps = rep;
    
    elements.repPicker.style.transition = 'transform 0.4s ease-out';
    elements.repPicker.style.transform = `translateY(${state.pickerOffset}px)`;
    
    // Highlight selected rep
    Array.from(repOptions).forEach((option, index) => {
        option.classList.toggle('selected', index === selectedIndex);
    });
}

// Touch/Mouse Handlers
function handleTouchStart(e) {
    cancelAnimationFrame(state.animationFrame);
    state.isDragging = true;
    state.startY = e.touches ? e.touches[0].clientY : e.clientY;
    state.lastTime = Date.now();
    state.velocity = 0;
    elements.repPicker.style.transition = 'none';
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!state.isDragging) return;
    
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const now = Date.now();
    const deltaTime = now - state.lastTime;
    
    if (deltaTime > 0) {
        const deltaY = y - state.startY;
        state.velocity = deltaY / deltaTime * 800; // Slower movement
        state.lastTime = now;
        state.startY = y;
    }
    
    state.pickerOffset += (y - state.currentY) * 0.6; // Reduced sensitivity
    state.currentY = y;
    elements.repPicker.style.transform = `translateY(${state.pickerOffset}px)`;
    highlightClosestRep();
    e.preventDefault();
}

function handleTouchEnd() {
    if (!state.isDragging) return;
    state.isDragging = false;
    
    // Apply momentum
    const startOffset = state.pickerOffset;
    const momentumDistance = state.velocity * 0.15; // Reduced momentum
    const duration = 500; // Longer duration
    
    let startTime = null;
    
    function animateMomentum(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out function
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        state.pickerOffset = startOffset + momentumDistance * easeProgress;
        elements.repPicker.style.transform = `translateY(${state.pickerOffset}px)`;
        
        if (progress < 1) {
            state.animationFrame = requestAnimationFrame(animateMomentum);
            highlightClosestRep();
        } else {
            snapToNearestRep();
        }
    }
    
    state.animationFrame = requestAnimationFrame(animateMomentum);
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
    elements.pickerContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    elements.pickerContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
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
