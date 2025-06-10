import React, { useState, useEffect } from 'react'
import { useHeartRate } from '../hooks/useHeartRate'
import { HEART_RATE_THRESHOLDS, ALERT_TYPES } from '../constants/health'
import AlertBox from './UI/AlertBox'
import VideoFeed from './UI/VideoFeed'
import Footer from './UI/Footer'
import HeartRateAlertSound from './Sound/HeartRateAlertSound'
import './HealthMonitorApp.css'

const HealthMonitorApp = () => {
  // 使用真实的WebSocket心率数据
  const { heartRate, timestamp, status } = useHeartRate()

  // 状态管理
  const [isAlert, setIsAlert] = useState(false)
  const [alertType, setAlertType] = useState(ALERT_TYPES.NORMAL)
  const [heartRateColor, setHeartRateColor] = useState('#4CAF50')

  // 根据心率数据更新警报状态
  useEffect(() => {
    if (heartRate === null) {
      setIsAlert(false)
      setAlertType(ALERT_TYPES.NORMAL)
      setHeartRateColor('#999') // 灰色表示无数据
      return
    }

    // 判断心率是否异常
    let newAlertType = ALERT_TYPES.NORMAL
    let newIsAlert = false
    let newColor = '#4CAF50' // 绿色表示正常

    if (heartRate < HEART_RATE_THRESHOLDS.MIN_NORMAL) {
      newAlertType = ALERT_TYPES.LOW_HEART_RATE
      newIsAlert = true
      newColor = '#F44336' // 红色表示异常
    } else if (heartRate > HEART_RATE_THRESHOLDS.MAX_NORMAL) {
      newAlertType = ALERT_TYPES.HIGH_HEART_RATE
      newIsAlert = true
      newColor = '#F44336' // 红色表示异常
    }

    setAlertType(newAlertType)
    setIsAlert(newIsAlert)
    setHeartRateColor(newColor)

    // 在控制台显示心率状态
    if (newIsAlert) {
      console.log(
        `⚠️ 心率异常: ${heartRate} BPM (${
          newAlertType === ALERT_TYPES.LOW_HEART_RATE ? '过低' : '过高'
        })`
      )
    } else {
      console.log(`✅ 心率正常: ${heartRate} BPM`)
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
