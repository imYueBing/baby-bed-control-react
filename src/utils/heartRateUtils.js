import { HEART_RATE_THRESHOLDS } from '../constants/health'

// Generate random heart rate data (mock data)
export const generateRandomHeartRate = () => {
  return Math.floor(Math.random() * (180 - 40 + 1)) + 40
}

// Check if heart rate is abnormal
export const isHeartRateAbnormal = heartRate => {
  return (
    heartRate < HEART_RATE_THRESHOLDS.MIN_NORMAL ||
    heartRate > HEART_RATE_THRESHOLDS.MAX_NORMAL
  )
}

// Get heart rate color (based on heart rate status)
export const getHeartRateColor = heartRate => {
  return isHeartRateAbnormal(heartRate) ? 'red' : 'green'
}
