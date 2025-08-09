const inputForm = document.getElementById('input-form');
const timersDiv = document.getElementById('timers');

// Screen elements
const mainScreen = document.getElementById('main-screen');
const timerScreen = document.getElementById('timer-screen');
const startGameBtn = document.getElementById('startGameBtn');
const stopGameBtn = document.getElementById('stopGameBtn');

const planets = [
  {"name": "Desert", "color": "F7C81B"},
  {"name": "Ice", "color": "FCFDFF"},
  {"name": "Titanium", "color": "767676"},
  {"name": "Volcanic", "color": "F47838"},
  {"name": "Terra", "color": "1F68CA"},
  {"name": "Oxide", "color": "DD2B2B"},
  {"name": "Swamp", "color": "774D36"},
  {"name": "Proto", "color": "67BBC5"},
  {"name": "Asteroid", "color": "D082AF"}
]

const factions = [
  { name: 'Gleens', planet: 'Desert' },
  { name: 'Xenos', planet: 'Desert' },
  { name: 'Itars', planet: 'Ice' },
  { name: 'Nevlas', planet: 'Ice' },
  { name: 'Hadsch Hallas', planet: 'Oxide' },
  { name: 'Ivits', planet: 'Oxide' },
  { name: 'Ambas', planet: 'Swamp' },
  { name: 'Taklons', planet: 'Swamp' },
  { name: 'Lantids', planet: 'Terra' },
  { name: 'Terrans', planet: 'Terra' },
  { name: 'Bescods', planet: 'Titanium' },
  { name: 'Firaks', planet: 'Titanium' },
  { name: "Bal T'aks", planet: 'Volcanic' },
  { name: 'Geoden', planet: 'Volcanic' },
  { name: 'Moweyds', planet: 'Proto' },
  { name: 'Space Giants', planet: 'Proto' },
  { name: 'Tinkeroids', planet: 'Asteroid' },  
  { name: 'Darkanians', planet: 'Asteroid' }
];

var timers=[];
var roundTime;
var timeBuffer;
const GAIA_TIMER_STORAGE_KEY = 'gaiatimerState_v1'; // Added versioning for future schema changes
const playerSettingsContainer = document.getElementById('playerSettingsContainer');
// let draggedTimerIndex = null; // Moved to sharedState

// Define a shared state object for variables that Timer needs and might be modified by main.js
const sharedState = {
    roundTime: document.getElementById('roundTimeInput') ? document.getElementById('roundTimeInput').value : '180', // Default or from input
    timeBuffer: document.getElementById('bufferTimeInput') ? document.getElementById('bufferTimeInput').value : '60', // Default or from input
    draggedTimerIndex: null
};

// Define the context to be passed to the Timer class
const mainContext = {
    timers: timers, // The global timers array
    factions: factions,
    planets: planets,
    timersDiv: timersDiv,
    saveState: saveState,
    sharedState: sharedState
    // renderPlayerSettings is not directly called by Timer, so not included here.
};

