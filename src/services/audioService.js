import { AUDIO_CONFIG } from '../constants/health'

// Audio context and related variables
let audioContext = null
let currentOscillator = null
let isPlaying = false
let alertInterval = null

// Initialize Web Audio API
const initializeAudio = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      console.log('Audio context initialized')
      return true
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
      return false
    }
  }
  return true
}

// Create and play a beep sound
const playBeep = (frequency = 800, duration = 500, volume = 0.5) => {
  if (!initializeAudio()) {
    return
  }

  try {
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }

    // Create oscillator
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Configure oscillator
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
    oscillator.type = 'sine'

    // Configure gain (volume)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(
      volume,
      audioContext.currentTime + 0.01
    )
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration / 1000
    )

    // Start and stop oscillator
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration / 1000)

    return oscillator
  } catch (error) {
    console.error('Error playing beep:', error)
    return null
  }
}

// Play alert sound pattern
export const playAlertSound = (alertType = 'high') => {
  if (!initializeAudio()) {
    console.warn('Audio not available, using fallback')
    return
  }

  let frequency, pattern

  switch (alertType) {
    case 'low_heart_rate':
      frequency = 400
      pattern = [500, 200, 500, 200, 500] // Low frequency, slower pattern
      break
    case 'high_heart_rate':
      frequency = 800
      pattern = [200, 100, 200, 100, 200, 100, 200] // High frequency, fast pattern
      break
    default:
      frequency = 600
      pattern = [300, 150, 300]
  }

  // Play pattern of beeps
  let delay = 0
  pattern.forEach((duration, index) => {
    if (index % 2 === 0) {
      // Even indices are beeps
      setTimeout(() => {
        playBeep(frequency, duration, AUDIO_CONFIG.MAX_VOLUME * 0.7)
      }, delay)
    }
    delay += duration
  })
}

// Start continuous alert sound
export const startAlertSound = (alertType = 'high') => {
  if (isPlaying) {
    stopAlertSound() // Stop current alert first
  }

  isPlaying = true

  // Play immediate alert
  playAlertSound(alertType)

  // Set up interval for repeated alerts
  alertInterval = setInterval(() => {
    if (isPlaying) {
      playAlertSound(alertType)
    }
  }, AUDIO_CONFIG.ALERT_REPEAT_INTERVAL)

  console.log('Alert sound started:', alertType)
}

// Stop alert sound
export const stopAlertSound = () => {
  isPlaying = false

  // Clear interval
  if (alertInterval) {
    clearInterval(alertInterval)
    alertInterval = null
  }

  // Stop current oscillator if playing
  if (currentOscillator) {
    try {
      currentOscillator.stop()
      currentOscillator = null
    } catch (error) {
      // Oscillator might already be stopped
    }
  }

  console.log('Alert sound stopped')
}

// Check if alert sound is currently playing
export const isAlertSoundPlaying = () => {
  return isPlaying
}

// Test audio functionality
export const testAudio = () => {
  console.log('Testing audio...')
  playBeep(440, 500, 0.5) // Play A4 note for 500ms
}

// Cleanup function for component unmount
export const cleanupAudio = () => {
  stopAlertSound()

  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
}

// Initialize audio on first user interaction (required by browsers)
export const initializeAudioOnUserInteraction = () => {
  const initOnClick = () => {
    initializeAudio()
    document.removeEventListener('click', initOnClick)
    document.removeEventListener('touchstart', initOnClick)
  }

  document.addEventListener('click', initOnClick)
  document.addEventListener('touchstart', initOnClick)
}
