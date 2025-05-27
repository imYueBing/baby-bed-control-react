import { VIBRATION_PATTERNS } from '../constants/health'

// Check if vibration is supported
const isVibrationSupported = () => {
  return 'vibrate' in navigator
}

// Global variables for vibration control
let vibrationInterval = null
let isVibrating = false

// Trigger single vibration feedback
export const triggerFeedback = (type = 'error') => {
  if (!isVibrationSupported()) {
    console.warn('Vibration not supported on this device')
    return
  }

  try {
    switch (type) {
      case 'error':
        navigator.vibrate(VIBRATION_PATTERNS.WEB)
        break
      case 'success':
        navigator.vibrate([200])
        break
      case 'warning':
        navigator.vibrate([400, 100, 400])
        break
      default:
        navigator.vibrate(VIBRATION_PATTERNS.WEB)
    }
  } catch (error) {
    console.error('Error triggering vibration:', error)
  }
}

// Start continuous vibration alert
export const startVibrationAlert = () => {
  if (!isVibrationSupported()) {
    console.warn('Vibration not supported on this device')
    return
  }

  if (isVibrating) {
    return // Already vibrating
  }

  isVibrating = true

  try {
    // Start with immediate vibration
    navigator.vibrate(VIBRATION_PATTERNS.URGENT)

    // Set up interval for repeated vibrations
    vibrationInterval = setInterval(() => {
      if (isVibrating) {
        navigator.vibrate(VIBRATION_PATTERNS.URGENT)
      }
    }, 2000) // Repeat every 2 seconds
  } catch (error) {
    console.error('Error starting vibration alert:', error)
    isVibrating = false
  }
}

// Stop vibration alert
export const stopVibrationAlert = () => {
  if (!isVibrationSupported()) {
    return
  }

  isVibrating = false

  try {
    // Stop current vibration
    navigator.vibrate(0)

    // Clear the interval
    if (vibrationInterval) {
      clearInterval(vibrationInterval)
      vibrationInterval = null
    }
  } catch (error) {
    console.error('Error stopping vibration alert:', error)
  }
}

// Check if currently vibrating
export const isCurrentlyVibrating = () => {
  return isVibrating
}

// Cleanup function for component unmount
export const cleanupVibration = () => {
  stopVibrationAlert()
}
