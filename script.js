// DOM Elements
const clockElement = document.getElementById('clock');
const toggleFormatBtn = document.getElementById('toggleFormat');
const toggleSecondsBtn = document.getElementById('toggleSeconds');
const alarmTimeInput = document.getElementById('alarmTime');
const setAlarmBtn = document.getElementById('setAlarm');
const stopAlarmBtn = document.getElementById('stopAlarm');
const alarmStatus = document.getElementById('alarmStatus');
const alarmSound = document.getElementById('alarmSound');

// Clock State
let is12HourFormat = true;
let showSeconds = true;
let alarmTime = null;
let alarmInterval = null;

// Format time based on current settings
function formatTime(hours, minutes, seconds) {
  let formattedTime;
  
  if (is12HourFormat) {
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    if (showSeconds) {
      formattedTime += `:${String(seconds).padStart(2, '0')}`;
    }
    formattedTime += ` ${period}`;
  } else {
    formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    if (showSeconds) {
      formattedTime += `:${String(seconds).padStart(2, '0')}`;
    }
  }
  
  return formattedTime;
}

// Update the clock display
function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  
  clockElement.textContent = formatTime(hours, minutes, seconds);
  
  // Check alarm
  checkAlarm(hours, minutes);
}

// Check if alarm should sound
function checkAlarm(currentHours, currentMinutes) {
  if (!alarmTime) return;
  
  const [alarmHours, alarmMinutes] = alarmTime.split(':').map(Number);
  
  if (currentHours === alarmHours && currentMinutes === alarmMinutes) {
    triggerAlarm();
  }
}

// Trigger the alarm
function triggerAlarm() {
  alarmSound.play();
  stopAlarmBtn.disabled = false;
  alarmStatus.textContent = 'Alarm ringing!';
  document.body.style.animation = 'alarmPulse 0.5s infinite alternate';
  
  // Stop alarm after 1 minute if not stopped manually
  setTimeout(() => {
    if (!stopAlarmBtn.disabled) {
      stopAlarm();
    }
  }, 60000);
}

// Stop the alarm
function stopAlarm() {
  alarmSound.pause();
  alarmSound.currentTime = 0;
  stopAlarmBtn.disabled = true;
  alarmStatus.textContent = 'Alarm stopped';
  document.body.style.animation = '';
  clearInterval(alarmInterval);
}

// Event Listeners
toggleFormatBtn.addEventListener('click', () => {
  is12HourFormat = !is12HourFormat;
  updateClock();
});

toggleSecondsBtn.addEventListener('click', () => {
  showSeconds = !showSeconds;
  updateClock();
});

setAlarmBtn.addEventListener('click', () => {
  if (!alarmTimeInput.value) {
    alarmStatus.textContent = 'Please set a valid time';
    return;
  }
  
  alarmTime = alarmTimeInput.value;
  const now = new Date();
  const [hours, minutes] = alarmTime.split(':').map(Number);
  
  // Calculate time until alarm
  let alarmDate = new Date();
  alarmDate.setHours(hours, minutes, 0, 0);
  
  // If alarm time is in the past, set it for tomorrow
  if (alarmDate < now) {
    alarmDate.setDate(alarmDate.getDate() + 1);
  }
  
  const timeUntilAlarm = alarmDate - now;
  
  alarmStatus.textContent = `Alarm set for ${formatTime(hours, minutes, 0)}`;
  
  // Clear any existing alarm interval
  clearInterval(alarmInterval);
  
  // Set new interval to check alarm
  alarmInterval = setInterval(() => {
    const now = new Date();
    if (now >= alarmDate) {
      triggerAlarm();
      clearInterval(alarmInterval);
    }
  }, 1000);
  
  // Update status with countdown
  const updateCountdown = () => {
    const now = new Date();
    const timeLeft = alarmDate - now;
    
    if (timeLeft <= 0) return;
    
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    alarmStatus.textContent = `Alarm set for ${formatTime(hours, minutes, 0)} (${hoursLeft}h ${minutesLeft}m ${secondsLeft}s)`;
    
    if (timeLeft > 0) {
      setTimeout(updateCountdown, 1000);
    }
  };
  
  updateCountdown();
});

stopAlarmBtn.addEventListener('click', stopAlarm);

// Initialize clock
setInterval(updateClock, 1000);
updateClock(); // Run immediately to avoid delay

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'f') {
    toggleFormatBtn.click();
  } else if (e.key === 's') {
    toggleSecondsBtn.click();
  }
});

// Add animation for alarm pulsing
const style = document.createElement('style');
style.textContent = `
  @keyframes alarmPulse {
    from { background-color: #2c3e50; }
    to { background-color: #e74c3c; }
  }
`;
document.head.appendChild(style);