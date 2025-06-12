import React, { useState, useEffect } from 'react'
import { useHeartRate } from '../hooks/useHeartRate'
import { HEART_RATE_THRESHOLDS, ALERT_TYPES } from '../constants/health'
import AlertBox from './UI/AlertBox'
import VideoFeed from './UI/VideoFeed'
import Footer from './UI/Footer'
import HeartRateAlertSound from './Sound/HeartRateAlertSound'
import './HealthMonitorApp.css'

const HealthMonitorApp = () => {
  // Use real WebSocket heart rate data
  const { heartRate, timestamp, status } = useHeartRate()

  // State management
  const [isAlert, setIsAlert] = useState(false)
  const [alertType, setAlertType] = useState(ALERT_TYPES.NORMAL)
  const [heartRateColor, setHeartRateColor] = useState('#4CAF50')

  // Update alert status based on heart rate data
  useEffect(() => {
    if (heartRate === null) {
      setIsAlert(false)
      setAlertType(ALERT_TYPES.NORMAL)
      setHeartRateColor('#999') // Gray indicates no data
      return
    }

    // Determine if heart rate is abnormal
    let newAlertType = ALERT_TYPES.NORMAL
    let newIsAlert = false
    let newColor = '#4CAF50' // Green indicates normal

    if (heartRate < HEART_RATE_THRESHOLDS.MIN_NORMAL) {
      newAlertType = ALERT_TYPES.LOW_HEART_RATE
      newIsAlert = true
      newColor = '#F44336' // Red indicates abnormal
    } else if (heartRate > HEART_RATE_THRESHOLDS.MAX_NORMAL) {
      newAlertType = ALERT_TYPES.HIGH_HEART_RATE
      newIsAlert = true
      newColor = '#F44336' // Red indicates abnormal
    }

    setAlertType(newAlertType)
    setIsAlert(newIsAlert)
    setHeartRateColor(newColor)

    // Display heart rate status in console
    if (newIsAlert) {
      console.log(
        `⚠️ Abnormal heart rate: ${heartRate} BPM (${
          newAlertType === ALERT_TYPES.LOW_HEART_RATE ? 'too low' : 'too high'
        })`
      )
    } else {
      console.log(`✅ Normal heart rate: ${heartRate} BPM`)
    }
  }, [heartRate])

  return (
    <div className='health-monitor-container'>
      <HeartRateAlertSound isAlert={isAlert} alertType={alertType} />
      <AlertBox visible={isAlert} alertType={alertType} />
      <VideoFeed />
      <Footer />
    </div>
  )
}

export default HealthMonitorApp
