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
    // ... (keep all your existing element declarations exactly the same)
    // Make sure all your element selectors are here
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
    
    updateSelectedRep(5);
    updateSelectedDumbbellWeight(5);
}

// Navigation and core functions remain exactly the same as before
// ...

// DUMBBELL WEIGHT PICKER - UPDATED VERSION (2.5kg increments with perfect selection)
function setupDumbbellWeightPicker() {
    elements.dumbbellWeightPicker.innerHTML = '';
    
    // Create 2.5kg increment options (2.5 to 50kg)
    for (let i = 2.5; i <= 50; i += 2.5) {
        const option = document.createElement('div');
        option.textContent = `${i}kg`;
        option.dataset.value = i;
        elements.dumbbellWeightPicker.appendChild(option);
    }

    elements.cancelDumbbell.addEventListener('click', () => {
        elements.dumbbellPickerModal.style.display = 'none';
    });
    
    elements.confirmDumbbell.addEventListener('click', () => {
        elements.dumbbellPickerModal.style.display = 'none';
        state.dumbbellWeight = state.selectedWeight;
        updateDumbbellWeight();
    });

    // Enhanced picker interaction
    setupPickerInteraction(elements.dumbbellWeightPicker, (value) => {
        state.selectedWeight = parseFloat(value);
    }, true);
}

function updateSelectedDumbbellWeight(weight) {
    const options = elements.dumbbellWeightPicker.children;
    const weights = Array.from(options).map(opt => parseFloat(opt.dataset.value));
    
    // Find exact match or nearest 2.5kg increment
    let selectedIndex = weights.indexOf(weight);
    if (selectedIndex === -1) {
        let minDiff = Infinity;
        weights.forEach((w, i) => {
            const diff = Math.abs(w - weight);
            if (diff < minDiff) {
                minDiff = diff;
                selectedIndex = i;
            }
        });
    }

    const optionHeight = 30;
    const centerOffset = 75;
    const pickerOffset = centerOffset - (selectedIndex * optionHeight);
    
    elements.dumbbellWeightPicker.style.transform = `translateY(${pickerOffset}px)`;
    
    // Highlight and store selection
    Array.from(options).forEach((opt, i) => {
        opt.classList.toggle('selected', i === selectedIndex);
    });
    state.selectedWeight = weights[selectedIndex];
}

// IMPROVED PICKER INTERACTION (works for both rep and weight pickers)
function setupPickerInteraction(pickerElement, onSelectCallback, isWeightPicker = false) {
    let isDragging = false;
    let startY = 0;
    let pickerOffset = 75;
    const optionHeight = 30;
    const centerOffset = 75;
    const options = Array.from(pickerElement.children);
    let selectedIndex = 0;

    // Touch/mouse events
    const handleStart = (e) => {
        isDragging = true;
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        pickerElement.style.transition = 'none';
        e.preventDefault();
    };

    const handleMove = (e) => {
        if (!isDragging) return;
        const y = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = y - startY;
        startY = y;
        
        pickerOffset += deltaY;
        pickerElement.style.transform = `translateY(${pickerOffset}px)`;
        updateSelection();
        e.preventDefault();
    };

    const handleEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        
        // For weight picker: snap to nearest option
        if (isWeightPicker) {
            const containerRect = elements.pickerContainer.getBoundingClientRect();
            const centerY = containerRect.top + containerRect.height / 2;
            
            let closestIndex = 0;
            let minDistance = Infinity;
            
            options.forEach((option, i) => {
                const rect = option.getBoundingClientRect();
                const distance = Math.abs(rect.top + rect.height/2 - centerY);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = i;
                }
            });
            
            selectedIndex = closestIndex;
            pickerOffset = centerOffset - (selectedIndex * optionHeight);
            pickerElement.style.transition = 'transform 0.2s ease-out';
            pickerElement.style.transform = `translateY(${pickerOffset}px)`;
        }
        
        highlightSelected();
        onSelectCallback(options[selectedIndex].dataset.value);
    };

    const updateSelection = () => {
        const containerRect = elements.pickerContainer.getBoundingClientRect();
        const centerY = containerRect.top + containerRect.height / 2;
        
        options.forEach((option, i) => {
            const rect = option.getBoundingClientRect();
            if (Math.abs(rect.top + rect.height/2 - centerY) < 15) {
                selectedIndex = i;
            }
        });
        highlightSelected();
    };

    const highlightSelected = () => {
        options.forEach((opt, i) => opt.classList.toggle('selected', i === selectedIndex));
    };

    // Event listeners
    pickerElement.addEventListener('mousedown', handleStart);
    pickerElement.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
}

// Keep all your other existing functions exactly the same
// ...

// Start the app
document.addEventListener('DOMContentLoaded', init);
