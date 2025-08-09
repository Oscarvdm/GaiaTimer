# GaiaTimer

GaiaTimer is a web-based application (packaged as an Android APK using Apache Cordova) designed to manage turn and buffer times for board games, particularly those with multiple players and distinct phases. It provides a clear, interactive interface for tracking individual player timers, complete with visual cues and customizable settings.

## Todo
Github actions workflow for building into apk and creating new release in this repo. 

## Project Structure and File Descriptions

This section provides an overview of the key files and directories within the GaiaTimer project.

*   **`www/index.html`**
    *   **Purpose:** The main entry point and structural foundation of the GaiaTimer web application.
    *   **Structure and Content:** It defines the basic HTML layout, links to `style.css` for visual presentation, and includes `timer.js` and `main.js` for dynamic functionality. The page is organized into a header (displaying "GaiaTimer" and version), a main setup screen (for configuring turn and buffer times, and player details), a timer display screen (where active game timers are shown), and a footer. Player settings are dynamically added to the `#playerSettingsContainer` by `main.js`.

*   **`www/style.css`**
    *   **Purpose:** Provides all the visual styling for the GaiaTimer application, ensuring a consistent and responsive user interface.
    *   **Overall Styling Purpose:** Employs CSS variables for colors, spacing (using `vmin` for responsiveness), and border-radii, facilitating easy theme management. It styles global elements, header/footer, game settings (time and player configurations), and the dynamic timer display cards. It includes responsive grid layouts for timers and player settings, visual cues for timer states (selected, running, paused), and a background flash animation for out-of-turn warnings.

*   **`www/main.js`**
    *   **Purpose:** Contains the core application logic, managing UI interactions, game state, and orchestrating the `Timer` instances.
    *   **Classes, Methods, and Functions:**
        *   **Global Variables:**
            *   `planets`: Array of objects, defines planet types and their colors.
            *   `factions`: Array of objects, defines factions linked to planets.
            *   `timers`: Array, holds `Timer` objects.
            *   `roundTime`: Number, global turn time.
            *   `timeBuffer`: Number, global buffer time.
            *   `GAIA_TIMER_STORAGE_KEY`: String, key for `localStorage`.
            *   `sharedState`: Object, holds `roundTime`, `timeBuffer`, `draggedTimerIndex` shared with `Timer` class.
            *   `mainContext`: Object, passed to `Timer` instances, providing access to global data and functions.
        *   **`renderPlayerSettings()`:**
            *   **Purpose:** Dynamically generates and updates player configuration inputs (name, faction dropdown, delete button) on the main screen, and adds an "Add Player" button.
            *   **Parameters:** None.
        *   **`saveState()`:**
            *   **Purpose:** Persists the current application state (player data, timer values, global times) to `localStorage`.
            *   **Parameters:** None.
        *   **`loadState()`:**
            *   **Purpose:** Retrieves and restores the application state from `localStorage`, recreating `Timer` instances and updating UI elements. Initializes default state if no saved data is found.
            *   **Parameters:** None.
        *   **`initializeDefaultState()`:**
            *   **Purpose:** Sets up the initial application state with default values and two default `Timer` instances.
            *   **Parameters:** None.
        *   **`showMainScreen()`:**
            *   **Purpose:** Displays the game setup screen and hides the timer screen.
            *   **Parameters:** None.
        *   **`showTimerScreen()`:**
            *   **Purpose:** Displays the active game timer screen, hides the setup screen, and prepares timers for a new game round.
            *   **Parameters:** None.
        *   **`stopGame()`:**
            *   **Purpose:** Stops all active timers, resets their times, clears visual effects, saves the state, and returns to the main screen.
            *   **Parameters:** None.
        *   **Event Listeners:** Manages updates to `roundTime` and `timeBuffer` inputs, screen transitions (Start/Stop Game buttons), and drag-and-drop reordering of player timers.

*   **`www/timer.js`**
    *   **Purpose:** Defines the `Timer` class, which encapsulates the logic and visual representation for an individual player's countdown timer.
    *   **Classes, Methods, and Functions:**
        *   **Class: `Timer`**
            *   **Constructor:** `constructor(mainContext, addToGlobalTimers = true, displayMode = 'timer')`
                *   **Purpose:** Creates a new timer instance, setting up its player name, faction, HTML elements (card, avatar, clocks), and event listeners.
                *   **Parameters:**
                    *   `mainContext`: Object, provides access to global application state and functions (e.g., `timers` array, `factions`, `planets`, `saveState`, `sharedState`).
                    *   `addToGlobalTimers`: Boolean (optional, default: `true`), if `true`, adds the instance to the global `timers` array.
                    *   `displayMode`: String (optional, default: `'timer'`), controls the visual mode of the timer card (`'timer'` for active game, `'player'` for settings).
            *   **Methods:**
                *   `deleteMe()`:
                    *   **Purpose:** Removes the timer's HTML element from the DOM.
                    *   **Parameters:** None.
                *   `changeAvatar()`:
                    *   **Purpose:** Updates the player's avatar image and the card's background color based on the selected faction and its associated planet.
                    *   **Parameters:** None.
                *   `unselect()`:
                    *   **Purpose:** Resets the timer's state to 'unselected', removes active CSS classes, stops the countdown, resets round time, and saves the state.
                    *   **Parameters:** None.
                *   `select()`:
                    *   **Purpose:** Manages the timer's active state: pauses if running, resumes if paused, or unselects others and starts if unselected.
                    *   **Parameters:** None.
                *   `resetRoundTime()`:
                    *   **Purpose:** Resets the round time to the configured value, clears visual warnings, updates display, and saves state.
                    *   **Parameters:** None.
                *   `resetBufferTime()`:
                    *   **Purpose:** Resets the buffer time to the configured value, updates display, and saves state.
                    *   **Parameters:** None.
                *   `stop()`:
                    *   **Purpose:** Halts the timer's countdown interval.
                    *   **Parameters:** None.
                *   `update()`:
                    *   **Purpose:** Refreshes the displayed round and buffer times on the timer card.
                    *   **Parameters:** None.
                *   `start()`:
                    *   **Purpose:** Initiates the timer's countdown, updates its state to 'running', and handles the visual "out-of-turn" flash when round time expires.
                    *   **Parameters:** None.

*   **`www/assets/`**
    *   **Purpose:** This directory contains image assets used by the application, primarily for faction and planet avatars.
