import { useEffect, useState, useRef } from 'react'
import API_BASE_URL from '../config/api'

const SERVER_URL = API_BASE_URL

// Set default polling interval to 3 seconds
const DEFAULT_POLLING_INTERVAL = 3000
// Minimum polling interval is 1 second
const MIN_POLLING_INTERVAL = 1000

// Use mock data directly, no need to wait for API failure
const USE_MOCK_DATA_BY_DEFAULT = true

// Mock heart rate data generation function
const generateMockHeartRate = () => {
  // Generate random heart rate between 70-90, simulating normal range
  const baseRate = 80
  const variation = 10
  return Math.floor(baseRate + (Math.random() * 2 - 1) * variation)
}

/**
 * Heart rate monitoring hook
 * @param {number} pollingInterval - Polling interval (milliseconds)
 * @param {boolean} preferRealData - Whether to prioritize getting real data
 * @returns {Object} Heart rate data object
 */
export const useHeartRate = (
  pollingInterval = DEFAULT_POLLING_INTERVAL,
  preferRealData = false
) => {
  const [heartRate, setHeartRate] = useState(null)
  const [timestamp, setTimestamp] = useState(null)
  const [status, setStatus] = useState('Initializing...')
  const [usingMockData, setUsingMockData] = useState(!preferRealData)
  const intervalRef = useRef(null)

  // Ensure polling interval is not less than minimum
  const actualInterval = Math.max(pollingInterval, MIN_POLLING_INTERVAL)

  // Function to generate mock data
  const generateMockData = () => {
    const mockHeartRate = generateMockHeartRate()
    setHeartRate(mockHeartRate)
    setTimestamp(Date.now())
    setStatus('Mock Data')
    console.log(`🔄 Using mock heart rate data: ${mockHeartRate} BPM`)
  }

  // Function to fetch real data
  const fetchRealData = async () => {
    try {
      setStatus('Connecting...')
      console.log(`🔄 Requesting heart rate data...`)

      const response = await fetch(`/api/heart-rate`)

      if (!response.ok) throw new Error('Network error')
      const data = await response.json()

      setHeartRate(data.heart_rate ?? null)
      setTimestamp(data.timestamp ?? null)
      setStatus('Real-time Data')
      console.log(`✅ Heart rate data updated: ${data.heart_rate} BPM`)

      // Switch back to real data from mock data
      if (usingMockData) {
        setUsingMockData(false)
        console.log('🔄 Switching back to real data from mock data')
      }

      return true
    } catch (error) {
      console.log(`❌ Heart rate data request failed: ${error.message}`)

      // If not previously using mock data, switch to mock data now
      if (!usingMockData) {
        setUsingMockData(true)
        console.log('⚠️ Switching to mock heart rate data')
      }

      return false
    }
  }

  useEffect(() => {
    let isMounted = true
    console.log(
      `📊 Heart rate monitoring started, interval: ${actualInterval}ms, prefer real data: ${preferRealData}`
    )

    const updateHeartRate = async () => {
      if (!isMounted) return

      // If preferring real data, try to get real data first
      if (preferRealData) {
        const success = await fetchRealData()
        if (!success && isMounted) {
          generateMockData()
        }
      } else if (usingMockData) {
        // Otherwise, if currently using mock data, generate mock data directly
        generateMockData()
      } else {
        // If not currently using mock data, try to get real data
        const success = await fetchRealData()
        if (!success && isMounted) {
          generateMockData()
        }
      }
    }

    // Execute immediately
    updateHeartRate()

    // Set polling interval
    intervalRef.current = setInterval(updateHeartRate, actualInterval)
    console.log(
      `⏱️ Heart rate monitoring timer set, ID: ${intervalRef.current}`
    )

    // Cleanup function
    return () => {
      console.log(
        `🧹 Cleaning up heart rate monitoring, timer ID: ${intervalRef.current}`
      )
      isMounted = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [actualInterval, usingMockData, preferRealData])

  return {
    heartRate,
    timestamp,
    status,
    isMockData: usingMockData
  }
}
