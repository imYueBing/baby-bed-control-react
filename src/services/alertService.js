// Global state for tracking alerts
let currentAlert = null
let alertHistory = []

// Maximum number of alerts to keep in history
const MAX_ALERT_HISTORY = 10

// Check if an alert is currently active
export const isAlertCurrentlyActive = () => {
  return currentAlert !== null
}

// Show unique alert (prevent duplicate alerts)
export const showUniqueAlert = (title, message, options = {}) => {
  // Create alert ID based on title and message
  const alertId = `${title}-${message}`.replace(/\s+/g, '-').toLowerCase()

  // Check if same alert is already showing
  if (currentAlert && currentAlert.id === alertId) {
    console.log('Duplicate alert prevented:', alertId)
    return false
  }

  // Set current alert
  currentAlert = {
    id: alertId,
    title,
    message,
    timestamp: Date.now(),
    ...options
  }

  // Add to history
  alertHistory.unshift(currentAlert)
  if (alertHistory.length > MAX_ALERT_HISTORY) {
    alertHistory.pop()
  }

  // For web, we'll use a simple alert or could implement a custom modal
  // Using setTimeout to make it non-blocking
  setTimeout(() => {
    if (options.useConfirm) {
      const userResponse = window.confirm(`${title}\n\n${message}`)
      if (options.onResponse) {
        options.onResponse(userResponse)
      }
    } else {
      window.alert(`${title}\n\n${message}`)
    }

    // Clear current alert after showing
    clearCurrentAlert()
  }, 100)

  console.log('Alert shown:', { title, message, alertId })
  return true
}

// Clear current alert
export const clearCurrentAlert = () => {
  if (currentAlert) {
    console.log('Alert cleared:', currentAlert.id)
    currentAlert = null
  }
}

// Get current alert info
export const getCurrentAlert = () => {
  return currentAlert
}

// Get alert history
export const getAlertHistory = () => {
  return [...alertHistory]
}

// Clear alert history
export const clearAlertHistory = () => {
  alertHistory = []
  console.log('Alert history cleared')
}

// Check if specific alert was recently shown
export const wasAlertRecentlyShown = (title, message, timeWindow = 5000) => {
  const alertId = `${title}-${message}`.replace(/\s+/g, '-').toLowerCase()
  const cutoffTime = Date.now() - timeWindow

  return alertHistory.some(
    alert => alert.id === alertId && alert.timestamp > cutoffTime
  )
}

// Cleanup function for component unmount
export const cleanupAlerts = () => {
  clearCurrentAlert()
}
