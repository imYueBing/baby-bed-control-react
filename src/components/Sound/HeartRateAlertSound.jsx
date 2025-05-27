import React, { useEffect } from 'react'
import {
  startAlertSound,
  stopAlertSound,
  initializeAudioOnUserInteraction
} from '../../services/audioService'

const HeartRateAlertSound = ({ isAlert, alertType }) => {
  // Initialize audio on component mount
  useEffect(() => {
    initializeAudioOnUserInteraction()
  }, [])

  // Handle alert sound based on alert state
  useEffect(() => {
    if (isAlert) {
      startAlertSound(alertType)
    } else {
      stopAlertSound()
    }

    // Cleanup on unmount
    return () => {
      stopAlertSound()
    }
  }, [isAlert, alertType])

  // This component doesn't render anything visible
  return null
}

export default HeartRateAlertSound