function renderPlayerSettings() {
    if (!playerSettingsContainer) return; // Guard clause
    playerSettingsContainer.innerHTML = ''; // Clear existing settings

    timers.forEach((timer, index) => {
        const playerSettingDiv = document.createElement('div');
        playerSettingDiv.classList.add('player-setting-item'); // This class now incorporates game-card styling
        // playerSettingDiv.classList.add('border-common'); // Removed, styling handled by player-setting-item

        // Set background color based on faction's planet (applied to playerSettingDiv itself)
        const selectedFactionData = factions.find(f => f.name === timer.selectedFaction);
        if (selectedFactionData) {
            const planetData = planets.find(p => p.name === selectedFactionData.planet);
            if (planetData) {
                playerSettingDiv.style.backgroundColor = '#' + planetData.color;
            } else {
                playerSettingDiv.style.backgroundColor = ''; // Reset if planet color not found
            }
        } else {
            playerSettingDiv.style.backgroundColor = ''; // Reset if faction not found
        }

        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X'; // Or use an icon/image
        deleteBtn.classList.add('delete-player-btn');
        deleteBtn.classList.add('cursor-pointer');
        deleteBtn.addEventListener('click', () => {
            // Remove timer from timers array
            timers.splice(index, 1);
            // Remove timer element from the DOM (timer screen)
            timer.deleteMe();
            // Re-render player settings
            renderPlayerSettings();
            saveState();
        });
        playerSettingDiv.appendChild(deleteBtn); // Keep delete button at the top level of the card

        // Create game-card like structure
        const headDiv = document.createElement('div');
        headDiv.classList.add('headDiv');
        playerSettingDiv.appendChild(headDiv);

        const avatarImg = document.createElement('img');
        avatarImg.classList.add('avatarDiv'); // Use standard avatarDiv class
        const selectedFactionName = timer.selectedFaction;
        if (selectedFactionName) {
            const pngPath = 'assets/' + selectedFactionName + '.png';
            const jpgPath = 'assets/' + selectedFactionName + '.jpg';
            avatarImg.onerror = () => {
                avatarImg.onerror = null; // Prevent infinite loop
                avatarImg.src = jpgPath;
            };
            avatarImg.src = pngPath;
        } else {
            avatarImg.src = ''; // Clear if no faction
        }
        headDiv.appendChild(avatarImg);

        const playerInfoDiv = document.createElement('div'); // This is the 'playerDiv' from game-card
        playerInfoDiv.classList.add('playerDiv');
        headDiv.appendChild(playerInfoDiv);

        // Removed playerNameDisplay and factionNameDisplay
        // Removed inputsContainer

        // Player Name Input (directly in playerInfoDiv)
        const nameLabel = document.createElement('label');
        nameLabel.textContent = `Name: `;
        nameLabel.htmlFor = `playerNameInput-${index}`;
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = `playerNameInput-${index}`;
        nameInput.value = timer.playerName;
        // Add appropriate classes if needed for styling, e.g., 'playerNameDiv' if it makes sense
        // For now, relying on .player-setting-item input styles
        nameInput.addEventListener('change', (event) => {
            timer.playerName = event.target.value;
            // If the actual timer card has a playerNameDiv, update it
            if(timer.timerDiv && timer.timerDiv.querySelector('.playerNameDiv')) {
                 timer.timerDiv.querySelector('.playerNameDiv').textContent = timer.playerName;
            }
            // No separate playerNameDisplay in settings card to update anymore
            saveState();
        });
        playerInfoDiv.appendChild(nameLabel); // Label before input
        playerInfoDiv.appendChild(nameInput);


        // Player Faction Select (directly in playerInfoDiv)
        const factionLabel = document.createElement('label');
        factionLabel.textContent = `Faction: `;
        factionLabel.htmlFor = `playerFactionSelect-${index}`;
        const factionSelect = document.createElement('select');
        factionSelect.id = `playerFactionSelect-${index}`;
        // Add appropriate classes if needed, e.g., 'factionNameDiv'
        factions.forEach(faction => {
            const option = document.createElement('option');
            option.value = faction.name;
            option.textContent = faction.name;
            if (faction.name === timer.selectedFaction) {
                option.selected = true;
            }
            factionSelect.appendChild(option);
        });
        factionSelect.addEventListener('change', (event) => {
            timer.selectedFaction = event.target.value;
            // If the actual timer card exists and has changeAvatar method
            if(timer.timerDiv && typeof timer.changeAvatar === 'function') {
                timer.changeAvatar();
            }
            
            // Update avatar in this specific setting item directly
            const newSelectedFactionName = event.target.value;
            // No separate factionNameDisplay to update

            if (newSelectedFactionName) {
                const pngPath = 'assets/' + newSelectedFactionName + '.png';
                const jpgPath = 'assets/' + newSelectedFactionName + '.jpg';
                avatarImg.onerror = () => {
                    avatarImg.onerror = null;
                    avatarImg.src = jpgPath;
                };
                avatarImg.src = pngPath;
            } else {
                avatarImg.src = '';
            }
            
            // Update background color of this specific setting item (playerSettingDiv)
            const newSelectedFactionData = factions.find(f => f.name === event.target.value);
            if (newSelectedFactionData) {
                const planetData = planets.find(p => p.name === newSelectedFactionData.planet);
                if (planetData) {
                    playerSettingDiv.style.backgroundColor = '#' + planetData.color;
                } else {
                    playerSettingDiv.style.backgroundColor = '';
                }
            } else {
                playerSettingDiv.style.backgroundColor = '';
            }
            saveState();
        });
        playerInfoDiv.appendChild(factionLabel); // Label before select
        playerInfoDiv.appendChild(factionSelect);

        playerSettingsContainer.appendChild(playerSettingDiv);
    });

    // Add "Add Player" button at the end of the settings
    const addPlayerBtnSettings = document.createElement('button');
    addPlayerBtnSettings.textContent = '+'; // Plus sign for add
    addPlayerBtnSettings.classList.add('add-player-btn-settings', 'button', 'flex-center', 'text-centered', 'cursor-pointer'); // Add 'button' class for general styling
    addPlayerBtnSettings.addEventListener('click', () => {
        new Timer(mainContext); // Pass mainContext
        renderPlayerSettings(); // Re-render settings to include the new player
        // saveState(); // Timer constructor or subsequent actions should handle saving if needed via mainContext.saveState
    });
    playerSettingsContainer.appendChild(addPlayerBtnSettings);
}

