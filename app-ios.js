// Limer Web App - iOS Compatible with Bluefy
const SERVICE_UUID = '653bb0e0-1d85-46b0-9742-3b408f4cb83f';
const CHAR_UUID    = '00c1acd4-f35b-4b5f-868d-36e5668d0929';

// App State
let selectedDevice = null;
let bluetoothDevice = null;
let gattServer = null;
let characteristic = null;
let isConnected = false;
let currentStatus = {
  isUnlocked: false,
  speed: 0,
  battery: 0,
  light: false
};

// Platform detection
const isIOS    = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isBluefy = /Bluefy/.test(navigator.userAgent);

// DOM screens
const screens = {
  notSupported: document.getElementById('notSupportedScreen'),
  deviceList:   document.getElementById('deviceListScreen'),
  control:      document.getElementById('controlScreen')
};

// DOM elements
const el = {
  scanBtn:            document.getElementById('scanBtn'),
  disconnectBtnX:     document.getElementById('disconnectBtnX'),
  deviceList:         document.getElementById('deviceList'),
  scanningIndicator:  document.getElementById('scanningIndicator'),
  noDevicesMessage:   document.getElementById('noDevicesMessage'),
  httpsWarning:       document.getElementById('httpsWarning'),
  iosInfo:            document.getElementById('iosInfo'),
  deviceName:         document.getElementById('deviceName'),
  connectBtn:         document.getElementById('connectBtn'),
  lockControl:        document.getElementById('lockControl'),
  lockBtn:            document.getElementById('lockBtn'),
  lockStatus:         document.getElementById('lockStatus'),
  secondaryControls:  document.getElementById('secondaryControls'),
  alarmBtn:           document.getElementById('alarmBtn'),
  lightBtn:           document.getElementById('lightBtn'),
  statusDisplay:      document.getElementById('statusDisplay'),
  batteryIcon:        document.getElementById('batteryIcon'),
  batteryValue:       document.getElementById('batteryValue'),
  rangeValue:         document.getElementById('rangeValue'),
  speedDisplay:       document.getElementById('speedDisplay'),
  speedValue:         document.getElementById('speedValue')
};

// ── Init ──────────────────────────────────────────────────────────────────────

function init() {
  if (!navigator.bluetooth) { showScreen('notSupported'); return; }
  if (isIOS || isBluefy) el.iosInfo.style.display = 'block';
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    el.httpsWarning.style.display = 'block';
  }
  setupListeners();
  showScreen('deviceList');
}

// ── Listeners ─────────────────────────────────────────────────────────────────

function setupListeners() {
  el.scanBtn.addEventListener('click', scanForDevices);
  el.disconnectBtnX.addEventListener('click', disconnectDevice);
  el.connectBtn.addEventListener('click', connectToDevice);
  el.lockBtn.addEventListener('click', toggleLock);
  el.alarmBtn.addEventListener('click', () => sendCommand('alarm'));
  el.lightBtn.addEventListener('click', toggleLight);
}

// ── Screen helpers ────────────────────────────────────────────────────────────

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  if (screens[name]) screens[name].classList.add('active');
}

function showControlScreen() {
  showScreen('control');
  el.deviceName.textContent = selectedDevice?.name || 'Scooter';
  el.connectBtn.classList.remove('hidden');
  el.connectBtn.disabled = false;
  el.connectBtn.innerHTML = '<span class="material-symbols-outlined">link</span> Connect';
  el.disconnectBtnX.classList.remove('visible');
  el.lockControl.style.display       = 'none';
  el.secondaryControls.style.display = 'none';
  el.statusDisplay.style.display     = 'none';
  el.speedDisplay.style.display      = 'none';
}

// ── Scan ──────────────────────────────────────────────────────────────────────

