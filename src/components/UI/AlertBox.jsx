import React, { useEffect, useRef } from 'react'
import { ALERT_TYPES } from '../../constants/health'
import './AlertBox.css'

const AlertBox = ({ visible, alertType = ALERT_TYPES.HIGH_HEART_RATE }) => {
  const alertBoxRef = useRef(null)

  // Animate alert box when visibility changes
  useEffect(() => {
    if (alertBoxRef.current) {
      if (visible) {
        // Show animation
        alertBoxRef.current.classList.remove('alert-box-hidden')
        alertBoxRef.current.classList.add('alert-box-visible')
      } else {
        // Hide animation
        alertBoxRef.current.classList.remove('alert-box-visible')
        alertBoxRef.current.classList.add('alert-box-hidden')
      }
    }
  }, [visible])

  // If not visible, don't render
  if (!visible) return null

  // Get alert message based on alert type
  const getAlertMessage = () => {
    switch (alertType) {
      case ALERT_TYPES.LOW_HEART_RATE:
        return 'Heart rate is too low!'
      case ALERT_TYPES.HIGH_HEART_RATE:
        return 'Heart rate is too high!'
      default:
        return 'Heart rate is abnormal!'
    }
  }

  return (
    <div
      ref={alertBoxRef}
      className={`alert-box ${
        visible ? 'alert-box-visible' : 'alert-box-hidden'
      }`}
    >
      <div className='alert-text'>
        <span className='bold-text'>ALERT:</span> {getAlertMessage()}
      </div>
    </div>
  )
}

export default AlertBox
