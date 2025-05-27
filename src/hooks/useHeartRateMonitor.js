import { useState, useEffect, useRef, useCallback } from 'react'
import {
  HEART_RATE_UPDATE_INTERVAL,
  AUDIO_CONFIG,
  ALERT_TYPES,
  getAlertType
} from '../constants/health'
import {
  generateRandomHeartRate,
  isHeartRateAbnormal,
  getHeartRateColor
} from '../utils/heartRateUtils'
import {
  startVibrationAlert,
  stopVibrationAlert,
  triggerFeedback
} from '../services/hapticService'
import {
  showUniqueAlert,
  isAlertCurrentlyActive
} from '../services/alertService'

export const useHeartRateMonitor = () => {
  const [heartRate, setHeartRate] = useState(80) // Default heart rate
  const [isAlert, setIsAlert] = useState(false) // Default no alert
  const [alertType, setAlertType] = useState(ALERT_TYPES.NORMAL)

  const alertIntervalRef = useRef(null)
  const lastAlertTimeRef = useRef(0)
  const alertCountRef = useRef(0)
  const isMountedRef = useRef(true)

  // Check for alert cooldown period
  const isInAlertCooldown = () => {
    return Date.now() - lastAlertTimeRef.current < AUDIO_CONFIG.ALERT_COOLDOWN
  }

  // Get alert message based on heart rate
  const getAlertMessage = useCallback(currentHeartRate => {
    const type = getAlertType(currentHeartRate)

    switch (type) {
      case ALERT_TYPES.LOW_HEART_RATE:
        return `Heart rate too low: ${currentHeartRate} bpm!`
      case ALERT_TYPES.HIGH_HEART_RATE:
        return `Heart rate too high: ${currentHeartRate} bpm!`
      default:
        return `Heart rate: ${currentHeartRate} bpm`
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false

      if (alertIntervalRef.current) {
        clearInterval(alertIntervalRef.current)
        alertIntervalRef.current = null
      }

      // Stop all vibrations
      stopVibrationAlert()
    }
  }, [])

  // Handle alert state change
  useEffect(() => {
    // Clear any existing alert interval
    if (alertIntervalRef.current) {
      clearInterval(alertIntervalRef.current)
      alertIntervalRef.current = null
    }

    // Reset alert count
    alertCountRef.current = 0

    // If no alert state, make sure to stop everything
    if (!isAlert) {
      stopVibrationAlert()
      return
    }

    // Set last alert time
    lastAlertTimeRef.current = Date.now()

    // Trigger vibration feedback first (immediate)
    triggerFeedback('error')

    // Define function to trigger the vibration alert
    const triggerAlert = async () => {
      if (!isAlert || !isMountedRef.current) return

      // Check for dialog cooldown
      if (isAlertCurrentlyActive() || isInAlertCooldown()) {
        console.log('Skipping alert dialog due to cooldown or active alert')
        // Still trigger vibration for tactile feedback
        startVibrationAlert()
        return
      }

      // Start vibration
      startVibrationAlert()

      // Show alert dialog if no other alert is active
      if (!isAlertCurrentlyActive()) {
        const alertMessage = getAlertMessage(heartRate)
        const alertTitle = 'Heart Rate Alert'

        showUniqueAlert(alertTitle, alertMessage)

        // Update last alert time
        lastAlertTimeRef.current = Date.now()
      }
    }

    // Trigger first alert immediately
    triggerAlert()

    // Set up alert interval for repeated alerts
    alertIntervalRef.current = setInterval(() => {
      if (!isAlert || !isMountedRef.current) return

      alertCountRef.current++
      console.log(`Alert repeat #${alertCountRef.current}`)
      triggerAlert()
    }, AUDIO_CONFIG.ALERT_REPEAT_INTERVAL)

    // Cleanup function
    return () => {
      if (alertIntervalRef.current) {
        clearInterval(alertIntervalRef.current)
        alertIntervalRef.current = null
      }
      stopVibrationAlert()
    }
  }, [isAlert, heartRate, getAlertMessage])

  // Monitor heart rate changes
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isMountedRef.current) return

      // Generate random heart rate data
      const newHeartRate = generateRandomHeartRate()
      setHeartRate(newHeartRate)

      // Check if heart rate is abnormal
      const isAbnormal = isHeartRateAbnormal(newHeartRate)
      const currentAlertType = getAlertType(newHeartRate)

      // Update alert type
      setAlertType(currentAlertType)

      // Only update alert state if status changed
      if (isAbnormal !== isAlert) {
        console.log(
          `Heart rate ${isAbnormal ? 'abnormal' : 'normal'}: ${newHeartRate}, ${
            isAbnormal ? 'triggering' : 'stopping'
          } alert`
        )
        setIsAlert(isAbnormal)
      }
    }, HEART_RATE_UPDATE_INTERVAL)

    return () => clearInterval(timer)
  }, [isAlert])

  return {
    heartRate,
    isAlert,
    alertType,
    heartRateColor: getHeartRateColor(heartRate)
  }
}
