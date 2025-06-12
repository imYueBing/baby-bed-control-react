import React, { useState } from 'react'
// import HeartRateMonitor from './HeartRateMonitor'
import HeartRateDisplay from './HeartRateDisplay'
import SimpleMjpegStream from './SimpleMjpegStream'
import StreamDiagnostics from './StreamDiagnostics'
import { API_ENDPOINTS } from '../../config/api'
import './VideoFeed.css'
import './MobileOptimizations.css'

const VideoFeed = () => {
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  const handleStreamLoad = () => {
    console.log('✅ Video stream connected successfully!')
    // Hide diagnostics tool after successful connection
    setShowDiagnostics(false)
  }

  const handleStreamError = error => {
    console.error('❌ Video stream connection failed:', error)
    console.log('💡 Please check:')
    console.log('   1. Camera server is running on 192.168.0.92:5000')
    console.log('   2. Network connection is normal')
    console.log('   3. Firewall is not blocking the connection')

    // Show diagnostics tool when connection fails
    setShowDiagnostics(true)
  }

  const sendBedControlRequest = async controlType => {
    // Use relative path to let Vite proxy handle CORS
    const endpoint = `/api/bed/${controlType}`
    console.log(`⬆️ Sending bed control request: ${endpoint}`)
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        // Handle HTTP error status
        const errorData = await response.json().catch(() => ({}))
        console.error(
          `❌ Request failed ${response.status}: ${response.statusText}`,
          errorData
        )
        alert(
          `Error: Failed to control bed (${response.status} - ${
            errorData.message || response.statusText
          })`
        )
        return
      }

      // Request successful
      const data = await response.json().catch(() => ({}))
      console.log('✅ Request successful:', data)
    } catch (error) {
      console.error('❌ Network or Fetch API error:', error)
      alert('Network error: Unable to connect to server to control bed.')
    }
  }

  // Define four control functions
  const handleLeftUpClick = () => {
    console.log('⬆️ Left up button clicked (left side of bed up)')
    sendBedControlRequest('left_up')
  }

  const handleLeftDownClick = () => {
    console.log('⬇️ Left down button clicked (left side of bed down)')
    sendBedControlRequest('left_down')
  }

  const handleRightUpClick = () => {
    console.log('⬆️ Right up button clicked (right side of bed up)')
    sendBedControlRequest('right_up')
  }

  const handleRightDownClick = () => {
    console.log('⬇️ Right down button clicked (right side of bed down)')
    sendBedControlRequest('right_down')
  }

  return (
    <>
      <div className='image-container'>
        {/* Left control buttons */}
        <div className='bed-controls left-controls'>
          <button
            className='arrow-button up-arrow'
            onClick={handleLeftUpClick}
            title='Left side of bed up'
          >
            ↑
          </button>
          <button
            className='arrow-button down-arrow'
            onClick={handleLeftDownClick}
            title='Left side of bed down'
          >
            ↓
          </button>
        </div>

        {/* Video stream */}
        <SimpleMjpegStream
          streamUrl={API_ENDPOINTS.VIDEO_STREAM}
          fallbackSrc='/assets/baby.png'
          className='baby-image'
          onStreamLoad={handleStreamLoad}
          onStreamError={handleStreamError}
        />

        {/* Right control buttons */}
        <div className='bed-controls right-controls'>
          <button
            className='arrow-button up-arrow'
            onClick={handleRightUpClick}
            title='Right side of bed up'
          >
            ↑
          </button>
          <button
            className='arrow-button down-arrow'
            onClick={handleRightDownClick}
            title='Right side of bed down'
          >
            ↓
          </button>
        </div>

        {/* Heart rate display component */}
        <HeartRateDisplay />
      </div>

      {/* Diagnostics tool - only shown when connection fails */}
      {showDiagnostics && (
        <StreamDiagnostics streamUrl={API_ENDPOINTS.VIDEO_STREAM} />
      )}
    </>
  )
}

export default VideoFeed
