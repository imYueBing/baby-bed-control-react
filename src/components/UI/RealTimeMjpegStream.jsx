import React, { useState, useEffect, useRef, useCallback } from 'react'

const RealTimeMjpegStream = ({
  streamUrl,
  fallbackSrc = '/assets/baby.png',
  className = '',
  style = {},
  onStreamLoad,
  onStreamError,
  refreshRate = 100 // Refresh rate: milliseconds
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('Connecting...')
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)

  const generateRealTimeUrl = useCallback(() => {
    // Generate real-time URL with unique parameters each time
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const separator = streamUrl.includes('?') ? '&' : '?'
    return `${streamUrl}${separator}ts=${timestamp}&rnd=${random}&nocache=1&realtime=1`
  }, [streamUrl])

  const loadFrame = useCallback(async () => {
    try {
      const url = generateRealTimeUrl()

      // Create new image object to load the latest frame
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        if (canvasRef.current && imgRef.current) {
          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')

          // Set canvas dimensions to match container
          const container = imgRef.current.parentElement
          if (container) {
            canvas.width = container.clientWidth
            canvas.height = container.clientHeight

            // Draw the latest frame
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          }
        }

        if (isLoading) {
          setIsLoading(false)
          setConnectionStatus('Real-time connection normal')
          if (onStreamLoad) onStreamLoad()
        }
      }

      img.onerror = () => {
        throw new Error('Frame loading failed')
      }

      img.src = url
    } catch (error) {
      console.error('Real-time frame loading error:', error)
      setConnectionStatus('Connection error, retrying...')
    }
  }, [generateRealTimeUrl, isLoading, onStreamLoad])

  const startRealTimeStream = useCallback(() => {
    console.log('Starting real-time video stream...')
    setIsLoading(true)
    setHasError(false)
    setConnectionStatus('Initializing real-time stream...')

    // Load the first frame immediately
    loadFrame()

    // Set refresh interval for true real-time playback
    intervalRef.current = setInterval(() => {
      loadFrame()
    }, refreshRate)
  }, [loadFrame, refreshRate])

  const stopRealTimeStream = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const handleFallback = useCallback(() => {
    setHasError(true)
    setConnectionStatus('Using fallback image')
    stopRealTimeStream()

    if (imgRef.current && fallbackSrc) {
      imgRef.current.src = fallbackSrc
      imgRef.current.style.display = 'block'
    }
    if (canvasRef.current) {
      canvasRef.current.style.display = 'none'
    }

    if (onStreamError) onStreamError(new Error('Real-time stream unavailable'))
  }, [fallbackSrc, onStreamError, stopRealTimeStream])

  useEffect(() => {
    // Delayed start to avoid initial loading issues
    const startTimer = setTimeout(() => {
      startRealTimeStream()
    }, 500)

    // Monitor for errors and fall back after 5 seconds
    const errorTimer = setTimeout(() => {
      if (isLoading) {
        console.log('Real-time stream startup timeout, switching to fallback')
        handleFallback()
      }
    }, 8000)

    return () => {
      clearTimeout(startTimer)
      clearTimeout(errorTimer)
      stopRealTimeStream()
    }
  }, [
    streamUrl,
    startRealTimeStream,
    stopRealTimeStream,
    handleFallback,
    isLoading
  ])

  return (
    <div style={{ position: 'relative', ...style }}>
      {/* Status indicator */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: isLoading
            ? 'rgba(255, 193, 7, 0.9)'
            : hasError
            ? 'rgba(220, 38, 38, 0.9)'
            : 'rgba(40, 167, 69, 0.9)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '500',
          zIndex: 2
        }}
      >
        {isLoading ? '🔄' : hasError ? '⚠️' : '🔴'} {connectionStatus}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '20px 30px',
            borderRadius: '12px',
            fontSize: '16px',
            zIndex: 1,
            textAlign: 'center',
            fontWeight: '500'
          }}
        >
          <div style={{ marginBottom: '10px' }}>🎥</div>
          Starting real-time video stream...
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            Refresh rate: {1000 / refreshRate}fps
          </div>
        </div>
      )}

      {/* Canvas for real-time frame rendering */}
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: hasError ? 'none' : 'block',
          borderRadius: 'inherit'
        }}
      />

      {/* Fallback image */}
      <img
        ref={imgRef}
        alt='Baby monitor fallback image'
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: hasError ? 'block' : 'none',
          borderRadius: 'inherit'
        }}
      />
    </div>
  )
}

export default RealTimeMjpegStream
