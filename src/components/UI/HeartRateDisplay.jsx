import React, { useRef, useEffect } from 'react'
import { HEART_RATE_THRESHOLDS, ALERT_TYPES } from '../../constants/health'
import './HeartRateDisplay.css'

const HeartRateDisplay = ({ heartRate, heartRateColor, alertType }) => {
  // Reference for pulse animation
  const heartIconRef = useRef(null)

  // Create pulse animation when heart rate changes
  useEffect(() => {
    if (heartIconRef.current) {
      // Remove existing animation class
      heartIconRef.current.classList.remove('pulse-animation')

      // Force reflow
      heartIconRef.current.offsetHeight

      // Add animation class
      heartIconRef.current.classList.add('pulse-animation')
    }
  }, [heartRate])

  // Determine status text based on heart rate
  const getStatusText = () => {
    if (heartRate < HEART_RATE_THRESHOLDS.MIN_NORMAL) {
      return 'Too Low'
    } else if (heartRate > HEART_RATE_THRESHOLDS.MAX_NORMAL) {
      return 'Too High'
    } else {
      return 'Normal'
    }
  }

  // Determine if heart rate is normal
  const isNormal =
    heartRate >= HEART_RATE_THRESHOLDS.MIN_NORMAL &&
    heartRate <= HEART_RATE_THRESHOLDS.MAX_NORMAL

  const displayColor = heartRateColor || (isNormal ? '#4CAF50' : '#F44336')

  return (
    <div className='heart-rate-container'>
      <div className='top-row'>
        <span className='heart-rate-label'>Heart Rate:</span>
        <div
          ref={heartIconRef}
          className='heart-icon'
          style={{ backgroundColor: displayColor }}
        >
          <span className='heart-icon-text'>♥</span>
        </div>
      </div>

      <div className='bottom-row'>
        <span className='heart-rate-value' style={{ color: displayColor }}>
          {heartRate} BPM
        </span>
        <span className='status-text' style={{ color: displayColor }}>
          {getStatusText()}
        </span>
      </div>
    </div>
  )
}

export default HeartRateDisplay