async function scanForDevices() {
  try {
    el.scanBtn.disabled = true;
    el.scanBtn.innerHTML = '<div class="loading"></div> Scanning...';
    el.scanningIndicator.classList.remove('hidden');
    el.noDevicesMessage.classList.add('hidden');
    el.deviceList.innerHTML = '';

    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [SERVICE_UUID] }],
      optionalServices: [SERVICE_UUID]
    });

    selectedDevice = device;
    addDeviceToList(device);
    showControlScreen();

  } catch (error) {
    console.error('Scan error:', error.name, error.message);
    if (error.name === 'NotFoundError') {
      el.noDevicesMessage.classList.remove('hidden');
    }
    // AbortError = user cancelled, don't show anything
  } finally {
    el.scanBtn.disabled = false;
    el.scanBtn.innerHTML = '<span class="material-symbols-outlined">search</span> Search for Scooters';
    el.scanningIndicator.classList.add('hidden');
  }
}

function addDeviceToList(device) {
  const li = document.createElement('li');
  li.className = 'device-item';
  li.innerHTML = `
    <span class="material-symbols-outlined device-icon">electric_scooter</span>
    <div class="device-info">
      <div class="device-name">${device.name || 'Unknown Scooter'}</div>
      <div class="device-details">ID: ${device.id}</div>
    </div>`;
  li.onclick = showControlScreen;
  el.deviceList.appendChild(li);
}

// ── Connect ───────────────────────────────────────────────────────────────────

async function connectToDevice() {
  if (!selectedDevice) return;

  try {
    el.connectBtn.disabled = true;
    el.connectBtn.innerHTML = '<div class="loading"></div> Connecting...';

    gattServer     = await selectedDevice.gatt.connect();
    const service  = await gattServer.getPrimaryService(SERVICE_UUID);
    characteristic = await service.getCharacteristic(CHAR_UUID);

    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', handleNotification);
    selectedDevice.addEventListener('gattserverdisconnected', onDisconnected);

    isConnected = true;

    el.connectBtn.classList.add('hidden');
    el.disconnectBtnX.classList.add('visible');
    el.lockControl.style.display       = 'block';
    el.secondaryControls.style.display = 'grid';
    el.statusDisplay.style.display     = 'grid';

  } catch (error) {
    console.error('Connection error:', error.name, error.message);
    isConnected = false;
    el.connectBtn.disabled = false;
    el.connectBtn.innerHTML = '<span class="material-symbols-outlined">link</span> Connect';
  }
}

// ── Disconnect ────────────────────────────────────────────────────────────────

async function disconnectDevice() {
  try {
    if (characteristic) {
      await characteristic.stopNotifications();
      characteristic.removeEventListener('characteristicvaluechanged', handleNotification);
    }
    if (gattServer) gattServer.disconnect();
  } catch (e) {
    console.error('Disconnect error:', e);
  } finally {
    resetConnection();
    showScreen('deviceList');
  }
}

function onDisconnected() {
  resetConnection();
  showScreen('deviceList');
}

function resetConnection() {
  isConnected    = false;
  characteristic = null;
  gattServer     = null;

  el.disconnectBtnX.classList.remove('visible');
  el.connectBtn.classList.remove('hidden');
  el.connectBtn.disabled = false;
  el.connectBtn.innerHTML = '<span class="material-symbols-outlined">link</span> Connect';
  el.lockControl.style.display       = 'none';
  el.secondaryControls.style.display = 'none';
  el.statusDisplay.style.display     = 'none';
  el.speedDisplay.style.display      = 'none';
}

// ── Notifications ─────────────────────────────────────────────────────────────

function handleNotification(event) {
  const v = event.target.value;
  if (v.byteLength < 5) return;

  const prevLight = currentStatus.light;

  currentStatus.isUnlocked = v.getUint8(0) === 1;
  currentStatus.speed      = v.getUint8(2);
  currentStatus.battery    = v.getUint8(3);
  const newLight           = v.getUint8(4) === 1;

  // Only update light status if it changed from notification
  // This prevents overwriting user's manual toggle
  if (newLight !== prevLight) {
    currentStatus.light = newLight;
  }

  updateUI();
}

