(function () {
  // Two demo charts. Positions are percentages of the chart image (x across, y down).
  const REGIONS = {
    nz: {
      name: 'New Zealand',
      label: 'LINZ REFERENCE CHART · STATIC DEMO IMAGE',
      mapLabel: 'Simulated boat route over a static LINZ reference chart screenshot of the Motutapu and Rakino area, Hauraki Gulf',
      note: '<strong>Static LINZ reference chart screenshot.</strong><br>Crown copyright © LINZ · CC BY 4.0<br>Demonstration only—no live chart tiles or device location.',
      route: [[38, 82], [44, 75], [50, 69], [56, 62], [62, 55], [68, 48], [74, 40], [81, 32]],
      anchor: [54, 67],
      ratio: '1603 / 886',
      places: [
        { cat: 'waypoint', name: 'Motutapu channel waypoint', x: 50, y: 69, info: 'Waypoint · display only' },
        { cat: 'hazard', name: 'Rakino Channel hazard', x: 62, y: 55, info: 'Hazard · warning at 200 m' },
        { cat: 'fishing', name: 'Rakino fishing spot', x: 74, y: 40, info: 'Fishing spot · display only' },
        { cat: 'waypoint', name: 'Home waypoint', x: 44, y: 75, info: 'Waypoint · display only' }
      ]
    },
    us: {
      name: 'United States',
      label: 'NOAA REFERENCE CHART · STATIC DEMO IMAGE',
      mapLabel: 'Simulated boat route over a static NOAA reference chart screenshot of the San Diego Bay entrance',
      note: '<strong>Static NOAA reference chart screenshot.</strong><br>Chart data: NOAA Office of Coast Survey<br>Demonstration only—no live chart tiles or device location.',
      route: [[66.6, 92.5], [64.4, 85.5], [61.1, 74.1], [58.6, 64.4], [57.0, 54.7], [56.4, 45.6], [55.6, 36.5], [55.4, 27.9], [57.7, 20.5], [61.4, 14.8]],
      anchor: [71.6, 63.9],
      ratio: '1466 / 877',
      places: [
        { cat: 'waypoint', name: 'Channel entrance waypoint', x: 59.4, y: 69.6, info: 'Waypoint · display only' },
        { cat: 'hazard', name: 'Zuniga Jetty hazard', x: 58.8, y: 51.9, info: 'Hazard · warning at 200 m' },
        { cat: 'fishing', name: 'Point Loma kelp fishing spot', x: 47.0, y: 65.0, info: 'Fishing spot · display only' },
        { cat: 'waypoint', name: 'Shelter Island waypoint', x: 60.0, y: 16.5, info: 'Waypoint · display only' }
      ]
    }
  };
  let region = 'nz';
  let route = REGIONS.nz.route;
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
  let markers = [];
  let savedItems = [];
  const demoMap = document.getElementById('demoMap');
  const markerLayer = document.getElementById('markerLayer');
  const savedList = document.getElementById('savedList');
  const routeLine = document.getElementById('routeLine');
  const mapNote = document.getElementById('mapNote');
  const regionButtons = Array.from(document.querySelectorAll('[data-region]'));
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

  function escapeText(text) {
    const span = document.createElement('span');
    span.textContent = text;
    return span.innerHTML;
  }

  function setRegion(key, announce) {
    if (!REGIONS[key]) key = 'nz';
    const r = REGIONS[key];
    region = key;
    route = r.route;
    pause();
    progress = 0;
    alerted.clear();

    demoMap.classList.toggle('region-us', key === 'us');
    demoMap.style.aspectRatio = r.ratio;
    demoMap.dataset.label = r.label;
    demoMap.setAttribute('aria-label', r.mapLabel);
    mapNote.innerHTML = r.note;
    routeLine.setAttribute('points', r.route.map(function (p) { return p[0] + ',' + p[1]; }).join(' '));
    anchorZone.style.left = r.anchor[0] + '%';
    anchorZone.style.top = r.anchor[1] + '%';

    markerLayer.innerHTML = r.places.map(function (p) {
      const symbol = p.cat === 'hazard' ? '<span>!</span>' : (p.cat === 'fishing' ? 'F' : 'W');
      return '<button class="place-marker ' + p.cat + '" type="button" data-cat="' + p.cat + '" data-name="' + escapeText(p.name) + '" data-x="' + p.x + '" data-y="' + p.y + '" style="left:' + p.x + '%;top:' + p.y + '%" aria-label="' + escapeText(p.name) + '"><span class="symbol">' + symbol + '</span><span class="label">' + escapeText(p.name) + '</span></button>';
    }).join('');
    savedList.innerHTML = r.places.map(function (p) {
      return '<div class="saved-item" data-cat="' + p.cat + '"><span class="saved-dot"></span><div><strong>' + escapeText(p.name) + '</strong><small>' + escapeText(p.info) + '</small></div></div>';
    }).join('');
    markers = Array.from(markerLayer.querySelectorAll('.place-marker'));
    savedItems = Array.from(savedList.querySelectorAll('.saved-item'));
    markers.forEach(function (marker) {
      marker.classList.toggle('filtered', activeFilter !== 'all' && marker.dataset.cat !== activeFilter);
      marker.addEventListener('click', function () {
        showToast(marker.dataset.name + ' · sample ' + marker.dataset.cat);
      });
    });
    savedItems.forEach(function (item) { item.classList.toggle('filtered', activeFilter !== 'all' && item.dataset.cat !== activeFilter); });
    regionButtons.forEach(function (b) {
      const on = b.dataset.region === key;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    updateBoat();
    if (announce) addLog('Switched to the ' + r.name + ' chart. Press Start to run the route.', false);
  }

  regionButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      if (button.dataset.region === region) return;
      setRegion(button.dataset.region, true);
      try { history.replaceState(null, '', '?region=' + button.dataset.region); } catch (err) { /* ignore */ }
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
    const size = (11 * metres / 120).toFixed(2);
    anchorZone.style.width = size + '%';
    anchorZone.style.height = 'auto';
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
  (function () {
    let initial = 'nz';
    try {
      const q = new URLSearchParams(window.location.search).get('region');
      if (q === 'us' || q === 'nz') initial = q;
      else if (/^en-US$/i.test(navigator.language || '')) initial = 'us';
    } catch (err) { /* keep NZ */ }
    setRegion(initial, false);
  })();
})();
