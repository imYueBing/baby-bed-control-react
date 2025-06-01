import React, { useRef, useEffect } from 'react'
import { useHeartRate } from '../../hooks/useHeartRate'
import { HEART_RATE_THRESHOLDS } from '../../constants/health'
import './HeartRateDisplay.css'

const HeartRateDisplay = ({ heartRateColor }) => {
  const { heartRate, timestamp, status } = useHeartRate()
  const heartIconRef = useRef(null)

  useEffect(() => {
    if (heartIconRef.current) {
      heartIconRef.current.classList.remove('pulse-animation')
      heartIconRef.current.offsetHeight
      heartIconRef.current.classList.add('pulse-animation')
    }
  }, [heartRate])

  const getStatusText = () => {
    if (heartRate === null) return 'Waiting...'
    if (heartRate < HEART_RATE_THRESHOLDS.MIN_NORMAL) return 'Too Low'
    if (heartRate > HEART_RATE_THRESHOLDS.MAX_NORMAL) return 'Too High'
    return 'Normal'
  }

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
          {heartRate !== null ? `${heartRate} BPM` : '—'}
        </span>
        <span className='status-text' style={{ color: displayColor }}>
          {getStatusText()}
        </span>
      </div>

      <div className='meta-row'>
        <small>Status: {status}</small>
        {timestamp && (
          <small>Time: {new Date(timestamp).toLocaleTimeString()}</small>
        )}
      </div>
    </div>
  )
}

export default HeartRateDisplay
