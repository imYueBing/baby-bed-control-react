import React from 'react'
import { useHeartRateMonitor } from '../hooks/useHeartRateMonitor'
import AlertBox from './UI/AlertBox'
import VideoFeed from './UI/VideoFeed'
import Footer from './UI/Footer'
import HeartRateAlertSound from './Sound/HeartRateAlertSound'
import './HealthMonitorApp.css'

const HealthMonitorApp = () => {
  // Use custom hook for heart rate monitoring and alerts
  const { heartRate, isAlert, alertType, heartRateColor } =
    useHeartRateMonitor()

  return (
    <div className='health-monitor-container'>
      <HeartRateAlertSound isAlert={isAlert} alertType={alertType} />
      <AlertBox visible={isAlert} alertType={alertType} />
      <VideoFeed
        heartRate={heartRate}
        heartRateColor={heartRateColor}
        alertType={alertType}
      />
      <Footer />
    </div>
  )
}

export default HealthMonitorApp
