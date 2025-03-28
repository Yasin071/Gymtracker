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
    pickerOffset: 75, // Start centered on 5 reps (75px offset)
    velocity: 0,
    lastTime: 0,
    animationFrame: null,
    currentRepPosition: 5 // Track current rep position
};

// [Previous DOM elements and init code remains exactly the same until the touch handlers]

// Updated Touch/Mouse Handlers
function handleTouchStart(e) {
    cancelAnimationFrame(state.animationFrame);
    state.isDragging = true;
    state.startY = e.touches ? e.touches[0].clientY : e.clientY;
    state.currentY = state.startY;
    state.lastTime = Date.now();
    state.velocity = 0;
    
    // Store current transform position
    const transform = elements.repPicker.style.transform;
    if (transform) {
        const match = transform.match(/translateY\(([-\d.]+)px\)/);
        if (match) state.pickerOffset = parseFloat(match[1]);
    }
    
    elements.repPicker.style.transition = 'none';
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!state.isDragging) return;
    
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const now = Date.now();
    const deltaTime = now - state.lastTime;
    
    if (deltaTime > 0) {
        const deltaY = y - state.currentY;
        state.velocity = deltaY / deltaTime * 800; // Movement speed
        state.lastTime = now;
    }
    
    state.pickerOffset += (y - state.currentY) * 0.6; // Sensitivity
    state.currentY = y;
    elements.repPicker.style.transform = `translateY(${state.pickerOffset}px)`;
    highlightClosestRep();
    e.preventDefault();
}

function handleTouchEnd() {
    if (!state.isDragging) return;
    state.isDragging = false;
    
    // Apply momentum only if significant velocity
    if (Math.abs(state.velocity) > 20) {
        const startOffset = state.pickerOffset;
        const momentumDistance = state.velocity * 0.15;
        const duration = 500;
        
        let startTime = null;
        
        function animateMomentum(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
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
    } else {
        snapToNearestRep();
    }
}

// [Rest of the code (highlightClosestRep, snapToNearestRep, etc.) remains exactly the same]

// Update the updateSelectedRep function to maintain position:
function updateSelectedRep(rep) {
    const repOptions = elements.repPicker.children;
    const selectedIndex = rep - 1;
    state.selectedReps = rep;
    state.currentRepPosition = rep;
    
    // Calculate new offset based on current position
    state.pickerOffset = 75 - (selectedIndex * 30);
    
    elements.repPicker.style.transition = 'transform 0.4s ease-out';
    elements.repPicker.style.transform = `translateY(${state.pickerOffset}px)`;
    
    // Highlight selected rep
    Array.from(repOptions).forEach((option, index) => {
        option.classList.toggle('selected', index === selectedIndex);
    });
}
