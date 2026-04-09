const containerDiv = document.getElementById('containerDiv')
const startButton = document.getElementById('startButton')
const stopButton = document.getElementById('stopButton')

const colors = [
  '#FF0000',
  '#0000FF',
  '#800080',
  '#008000',
  '#FFFF00',
  '#FFA500'
]

const brightColors = [
  '#FF6347',
  '#1E90FF',
  '#DA70D6',
  '#32CD32',
  '#f7f773',
  '#FFD700'
]

colors.forEach((color, i) => {
  containerDiv.innerHTML += `
    <div id = "light-${i}" style="background-color: ${color}"></div>
  `
})

let intervals = []   // store all interval IDs
let timeouts = []    // optional: store timeouts if you want to clean them too

const startLights = () => {
  // Clear any existing timers first (avoid duplicates)
  intervals.forEach(clearInterval)
  timeouts.forEach(clearTimeout)
  intervals = []
  timeouts = []

  colors.forEach((color, i) => {
    const div = document.getElementById('light-' + i)
    if (i % 2 === 0) {
      const intervalId = setInterval(() => {
        div.style.backgroundColor = brightColors[i]
        const timeoutId = setTimeout(() => {
          div.style.backgroundColor = color
        }, 500)
        timeouts.push(timeoutId)
      }, 1000)
      intervals.push(intervalId)
    } else {
      // Odd lights: start after 500ms delay
      const timeoutId = setTimeout(() => {
        const intervalId = setInterval(() => {
          div.style.backgroundColor = brightColors[i]
          const innerTimeoutId = setTimeout(() => {
            div.style.backgroundColor = color
          }, 500)
          timeouts.push(innerTimeoutId)
        }, 1000)
        intervals.push(intervalId)
      }, 500)
      timeouts.push(timeoutId)
    }
  })
}

startButton.addEventListener('click', startLights)

stopButton.addEventListener('click', () => {
  intervals.forEach(clearInterval)
  timeouts.forEach(clearTimeout)
  intervals = []
  timeouts = []
})