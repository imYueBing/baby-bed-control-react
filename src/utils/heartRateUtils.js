import { HEART_RATE_THRESHOLDS } from '../constants/health'

// 生成随机心率数据 (模拟数据)
export const generateRandomHeartRate = () => {
  return Math.floor(Math.random() * (180 - 40 + 1)) + 40
}

// 检查心率是否异常
export const isHeartRateAbnormal = heartRate => {
  return (
    heartRate < HEART_RATE_THRESHOLDS.MIN_NORMAL ||
    heartRate > HEART_RATE_THRESHOLDS.MAX_NORMAL
  )
}

// 获取心率颜色 (根据心率状态)
export const getHeartRateColor = heartRate => {
  return isHeartRateAbnormal(heartRate) ? 'red' : 'green'
}
