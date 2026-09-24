(function () {
  const route = [
    [38, 82], [44, 75], [50, 69], [56, 62],
    [62, 55], [68, 48], [74, 40], [81, 32]
  ];
  const boat = document.getElementById('demoBoat');
  const startButton = document.getElementById('startDemo');
  const pauseButton = document.getElementById('pauseDemo');
  const resetButton = document.getElementById('resetDemo');
  const soundButton = document.getElementById('soundToggle');
  const courseReadout = document.getElementById('courseReadout');
  const nearestReadout = document.getElementById('nearestReadout');
  const positionReadout = document.getElementById('positionReadout');
  const log = document.getElementById('demoLog');
  const toast = document.getElementById('demoToast');
  const markers = Array.from(document.querySelectorAll('.place-marker'));
  const savedItems = Array.from(document.querySelectorAll('.saved-item'));
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const anchorToggle = document.getElementById('anchorToggle');
  const anchorStatus = document.getElementById('anchorStatus');
  const anchorZone = document.getElementById('anchorZone');
  const radiusSlider = document.getElementById('radiusSlider');
  const radiusOutput = document.getElementById('radiusOutput');

  let progress = 0;
  let timer = null;
  let activeFilter = 'all';
  let anchorActive = true;
  let soundEnabled = false;
  const alerted = new Set();

  function speak(message) {
    if (!soundEnabled || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = .92;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }

  function addLog(message, isAlert) {
    const entry = document.createElement('div');
    entry.className = 'log-entry' + (isAlert ? ' alert' : '');
    entry.textContent = message;
    log.prepend(entry);
    while (log.children.length > 8) log.lastElementChild.remove();
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.demoToastTimer);
    window.demoToastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2800);
  }

  function routePosition(value) {
    const scaled = Math.min(value, .9999) * (route.length - 1);
    const index = Math.floor(scaled);
    const local = scaled - index;
    const current = route[index];
    const next = route[Math.min(index + 1, route.length - 1)];
    return {
      x: current[0] + (next[0] - current[0]) * local,
      y: current[1] + (next[1] - current[1]) * local,
      dx: next[0] - current[0],
      dy: next[1] - current[1]
    };
  }

  function updateBoat() {
    const pos = routePosition(progress);
    const bearing = (Math.atan2(pos.dx, -pos.dy) * 180 / Math.PI + 360) % 360;
    boat.style.left = pos.x + '%';
    boat.style.top = pos.y + '%';
    boat.style.transform = 'rotate(' + Math.round(bearing) + 'deg)';
    courseReadout.textContent = String(Math.round(bearing)).padStart(3, '0') + '°';
    positionReadout.textContent = Math.round(progress * 100) + '% ROUTE';

    let nearest = null;
    let nearestDistance = Infinity;
    markers.forEach(function (marker) {
      const dx = pos.x - Number(marker.dataset.x);
      const dy = pos.y - Number(marker.dataset.y);
      const distance = Math.hypot(dx, dy);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = marker;
      }
      if (marker.dataset.cat === 'hazard' && distance < 3.3 && !alerted.has(marker.dataset.name)) {
        alerted.add(marker.dataset.name);
        const hidden = activeFilter !== 'all' && activeFilter !== marker.dataset.cat;
        const message = 'SIMULATED ALERT: approaching ' + marker.dataset.name + (hidden ? ' (place is hidden by the current filter)' : '');
        addLog(message, true);
        showToast(message);
        speak('Warning. Approaching ' + marker.dataset.name + '.');
      }
    });
    nearestReadout.textContent = nearest ? Math.max(35, Math.round(nearestDistance * 70)) + ' m' : '—';
  }

  function tick() {
    progress += .004;
    if (progress >= 1) {
      progress = 1;
      updateBoat();
      pause();
      addLog('Route complete. Reset to run the demonstration again.', false);
      showToast('Simulated route complete');
      return;
    }
    updateBoat();
  }

  function start() {
    if (progress >= 1) reset();
    if (timer) return;
    timer = window.setInterval(tick, 120);
    startButton.textContent = 'Running';
    addLog('Simulated boat started at 8 knots.', false);
  }

  function pause() {
    if (timer) window.clearInterval(timer);
    timer = null;
    startButton.textContent = 'Start';
  }

  function reset() {
    pause();
    progress = 0;
    alerted.clear();
    updateBoat();
    addLog('Simulation reset. Alerts are ready again.', false);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.dataset.filter;
      filterButtons.forEach(function (item) { item.classList.toggle('active', item === button); });
      markers.forEach(function (marker) { marker.classList.toggle('filtered', activeFilter !== 'all' && marker.dataset.cat !== activeFilter); });
      savedItems.forEach(function (item) { item.classList.toggle('filtered', activeFilter !== 'all' && item.dataset.cat !== activeFilter); });
      addLog('Filter changed to ' + button.textContent + '. Proximity alerts remain enabled for hidden places.', false);
    });
  });

  markers.forEach(function (marker) {
    marker.addEventListener('click', function () {
      showToast(marker.dataset.name + ' · sample ' + marker.dataset.cat);
    });
  });

  anchorToggle.addEventListener('click', function () {
    anchorActive = !anchorActive;
    anchorToggle.classList.toggle('active', anchorActive);
    anchorToggle.textContent = anchorActive ? 'Active' : 'Off';
    anchorStatus.textContent = anchorActive ? 'Anchor Watch active' : 'Anchor Watch off';
    anchorZone.classList.toggle('off', !anchorActive);
    addLog('Anchor Watch ' + (anchorActive ? 'activated' : 'turned off') + '. Saved Places filters are unchanged.', false);
  });

  radiusSlider.addEventListener('input', function () {
    const metres = Number(radiusSlider.value);
    radiusOutput.textContent = metres + ' m';
    const size = Math.round(112 * metres / 120);
    anchorZone.style.width = size + 'px';
    anchorZone.style.height = size + 'px';
  });

  startButton.addEventListener('click', start);
  pauseButton.addEventListener('click', function () { pause(); addLog('Simulation paused.', false); });
  resetButton.addEventListener('click', reset);
  soundButton.addEventListener('click', function () {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      soundEnabled = false;
      soundButton.textContent = 'Unavailable';
      soundButton.setAttribute('aria-pressed', 'false');
      showToast('Spoken alerts are not supported by this browser.');
      addLog('Spoken alerts are unavailable in this browser.', false);
      return;
    }
    soundEnabled = !soundEnabled;
    soundButton.classList.toggle('sound-on', soundEnabled);
    soundButton.textContent = soundEnabled ? 'Sound on' : 'Sound off';
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    addLog('Spoken alerts turned ' + (soundEnabled ? 'on.' : 'off.'), false);
    if (!soundEnabled) window.speechSynthesis.cancel();
  });
  updateBoat();
})();
