const containerDiv = document.getElementById('containerDiv')
const startButton = document.getElementById('startButton')
const stopButton = document.getElementById('stopButton')
const addIntensity = document.getElementById('addIntensity')
const reduceIntensity = document.getElementById('reduceIntensity')
const speedValue = document.getElementById('speedValue')
const selectColor = document.querySelector('#selectCustomColor')
const colorInput = document.querySelectorAll('input[type="color"]')
const colorsInputDiv = document.querySelector('.colorsInputDiv')
const applyColorButton = document.getElementById('applyColors')

selectColor.addEventListener('click', () => {
  colorsInputDiv.classList.toggle('display')
  applyColorButton.classList.toggle('display')
  stopLights()
  addIntensity.disabled = true
  reduceIntensity.disabled = true
  startButton.disabled = true
  stopButton.disabled = true
})

applyColorButton.addEventListener('click', () => {
  colorsInputDiv.classList.toggle('display')
  applyColorButton.classList.toggle('display')
  updateControls()
})

colorInput.forEach((input, i) => {
  input.addEventListener('input', (event) => {
    const selectedColor = event.target.value
    colors[i] = selectedColor
    brightColors[i] = lightenHex(selectedColor, 30)
    console.log(colors[i])
  })
})

const colors = [
  '#FF0000',
  '#0000FF',
  '#800080',
  '#008000',
  '#FFFF00',
  '#FFA500',
  '#FF1493'
]

const brightColors = [
  '#FF6347',
  '#1E90FF',
  '#DA70D6',
  '#32CD32',
  '#f7f773',
  '#FFD700',
  '#FF69B4'
]

const MIN_CYCLE_DURATION = 100
const MAX_CYCLE_DURATION = 3000
const SPEED_STEP = 100

// These values control the current playback state of the lightshow.
let cycleDuration = 1000
let isRunning = false
let lightTimers = []

// Build the light bulbs once, then reuse the same elements while the show runs.
containerDiv.innerHTML = colors
  .map((color, i) => `<div id="light-${i}" style="background-color: ${color}"></div>`)
  .join('')

const lightElements = colors.map((_, i) => document.getElementById(`light-${i}`))

const getFlashDuration = () => Math.max(80, Math.min(cycleDuration - 20, Math.round(cycleDuration * 0.5)))

const getOffsetDelay = () => Math.round(cycleDuration / 2)

const clearLightTimers = () => {
  lightTimers.forEach(clearTimeout)
  lightTimers = []
}

const resetLights = () => {
  lightElements.forEach((light, i) => {
    light.style.backgroundColor = colors[i]
  })
}

const getSpeedLabel = () => {
  if (cycleDuration <= 500) return 'Very fast'
  if (cycleDuration <= 900) return 'Fast'
  if (cycleDuration <= 1500) return 'Normal'
  if (cycleDuration <= 2200) return 'Slow'
  return 'Very slow'
}

const updateControls = () => {
  speedValue.textContent = `${getSpeedLabel()} (${cycleDuration}ms)`
  addIntensity.disabled = cycleDuration <= MIN_CYCLE_DURATION
  reduceIntensity.disabled = cycleDuration >= MAX_CYCLE_DURATION
  startButton.disabled = isRunning
  stopButton.disabled = !isRunning
}

const scheduleLight = (index, delay) => {
  const light = lightElements[index]

  // Each bulb manages its own loop so we can restart the full show cleanly at a new speed.
  const runCycle = () => {
    if (!isRunning) return

    light.style.backgroundColor = brightColors[index]

    // First switch to the brighter color, then restore the base color after the flash duration.
    lightTimers[index] = setTimeout(() => {
      light.style.backgroundColor = colors[index]

      if (!isRunning) return

      // Queue the next flash using the latest speed value.
      lightTimers[index] = setTimeout(runCycle, cycleDuration - getFlashDuration())
    }, getFlashDuration())
  }

  lightTimers[index] = setTimeout(runCycle, delay)
}

const startLights = () => {
  clearLightTimers()
  resetLights()
  isRunning = true

  lightElements.forEach((_, i) => {
    const initialDelay = i % 2 === 0 ? 0 : getOffsetDelay()
    scheduleLight(i, initialDelay)
  })

  updateControls()
}

const stopLights = () => {
  isRunning = false
  clearLightTimers()
  resetLights()
  updateControls()
}

const changeSpeed = (delta) => {
  const nextDuration = Math.min(MAX_CYCLE_DURATION, Math.max(MIN_CYCLE_DURATION, cycleDuration + delta))

  if (nextDuration === cycleDuration) {
    return
  }

  cycleDuration = nextDuration

  // If the show is already running, restart once so every bulb uses the updated timing immediately.
  if (isRunning) {
    startLights()
    return
  }

  updateControls()
}

function lightenHex(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = (num >> 8 & 0x00FF) + amt,
    B = (num & 0x0000FF) + amt;

  return "#" + (0x1000000 + 
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1);
}

startButton.addEventListener('click', startLights)
stopButton.addEventListener('click', stopLights)
addIntensity.addEventListener('click', () => changeSpeed(-SPEED_STEP))
reduceIntensity.addEventListener('click', () => changeSpeed(SPEED_STEP))

updateControls()