function saveState() {
    try {
        const timersData = timers.map(timer => ({
            playerName: timer.playerName, // Use direct property
            selectedFaction: timer.selectedFaction, // Use direct property
            remainingRoundTime: timer.remainingRoundTime,
            remainingTimeBuffer: timer.remainingTimeBuffer,
            timerState: timer.state
        }));
        const appState = {
            timers: timersData,
            roundTime: roundTime,
            timeBuffer: timeBuffer
        };
        localStorage.setItem(GAIA_TIMER_STORAGE_KEY, JSON.stringify(appState));
    } catch (error) {
        console.error("Error saving state to localStorage:", error);
        // Optionally, inform the user that settings could not be saved.
    }
}

function loadState() {
    const savedStateJSON = localStorage.getItem(GAIA_TIMER_STORAGE_KEY);

    // Clear existing timers from DOM and array
    if (mainContext.timersDiv) { // Check if timersDiv exists and is part of context
        while(mainContext.timersDiv.firstChild) { mainContext.timersDiv.removeChild(mainContext.timersDiv.firstChild); }
    }
    mainContext.timers.length = 0; // Clear the timers array in the context

    if (savedStateJSON) {
        try {
            const appState = JSON.parse(savedStateJSON);

            // Update sharedState with loaded values, falling back to current input values if not in appState
            sharedState.roundTime = appState.roundTime || (document.getElementById('roundTimeInput') ? document.getElementById('roundTimeInput').value : '180');
            sharedState.timeBuffer = appState.timeBuffer || (document.getElementById('bufferTimeInput') ? document.getElementById('bufferTimeInput').value : '60');
            // Update global roundTime and timeBuffer for other parts of main.js that might still use them directly (legacy)
            roundTime = sharedState.roundTime;
            timeBuffer = sharedState.timeBuffer;


            if (document.getElementById('roundTimeInput')) {
                document.getElementById('roundTimeInput').value = sharedState.roundTime;
            }
            if (document.getElementById('bufferTimeInput')) {
                document.getElementById('bufferTimeInput').value = sharedState.timeBuffer;
            }

            let activeTimerToStart = null;

            appState.timers.forEach(timerData => {
                // Pass mainContext, false for addToGlobalTimers (it's added manually after setup), and 'timer' displayMode
                const newTimer = new Timer(mainContext, false, 'timer');
                
                newTimer.playerName = timerData.playerName;
                newTimer.selectedFaction = timerData.selectedFaction;
                if (newTimer.playerNameDiv) { // Ensure playerNameDiv exists
                    newTimer.playerNameDiv.textContent = newTimer.playerName;
                }
                
                newTimer.changeAvatar(); // Call after selectedFaction is set
                mainContext.timers.push(newTimer); // Add to timers array via context

                newTimer.remainingRoundTime = timerData.remainingRoundTime;
                newTimer.remainingTimeBuffer = timerData.remainingTimeBuffer;
                newTimer.state = timerData.timerState;
                newTimer.update();

                if (newTimer.timerDiv) { // Ensure timerDiv exists
                    newTimer.timerDiv.classList.remove('selected', 'running', 'paused');
                    if (newTimer.state === 'running') {
                        newTimer.timerDiv.classList.add('selected', 'running');
                        activeTimerToStart = newTimer;
                    } else if (newTimer.state === 'stopped') { // Assuming 'stopped' means paused
                        newTimer.timerDiv.classList.add('selected', 'paused');
                    }
                }
            });

            if (activeTimerToStart) {
                activeTimerToStart.start();
            }

            if (mainContext.timers.length === 0 && (!appState.timers || appState.timers.length === 0)) {
                new Timer(mainContext); // Pass mainContext
                new Timer(mainContext); // Pass mainContext
            }
            renderPlayerSettings(); // Render settings after loading
        } catch (error) {
            console.error("Error loading state from localStorage:", error);
            initializeDefaultState();
        }
    } else {
        initializeDefaultState();
    }
    if (!savedStateJSON) mainContext.saveState(); // Save if it was a fresh initialization
}

