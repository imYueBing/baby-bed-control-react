// Heart rate threshold constants
export const HEART_RATE_THRESHOLDS = {
  MIN_NORMAL: 60, // Minimum normal heart rate
  MAX_NORMAL: 120 // Maximum normal heart rate
}

// Heart rate update interval (milliseconds)
export const HEART_RATE_UPDATE_INTERVAL = 3000

// Vibration pattern configuration (Web API compatible)
export const VIBRATION_PATTERNS = {
  // Web vibration pattern (shorter to conserve battery)
  WEB: [500, 200, 500],
  // Urgent pattern for critical alerts
  URGENT: [300, 100, 300, 100, 300, 100, 300]
}

// Audio configuration
export const AUDIO_CONFIG = {
  // Maximum attempts to initialize audio
  MAX_INIT_ATTEMPTS: 3,
  // Delay between repeated alerts (ms)
  ALERT_REPEAT_INTERVAL: 5000,
  // Cooldown between alerts when heart rate fluctuates (ms)
  ALERT_COOLDOWN: 5000,
  // Maximum volume (0-1)
  MAX_VOLUME: 1.0
}

// Alert types for different heart rate conditions
export const ALERT_TYPES = {
  LOW_HEART_RATE: 'low_heart_rate',
  HIGH_HEART_RATE: 'high_heart_rate',
  NORMAL: 'normal'
}

// Get alert type based on heart rate
export const getAlertType = heartRate => {
  if (heartRate < HEART_RATE_THRESHOLDS.MIN_NORMAL) {
    return ALERT_TYPES.LOW_HEART_RATE
  } else if (heartRate > HEART_RATE_THRESHOLDS.MAX_NORMAL) {
    return ALERT_TYPES.HIGH_HEART_RATE
  } else {
    return ALERT_TYPES.NORMAL
  }
}
