// Limer Web App - iOS Compatible with Bluefy
// Service and Characteristic UUIDs
const SERVICE_UUID = '653bb0e0-1d85-46b0-9742-3b408f4cb83f';
const CHAR_UUID = '00c1acd4-f35b-4b5f-868d-36e5668d0929';

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

// Detect platform
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isBluefy = /Bluefy/.test(navigator.userAgent);

// DOM Elements
const screens = {
  notSupported: document.getElementById('notSupportedScreen'),
  deviceList: document.getElementById('deviceListScreen'),
  control: document.getElementById('controlScreen')
};

const elements = {
  scanBtn: document.getElementById('scanBtn'),
  refreshBtn: document.getElementById('refreshBtn'),
  deviceList: document.getElementById('deviceList'),
  scanningIndicator: document.getElementById('scanningIndicator'),
  noDevicesMessage: document.getElementById('noDevicesMessage'),
  httpsWarning: document.getElementById('httpsWarning'),
  iosInfo: document.getElementById('iosInfo'),
  
  deviceName: document.getElementById('deviceName'),
  connectBtn: document.getElementById('connectBtn'),
  disconnectBtn: document.getElementById('disconnectBtn'),
  lockControl: document.getElementById('lockControl'),
  lockBtn: document.getElementById('lockBtn'),
  lockStatus: document.getElementById('lockStatus'),
  
  secondaryControls: document.getElementById('secondaryControls'),
  alarmBtn: document.getElementById('alarmBtn'),
  lightBtn: document.getElementById('lightBtn'),
  
  statusDisplay: document.getElementById('statusDisplay'),
  speedDisplay: document.getElementById('speedDisplay'),
  batteryIcon: document.getElementById('batteryIcon'),
  batteryValue: document.getElementById('batteryValue'),
  rangeValue: document.getElementById('rangeValue'),
  speedValue: document.getElementById('speedValue')
};

// Initialization
function init() {
  console.log('🚀 Limer Web App Initializing...');
  console.log('Platform:', isIOS ? 'iOS' : 'Other', isBluefy ? '(Bluefy)' : '');
  
  // Check Web Bluetooth support
  if (!navigator.bluetooth) {
    console.error('❌ Web Bluetooth not supported');
    showScreen('notSupported');
    return;
  }

  // Show iOS info if on iOS
  if (isIOS || isBluefy) {
    elements.iosInfo.style.display = 'block';
  }

  // Check HTTPS
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    elements.httpsWarning.style.display = 'block';
  }

  // Setup event listeners
  setupEventListeners();
  
  // Show device list screen
  showScreen('deviceList');
  console.log('✅ App initialized');
}

// Event Listeners
function setupEventListeners() {
  elements.scanBtn.addEventListener('click', scanForDevices);
  elements.refreshBtn.addEventListener('click', () => location.reload());
  elements.connectBtn.addEventListener('click', connectToDevice);
  elements.disconnectBtn.addEventListener('click', disconnectDevice);
  elements.lockBtn.addEventListener('click', toggleLock);
  elements.alarmBtn.addEventListener('click', () => sendCommand('alarm'));
  elements.lightBtn.addEventListener('click', toggleLight);
}

// Screen Management
function showScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenName]?.classList.add('active');
}

// Scan for Devices with iOS Pairing Support
async function scanForDevices() {
  console.log('🔍 Starting BLE scan...');
  
  try {
    elements.scanBtn.disabled = true;
    elements.scanBtn.innerHTML = '<div class="loading"></div> Keresés...';
    elements.scanningIndicator.classList.remove('hidden');
    elements.noDevicesMessage.classList.add('hidden');
    elements.deviceList.innerHTML = '';
    
    // CRITICAL FOR iOS: Request device will trigger iOS pairing dialog
    // This is the key step that makes iOS work!
    console.log('📱 Requesting device (iOS pairing dialog will appear)...');
    
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [SERVICE_UUID] }],
      optionalServices: [SERVICE_UUID]
    });
    
    console.log('✅ Device selected:', device.name);
    console.log('Device ID:', device.id);
    
    // On iOS/Bluefy, the pairing happens automatically during requestDevice
    if (isIOS || isBluefy) {
      console.log('✅ iOS pairing completed');
    }
    
    selectedDevice = device;
    
    // Show device in list
    addDeviceToList(device);
    
    // Automatically show control screen
    showControlScreen();
    
  } catch (error) {
    console.error('❌ Scan error:', error);
    
    if (error.name === 'NotFoundError') {
      elements.noDevicesMessage.classList.remove('hidden');
    } else if (error.name === 'SecurityError') {
      alert('iOS: Engedélyezd a Bluetooth hozzáférést a Beállításokban!');
    } else {
      alert(`Hiba a keresés során: ${error.message}`);
    }
  } finally {
    elements.scanBtn.disabled = false;
    elements.scanBtn.innerHTML = `
      <span class="material-symbols-outlined">search</span>
      Rollerek Keresése
    `;
    elements.scanningIndicator.classList.add('hidden');
  }
}

