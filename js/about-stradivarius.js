'use strict';

const STORE_TIME_ZONE = 'Asia/Almaty'; 
const REFRESH_MS = 60000;              
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


const OPENING_HOURS = [
  { dayIndex: 0, dayName: 'Sunday', openHour: 10, closeHour: 22 },
  { dayIndex: 1, dayName: 'Monday', openHour: 10, closeHour: 22 },
  { dayIndex: 2, dayName: 'Tuesday', openHour: 10, closeHour: 22 },
  { dayIndex: 3, dayName: 'Wednesday', openHour: 10, closeHour: 22 },
  { dayIndex: 4, dayName: 'Thursday', openHour: 10, closeHour: 22 },
  { dayIndex: 5, dayName: 'Friday', openHour: 10, closeHour: 22 },
  { dayIndex: 6, dayName: 'Saturday', openHour: 10, closeHour: 22 }
];


const tableEl = document.querySelector('table.table');
let statusEl = null;
let tableRows = [];


function getStoreNow(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: STORE_TIME_ZONE,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23'
  }).formatToParts(date);

  const lookup = {};
  for (const part of parts) {
    lookup[part.type] = part.value;
  }

  return {
    dayIndex: WEEKDAY_SHORT.indexOf(lookup.weekday),
    minutes: Number(lookup.hour) * 60 + Number(lookup.minute)
  };
}

function findHours(dayIndex) {
  return OPENING_HOURS.find((item) => item.dayIndex === dayIndex);
}

// 10 -> "10:00"
function formatHour(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

// 725 -> "12:05"
function formatMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}


function getStatus(now) {
  const today = findHours(now.dayIndex);
  const openMinutes = today.openHour * 60;
  const closeMinutes = today.closeHour * 60;
  const timeNote = `Store time: ${formatMinutes(now.minutes)}.`;

  if (now.minutes >= openMinutes && now.minutes < closeMinutes) {
    return { isOpen: true, text: `Open now: today until ${formatHour(today.closeHour)}. ${timeNote}` };
  }

  if (now.minutes < openMinutes) {
    return { isOpen: false, text: `Closed now: opens today at ${formatHour(today.openHour)}. ${timeNote}` };
  }

  const tomorrow = findHours((now.dayIndex + 1) % 7);
  return {
    isOpen: false,
    text: `Closed now: opens tomorrow (${tomorrow.dayName}) at ${formatHour(tomorrow.openHour)}. ${timeNote}`
  };
}


function getRowIndex(dayIndex) {
  const isWeekday = dayIndex >= 1 && dayIndex <= 5;
  return isWeekday ? 0 : 1;
}

function highlightToday(dayIndex) {
  const todayRow = getRowIndex(dayIndex);
  tableRows.forEach((row, index) => {
    row.classList.toggle('active-state', index === todayRow);
  });
}

function updateStatus() {
  const now = getStoreNow(new Date());
  const status = getStatus(now);

  statusEl.textContent = status.text;
  statusEl.classList.remove('alert-success-custom', 'alert-danger-custom');
  statusEl.classList.add(status.isOpen ? 'alert-success-custom' : 'alert-danger-custom');

  highlightToday(now.dayIndex);
}


function init() {
  const wrapper = tableEl === null ? null : tableEl.closest('.table-responsive');

  if (tableEl === null || wrapper === null) {
    return;
  }

  tableRows = Array.from(tableEl.querySelectorAll('tbody tr'));

  statusEl = document.createElement('p');
  statusEl.classList.add('fw-bold');
  statusEl.setAttribute('role', 'status');
  wrapper.before(statusEl);

  updateStatus();
  setInterval(updateStatus, REFRESH_MS);
}

init();