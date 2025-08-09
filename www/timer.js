class Timer {
  constructor(mainContext, addToGlobalTimers = true, displayMode = 'timer') {
    this.mainContext = mainContext; // Expected: { timers, factions, planets, timersDiv, saveState, sharedState: { roundTime, timeBuffer, draggedTimerIndex } }

    this.playerName = `Player ${this.mainContext.timers.length + 1}`;
    // Ensure factions is not empty before accessing its first element
    this.selectedFaction = this.mainContext.factions && this.mainContext.factions.length > 0 ? this.mainContext.factions[0].name : '';
    this.displayMode = displayMode;

    this.timerDiv = document.createElement('div');
    this.timerDiv.classList.add('game-card');
    this.timerDiv.classList.add('cursor-pointer');
    this.timerDiv.setAttribute('draggable', 'true');
    if (this.mainContext.timersDiv) {
        this.mainContext.timersDiv.appendChild(this.timerDiv);
    }

    if (this.displayMode === 'player') {
        this.timerDiv.classList.add('player-mode');
    }
    
    this.headDiv=document.createElement('div');
    this.headDiv.classList.add('headDiv');
    this.timerDiv.appendChild(this.headDiv);
    this.avatarDiv=document.createElement('img');
    this.avatarDiv.classList.add('avatarDiv');
    this.headDiv.appendChild(this.avatarDiv);
    this.playerDiv=document.createElement('div');
    this.playerDiv.classList.add('playerDiv');
    this.headDiv.appendChild(this.playerDiv);
    this.playerNameDiv=document.createElement('div');
    this.playerNameDiv.classList.add('playerNameDiv');
    this.playerDiv.appendChild(this.playerNameDiv);
    this.playerNameDiv.textContent = this.playerName;

    this.factionNameDiv = document.createElement('div');
    this.factionNameDiv.classList.add('factionNameDiv');
    this.playerDiv.appendChild(this.factionNameDiv);
    
    if (this.displayMode === 'timer') {
        this.clockDiv = document.createElement('div');
        this.clockDiv.classList.add('clockDiv');
        this.timerDiv.appendChild(this.clockDiv);
        this.roundClockDiv=document.createElement('div');
        this.roundClockDiv.classList.add('roundClock', 'clock', 'flex-center', 'text-centered');
        this.clockDiv.appendChild(this.roundClockDiv);
        this.bufferClockDiv=document.createElement('div');
        this.bufferClockDiv.classList.add('bufferClock', 'clock', 'flex-center', 'text-centered');
        this.clockDiv.appendChild(this.bufferClockDiv);
        
        this.remainingTimeBuffer = this.mainContext.sharedState.timeBuffer;
        this.remainingRoundTime = this.mainContext.sharedState.roundTime;
        if (this.roundClockDiv) this.roundClockDiv.textContent = this.remainingRoundTime;
        if (this.bufferClockDiv) this.bufferClockDiv.textContent = this.remainingTimeBuffer;
    } else {
        this.remainingTimeBuffer = 0;
        this.remainingRoundTime = 0;
    }

    this.timerDiv.addEventListener('click', (event) => {
      this.select();
    });

    this.changeAvatar();
    
    if (addToGlobalTimers) {
        this.mainContext.timers.push(this);
    }
    
    this.timerDiv.addEventListener('dragstart', (event) => {
        this.mainContext.sharedState.draggedTimerIndex = this.mainContext.timers.indexOf(this);
        event.dataTransfer.setData('text/plain', this.mainContext.sharedState.draggedTimerIndex.toString());
        event.dataTransfer.effectAllowed = 'move';
    });
    
    this.state='unselected';
  }

  deleteMe(){
      if (this.timerDiv) {
        this.timerDiv.remove();
      }
  }

  changeAvatar(){
      const selectedFactionName = this.selectedFaction;
      if (!selectedFactionName) {
          if (this.avatarDiv) this.avatarDiv.setAttribute('src', '');
          if (this.factionNameDiv) this.factionNameDiv.textContent = '';
          if (this.timerDiv) this.timerDiv.style.backgroundColor = '';
          return;
      }
      if (this.factionNameDiv) this.factionNameDiv.textContent = selectedFactionName;
      const pngPath = 'assets/' + selectedFactionName + '.png';
      const jpgPath = 'assets/' + selectedFactionName + '.jpg';

      if (this.avatarDiv) {
        this.avatarDiv.onerror = () => {
            if (this.avatarDiv) {
                this.avatarDiv.onerror = null;
                this.avatarDiv.setAttribute('src', jpgPath);
            }
        };
        this.avatarDiv.setAttribute('src', pngPath);
      }

      const selectedFactionData = this.mainContext.factions.find(f => f.name === selectedFactionName);
      if (selectedFactionData) {
          const planetData = this.mainContext.planets.find(p => p.name === selectedFactionData.planet);
          if (planetData && this.timerDiv) {
              this.timerDiv.style.backgroundColor = '#' + planetData.color;
          } else if (this.timerDiv) {
              this.timerDiv.style.backgroundColor = '';
          }
      } else if (this.timerDiv) {
          this.timerDiv.style.backgroundColor = '';
      }
  }

  unselect(){
      this.state='unselected';
      if (this.timerDiv) {
        this.timerDiv.classList.remove('selected', 'running', 'paused');
      }
      this.stop();
      this.resetRoundTime(); // This calls mainContext.saveState()
      // The original unselect method in main.js also had a saveState() call here.
      // Replicating that, though resetRoundTime already calls it.
      this.mainContext.saveState(); 
  }

  select(){
      if (this.state === 'running') {
          this.state = 'stopped';
          if (this.timerDiv) {
            this.timerDiv.classList.remove('running');
            this.timerDiv.classList.add('paused');
          }
          this.stop();
      } else if (this.state === 'stopped') {
          this.start(); 
      } else { // state === 'unselected'
          this.mainContext.timers.forEach((timerInstance) => {
              // Call unselect on other Timer instances
              // Each unselect() will call saveState via mainContext
              if (timerInstance !== this) { // Ensure we don't double-unselect or cause issues if logic changes
                timerInstance.unselect();
              }
          });
          // Explicitly unselect self *before* starting, to match original flow where the loop would hit self.
          // This ensures its visual state is reset before being selected.
          this.state = 'unselected'; // Reset state before selecting
          if (this.timerDiv) {
            this.timerDiv.classList.remove('selected', 'running', 'paused');
          }
          this.stop(); // Stop any existing interval
          this.resetRoundTime(); // Reset time, also calls saveState

          // Now select this timer
          if (this.timerDiv) {
            this.timerDiv.classList.add('selected');
          }
          this.start(); // This will set state to 'running' and add 'running' class
      }
      this.mainContext.saveState(); // Final saveState for the select action, as in original.
  }

  resetRoundTime(){
      this.remainingRoundTime = this.mainContext.sharedState.roundTime;
      if (document.body) { // Ensure body exists
        document.body.classList.remove('out-of-turn-flash-active');
      }
      this.update();
      this.mainContext.saveState();
  }

  resetBufferTime(){
      this.remainingTimeBuffer = this.mainContext.sharedState.timeBuffer;
      this.update();
      this.mainContext.saveState();
  }

  stop(){
      clearInterval(this.intervalId);
  }

  update(){
      if (this.displayMode === 'timer') {
          if (this.bufferClockDiv) this.bufferClockDiv.textContent = this.remainingTimeBuffer;
          if (this.roundClockDiv) this.roundClockDiv.textContent = this.remainingRoundTime;
      }
  }

  start() {
      if (this.displayMode !== 'timer') return;
  
      this.state='running';
      if (this.timerDiv) {
        this.timerDiv.classList.remove('paused');
        this.timerDiv.classList.add('running');
      }
      this.intervalId = setInterval(() => {
        if (this.remainingTimeBuffer === 0 && this.remainingRoundTime===0) {
          clearInterval(this.intervalId);
          return;
        }
        if (this.remainingRoundTime === 0) {
          if (document.body && !document.body.classList.contains('out-of-turn-flash-active')) {
            document.body.classList.add('background-flash', 'out-of-turn-flash-active');
            setTimeout(() => {
              if (document.body) document.body.classList.remove('background-flash');
            }, 500);
          }
          this.remainingTimeBuffer--;
        }
        else{
            this.remainingRoundTime--;
        }
        this.update();
      }, 1000);
  }
}