function initializeDefaultState() {
    // Initialize sharedState from input fields or defaults
    sharedState.roundTime = document.getElementById('roundTimeInput') ? document.getElementById('roundTimeInput').value : '180';
    sharedState.timeBuffer = document.getElementById('bufferTimeInput') ? document.getElementById('bufferTimeInput').value : '60';
    // Update global roundTime and timeBuffer for other parts of main.js (legacy)
    roundTime = sharedState.roundTime;
    timeBuffer = sharedState.timeBuffer;

    new Timer(mainContext); // Pass mainContext
    new Timer(mainContext); // Pass mainContext
    renderPlayerSettings(); // Render settings after default initialization
    // mainContext.saveState(); // saveState is called by renderPlayerSettings or Timer actions
}

// Event listener for immediate round time update
document.getElementById('roundTimeInput').addEventListener('input', function(event) {
    sharedState.roundTime = event.target.value;
    roundTime = sharedState.roundTime; // Keep global var in sync for now
    for(let t of mainContext.timers){ // Iterate over timers in context
        t.resetRoundTime(); // This will use sharedState.roundTime internally and call saveState
    }
    // saveState(); // resetRoundTime in Timer class now calls saveState via mainContext
});

// Event listener for immediate buffer time update
document.getElementById('bufferTimeInput').addEventListener('input', function(event) {
    sharedState.timeBuffer = event.target.value;
    timeBuffer = sharedState.timeBuffer; // Keep global var in sync for now
    for(let t of mainContext.timers){ // Iterate over timers in context
        t.resetBufferTime(); // This will use sharedState.timeBuffer internally and call saveState
    }
    // saveState(); // resetBufferTime in Timer class now calls saveState via mainContext
});

// Screen management functions
function showMainScreen() {
    mainScreen.style.display = 'block';
    timerScreen.style.display = 'none';
}

