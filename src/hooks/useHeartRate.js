import { useEffect, useState, useRef } from 'react'
import API_BASE_URL from '../config/api'

const SERVER_URL = API_BASE_URL

export const useHeartRate = (pollingInterval = 1000) => {
  const [heartRate, setHeartRate] = useState(null)
  const [timestamp, setTimestamp] = useState(null)
  const [status, setStatus] = useState('Disconnected')
  const intervalRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    const fetchHeartRate = async () => {
      try {
        setStatus('Connecting...')
        const response = await fetch(`/api/heart-rate`)
        if (!response.ok) throw new Error('网络错误')
        const data = await response.json()
        if (!isMounted) return

        setHeartRate(data.heart_rate ?? null)
        setTimestamp(data.timestamp ?? null)
        setStatus(data.status ?? 'ok')
      } catch (error) {
        console.log(error)
        if (!isMounted) return
        setStatus('Connection Error')
      }
    }

    fetchHeartRate()
    intervalRef.current = setInterval(fetchHeartRate, pollingInterval)

    return () => {
      isMounted = false
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [pollingInterval])

  return { heartRate, timestamp, status }
}