function addDeviceToList(device) {
  const li = document.createElement('li');
  li.className = 'device-item';
  li.innerHTML = `
    <span class="material-symbols-outlined device-icon">electric_scooter</span>
    <div class="device-info">
      <div class="device-name">${device.name || 'Névtelen Roller'}</div>
      <div class="device-details">ID: ${device.id}</div>
    </div>
  `;
  li.onclick = showControlScreen;
  elements.deviceList.appendChild(li);
}

function showControlScreen() {
  showScreen('control');
  elements.deviceName.textContent = selectedDevice?.name || 'Roller';
  elements.connectBtn.classList.remove('hidden');
  elements.disconnectBtn.classList.add('hidden');
}

// Connect to Device (iOS Compatible)
async function connectToDevice() {
  if (!selectedDevice) {
    alert('Nincs kiválasztott eszköz!');
    return;
  }

  console.log('🔗 Connecting to device...');
  
  try {
    elements.connectBtn.disabled = true;
    elements.connectBtn.innerHTML = '<div class="loading"></div> Csatlakozás...';
    
    // Connect to GATT server
    bluetoothDevice = selectedDevice;
    
    console.log('Connecting to GATT server...');
    gattServer = await bluetoothDevice.gatt.connect();
    console.log('✅ GATT server connected');
    
    // Get primary service
    console.log('Getting service:', SERVICE_UUID);
    const service = await gattServer.getPrimaryService(SERVICE_UUID);
    console.log('✅ Service found');
    
    // Get characteristic
    console.log('Getting characteristic:', CHAR_UUID);
    characteristic = await service.getCharacteristic(CHAR_UUID);
    console.log('✅ Characteristic found');
    console.log('Properties:', {
      read: characteristic.properties.read,
      write: characteristic.properties.write,
      writeWithoutResponse: characteristic.properties.writeWithoutResponse,
      notify: characteristic.properties.notify
    });
    
    // Start notifications
    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', handleNotification);
    console.log('✅ Notifications started');
    
    isConnected = true;
    
    // Update UI
    elements.connectBtn.classList.add('hidden');
    elements.disconnectBtn.classList.remove('hidden');
    elements.lockControl.style.display = 'block';
    elements.secondaryControls.style.display = 'grid';
    elements.statusDisplay.style.display = 'grid';
    
    console.log('✅ Connected successfully');
    
    // Setup disconnect handler
    bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
    
  } catch (error) {
    console.error('❌ Connection error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    let errorMsg = `Csatlakozási hiba: ${error.message}`;
    
    if (error.name === 'SecurityError') {
      errorMsg = 'iOS: Engedélyezd a Bluetooth párosítást amikor felugrik!';
    } else if (error.name === 'NetworkError') {
      errorMsg = 'Hálózati hiba. Próbáld újra vagy indítsd újra a rollert.';
    }
    
    alert(errorMsg);
    isConnected = false;
    
    elements.connectBtn.disabled = false;
    elements.connectBtn.innerHTML = `
      <span class="material-symbols-outlined">link</span>
      Csatlakozás
    `;
  }
}

// Disconnect Device
async function disconnectDevice() {
  console.log('🔌 Disconnecting...');
  
  try {
    if (characteristic) {
      await characteristic.stopNotifications();
      characteristic.removeEventListener('characteristicvaluechanged', handleNotification);
    }
    
    if (gattServer) {
      gattServer.disconnect();
    }
    
    resetConnection();
    console.log('✅ Disconnected');
    
  } catch (error) {
    console.error('❌ Disconnect error:', error);
    resetConnection();
  }
}

function onDisconnected(event) {
  console.log('⚠️ Device disconnected unexpectedly');
  resetConnection();
  alert('Az eszköz váratlanul lecsatlakozott!');
}

function resetConnection() {
  isConnected = false;
  characteristic = null;
  gattServer = null;
  
  elements.connectBtn.classList.remove('hidden');
  elements.connectBtn.disabled = false;
  elements.connectBtn.innerHTML = `
    <span class="material-symbols-outlined">link</span>
    Csatlakozás
  `;
  elements.disconnectBtn.classList.add('hidden');
  elements.lockControl.style.display = 'none';
  elements.secondaryControls.style.display = 'none';
  elements.statusDisplay.style.display = 'none';
  elements.speedDisplay.style.display = 'none';
}

// Handle Notifications (Status Updates)
function handleNotification(event) {
  const value = event.target.value;
  
  // Parse 5-byte status packet
  // Byte 0: Lock status (0=locked, 1=unlocked)
  // Byte 1: Reserved
  // Byte 2: Speed (km/h)
  // Byte 3: Battery (0-100%)
  // Byte 4: Light status (0=off, 1=on)
  
  if (value.byteLength >= 5) {
    currentStatus.isUnlocked = value.getUint8(0) === 1;
    currentStatus.speed = value.getUint8(2);
    currentStatus.battery = value.getUint8(3);
    currentStatus.light = value.getUint8(4) === 1;
    
    console.log('📊 Status update:', currentStatus);
    
    // Update UI
    updateUI();
  }
}

// Update UI with Current Status
function updateUI() {
  // Lock button
  if (currentStatus.isUnlocked) {
    elements.lockBtn.className = 'lock-button unlocked';
    elements.lockBtn.innerHTML = '<span class="material-symbols-outlined">lock_open</span>';
    elements.lockStatus.textContent = 'Feloldva';
    elements.speedDisplay.style.display = 'block';
  } else {
    elements.lockBtn.className = 'lock-button locked';
    elements.lockBtn.innerHTML = '<span class="material-symbols-outlined">lock</span>';
    elements.lockStatus.textContent = 'Zárva';
    elements.speedDisplay.style.display = 'none';
  }
  
  // Light button
  if (currentStatus.light) {
    elements.lightBtn.classList.add('active');
    elements.lightBtn.innerHTML = `
      <span class="material-symbols-outlined">light_mode</span>
      Lámpa (Be)
    `;
  } else {
    elements.lightBtn.classList.remove('active');
    elements.lightBtn.innerHTML = `
      <span class="material-symbols-outlined">light_mode</span>
      Lámpa
    `;
  }
  
  // Battery
  elements.batteryValue.textContent = `${currentStatus.battery}%`;
  updateBatteryIcon(currentStatus.battery);
  
  // Range estimate
  const range = (currentStatus.battery / 2.5).toFixed(1);
  elements.rangeValue.textContent = `~${range}`;
  
  // Speed
  elements.speedValue.textContent = currentStatus.speed;
  
  // Speed warning colors
  elements.speedValue.classList.remove('warning', 'danger');
  if (currentStatus.speed > 25) {
    elements.speedValue.classList.add('danger');
  } else if (currentStatus.speed > 20) {
    elements.speedValue.classList.add('warning');
  }
}

function updateBatteryIcon(battery) {
  const icon = elements.batteryIcon;
  icon.classList.remove('battery-low', 'battery-medium', 'battery-high');
  
  if (battery < 10) {
    icon.textContent = 'battery_0_bar';
    icon.classList.add('battery-low');
  } else if (battery < 25) {
    icon.textContent = 'battery_2_bar';
    icon.classList.add('battery-low');
  } else if (battery < 50) {
    icon.textContent = 'battery_3_bar';
    icon.classList.add('battery-medium');
  } else if (battery < 75) {
    icon.textContent = 'battery_4_bar';
    icon.classList.add('battery-medium');
  } else if (battery < 90) {
    icon.textContent = 'battery_5_bar';
    icon.classList.add('battery-high');
  } else {
    icon.textContent = 'battery_full';
    icon.classList.add('battery-high');
  }
}

// Send Command to Device
async function sendCommand(command) {
  if (!isConnected || !characteristic) {
    alert('Nincs csatlakozva az eszközhöz!');
    return;
  }
  
  console.log(`📤 Sending command: ${command}`);
  
  try {
    // Convert string to UTF-8 bytes
    const encoder = new TextEncoder();
    const data = encoder.encode(command);
    
    // Check if write with response is supported
    if (characteristic.properties.writeWithoutResponse) {
      await characteristic.writeValueWithoutResponse(data);
      console.log('✅ Command sent (without response)');
    } else {
      await characteristic.writeValueWithResponse(data);
      console.log('✅ Command sent (with response)');
    }
    
  } catch (error) {
    console.error('❌ Command error:', error);
    alert(`Parancs küldési hiba: ${error.message}`);
  }
}

// Toggle Lock
async function toggleLock() {
  const command = currentStatus.isUnlocked ? 'lock' : 'unlock';
  
  // Add visual feedback
  elements.lockBtn.disabled = true;
  
  await sendCommand(command);
  
  // Re-enable after delay
  setTimeout(() => {
    elements.lockBtn.disabled = false;
  }, 1000);
}

// Toggle Light
async function toggleLight() {
  const command = currentStatus.light ? 'lightoff' : 'lighton';
  await sendCommand(command);
}

// Service Worker Registration (for PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('✅ Service Worker registered'))
      .catch(err => console.log('⚠️ Service Worker registration failed:', err));
  });
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for debugging
window.LimerApp = {
  currentStatus,
  sendCommand,
  connectToDevice,
  disconnectDevice,
  isIOS,
  isBluefy
};

console.log('💚 Limer Web App loaded (iOS Compatible)');