// ── UI Update ─────────────────────────────────────────────────────────────────

function updateUI() {
  // Lock
  if (currentStatus.isUnlocked) {
    el.lockBtn.className = 'lock-button unlocked';
    el.lockBtn.innerHTML = '<span class="material-symbols-outlined">lock_open</span>';
    el.lockStatus.textContent = 'Unlocked';
    el.speedDisplay.style.display = 'block';
  } else {
    el.lockBtn.className = 'lock-button locked';
    el.lockBtn.innerHTML = '<span class="material-symbols-outlined">lock</span>';
    el.lockStatus.textContent = 'Locked';
    el.speedDisplay.style.display = 'none';
  }

  // Light - always update based on currentStatus
  if (currentStatus.light) {
    el.lightBtn.classList.add('active');
    el.lightBtn.innerHTML = '<span class="material-symbols-outlined">light_mode</span> Light ON';
  } else {
    el.lightBtn.classList.remove('active');
    el.lightBtn.innerHTML = '<span class="material-symbols-outlined">light_mode</span> Light OFF';
  }

  // Battery
  el.batteryValue.textContent = `${currentStatus.battery}%`;
  updateBatteryIcon(currentStatus.battery);
  el.rangeValue.textContent = `~${(currentStatus.battery / 2.5).toFixed(1)}`;

  // Speed
  el.speedValue.textContent = currentStatus.speed;
  el.speedValue.classList.remove('warning', 'danger');
  if      (currentStatus.speed > 25) el.speedValue.classList.add('danger');
  else if (currentStatus.speed > 20) el.speedValue.classList.add('warning');
}

function updateBatteryIcon(pct) {
  const icon = el.batteryIcon;
  icon.classList.remove('battery-low', 'battery-medium', 'battery-high');
  if      (pct < 10) { icon.textContent = 'battery_0_bar'; icon.classList.add('battery-low'); }
  else if (pct < 25) { icon.textContent = 'battery_2_bar'; icon.classList.add('battery-low'); }
  else if (pct < 50) { icon.textContent = 'battery_3_bar'; icon.classList.add('battery-medium'); }
  else if (pct < 75) { icon.textContent = 'battery_4_bar'; icon.classList.add('battery-medium'); }
  else if (pct < 90) { icon.textContent = 'battery_5_bar'; icon.classList.add('battery-high'); }
  else               { icon.textContent = 'battery_full';  icon.classList.add('battery-high'); }
}

// ── Commands ──────────────────────────────────────────────────────────────────

async function sendCommand(cmd) {
  if (!isConnected || !characteristic) return;
  try {
    const data = new TextEncoder().encode(cmd);
    if (characteristic.properties.writeWithoutResponse) {
      await characteristic.writeValueWithoutResponse(data);
    } else {
      await characteristic.writeValueWithResponse(data);
    }
  } catch (e) {
    console.error('Command error:', e);
  }
}

async function toggleLock() {
  el.lockBtn.disabled = true;
  await sendCommand(currentStatus.isUnlocked ? 'lock' : 'unlockforever');
  setTimeout(() => { el.lockBtn.disabled = false; }, 1000);
}

async function toggleLight() {
  // Toggle state immediately (optimistic update)
  currentStatus.light = !currentStatus.light;
  
  // Update UI immediately
  if (currentStatus.light) {
    el.lightBtn.classList.add('active');
    el.lightBtn.innerHTML = '<span class="material-symbols-outlined">light_mode</span> Light ON';
  } else {
    el.lightBtn.classList.remove('active');
    el.lightBtn.innerHTML = '<span class="material-symbols-outlined">light_mode</span> Light OFF';
  }
  
  // Send command
  await sendCommand(currentStatus.light ? 'lighton' : 'lightoff');
}

// ── PWA ───────────────────────────────────────────────────────────────────────

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// ── Boot ──────────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