function showTimerScreen() {
    mainScreen.style.display = 'none';
    timerScreen.style.display = 'block';
    // Initialize and start timers
    // This assumes that loadState() or initializeDefaultState() has set up the timers array
    // and configured roundTime and timeBuffer from the input fields on the main screen.
    
    // Update sharedState (and legacy global vars) from inputs before starting
    sharedState.roundTime = document.getElementById('roundTimeInput') ? document.getElementById('roundTimeInput').value : sharedState.roundTime;
    sharedState.timeBuffer = document.getElementById('bufferTimeInput') ? document.getElementById('bufferTimeInput').value : sharedState.timeBuffer;
    roundTime = sharedState.roundTime;
    timeBuffer = sharedState.timeBuffer;


    if (mainContext.timers.length > 0) {
        // Reset timers to new round/buffer times (from sharedState) and prepare for start
        mainContext.timers.forEach(timer => {
            timer.remainingRoundTime = sharedState.roundTime;
            timer.remainingTimeBuffer = sharedState.timeBuffer;
            timer.state = 'unselected'; // Reset state
            timer.update();
            timer.timerDiv.classList.remove('selected', 'running', 'paused');
        });
        // Timers are now reset and unselected, no timer will start automatically.
    } else {
        // If no timers exist, potentially create default ones or prompt user
        // For now, let's assume timers are configured before starting.
        console.warn("No timers configured to start.");
    }
    mainContext.saveState(); // Save state after potentially modifying timer values
}

function stopGame() {
    // This function stops all timers, resets their round and buffer times
    // to the current global configured values, and preserves player names/factions.
    if (window.confirm("Are you sure you want to stop the game? This will reset all timers.")) {
        timers.forEach(timer => {
            timer.stop(); // Stops the interval
            timer.resetRoundTime(); // Resets time
            timer.resetBufferTime(); // Resets buffer
            timer.state = 'unselected';
            timer.timerDiv.classList.remove('selected', 'running', 'paused');
            timer.update();
        });
        document.body.classList.remove('out-of-turn-flash-active', 'background-flash'); // Clear any global visual states
        saveState(); // Save the reset state
        showMainScreen();
    }
}

// Event Listeners for screen transitions
startGameBtn.addEventListener('click', showTimerScreen);
stopGameBtn.addEventListener('click', stopGame);

// Drag and Drop for timersDiv
timersDiv.addEventListener('dragover', (event) => {
    event.preventDefault(); // Necessary to allow dropping
    event.dataTransfer.dropEffect = 'move';
});

timersDiv.addEventListener('drop', (event) => {
    event.preventDefault();
    if (sharedState.draggedTimerIndex === null) return;

    const targetTimerElement = event.target.closest('.game-card'); // Updated selector to match class in Timer
    let targetIndex = mainContext.timers.length -1; // Default to last position

    if (targetTimerElement) {
        const targetTimerInstance = mainContext.timers.find(t => t.timerDiv === targetTimerElement);
        if (targetTimerInstance) {
            targetIndex = mainContext.timers.indexOf(targetTimerInstance);
        }
    }
    
    // Move the dragged timer in the array
    const draggedTimer = mainContext.timers.splice(sharedState.draggedTimerIndex, 1)[0];
    mainContext.timers.splice(targetIndex, 0, draggedTimer);

    // Re-append timerDivs to timersDiv in the new order
    if (mainContext.timersDiv) { // Check if timersDiv exists
        mainContext.timersDiv.innerHTML = ''; // Clear existing timers
        mainContext.timers.forEach(timer => {
            if (timer.timerDiv) { // Check if timer.timerDiv exists
                 mainContext.timersDiv.appendChild(timer.timerDiv);
            }
        });
    }

    renderPlayerSettings(); // Update player settings order
    mainContext.saveState(); // Save the new order

    sharedState.draggedTimerIndex = null; // Reset dragged timer index in sharedState
});


// Initialize the application by loading state or setting defaults
loadState();
// Ensure main screen is shown initially
showMainScreen();
// Initial rendering of player settings if not already done by loadState
if (playerSettingsContainer && playerSettingsContainer.children.length <= 1) { // <=1 because of the h3 title
    renderPlayerSettings();
}